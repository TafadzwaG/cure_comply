<?php

namespace Tests\Feature;

use App\Enums\PolicyAssignmentStatus;
use App\Enums\PolicyState;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\LibraryFile;
use App\Models\LibraryFileVersion;
use App\Models\PolicyAssignment;
use App\Models\Tenant;
use App\Models\User;
use App\Notifications\GenericActionMailNotification;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PolicyAcknowledgmentFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('private');
        Notification::fake();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_publishing_a_library_file_creates_policy_version_one(): void
    {
        $superAdmin = $this->superAdmin();
        $file = $this->storedLibraryFile();

        $this->actingAs($superAdmin)
            ->post(route('files.policy.publish', $file))
            ->assertRedirect();

        $file->refresh();

        $this->assertTrue($file->is_policy);
        $this->assertSame(PolicyState::Published, $file->policy_state);
        $this->assertSame(1, $file->current_policy_version_number);
        $this->assertDatabaseHas('library_file_versions', [
            'library_file_id' => $file->id,
            'version_number' => 1,
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'policy_published',
            'entity_type' => LibraryFile::class,
            'entity_id' => $file->id,
        ]);
    }

    public function test_republish_clones_prior_assignees_to_new_version_with_new_due_date(): void
    {
        $superAdmin = $this->superAdmin();
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $employee = $this->tenantUser($tenant, 'employee');
        $file = $this->publishedPolicy($superAdmin);

        $this->actingAs($superAdmin)
            ->post(route('policy-assignments.store'), [
                'library_file_id' => $file->id,
                'assigned_to_user_ids' => [$employee->id],
                'department_ids' => [],
                'due_date' => now()->addDays(5)->toDateString(),
            ])
            ->assertRedirect();

        $oldVersionId = $file->refresh()->current_policy_version_id;

        $this->actingAs($superAdmin)
            ->post(route('files.policy.republish', $file), [
                'due_date' => now()->addDays(14)->toDateString(),
            ])
            ->assertRedirect();

        $file->refresh();

        $this->assertSame(2, $file->current_policy_version_number);
        $this->assertDatabaseCount('library_file_versions', 2);
        $this->assertDatabaseHas('policy_assignments', [
            'library_file_version_id' => $oldVersionId,
            'assigned_to_user_id' => $employee->id,
        ]);
        $newAssignment = PolicyAssignment::query()
            ->where('library_file_version_id', $file->current_policy_version_id)
            ->where('assigned_to_user_id', $employee->id)
            ->first();

        $this->assertNotNull($newAssignment);
        $this->assertSame(now()->addDays(14)->toDateString(), optional($newAssignment->due_date)->toDateString());
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'policy_republished',
            'entity_type' => LibraryFile::class,
            'entity_id' => $file->id,
        ]);
    }

    public function test_company_admin_can_only_assign_policies_inside_own_tenant(): void
    {
        $superAdmin = $this->superAdmin();
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $otherTenant = Tenant::factory()->create(['status' => 'active']);
        $companyAdmin = $this->tenantUser($tenant, 'company_admin');
        $employee = $this->tenantUser($tenant, 'employee');
        $otherEmployee = $this->tenantUser($otherTenant, 'employee');
        $file = $this->publishedPolicy($superAdmin);

        $this->actingAs($companyAdmin)
            ->post(route('policy-assignments.store'), [
                'library_file_id' => $file->id,
                'assigned_to_user_ids' => [$otherEmployee->id],
                'department_ids' => [],
                'due_date' => now()->addDays(5)->toDateString(),
            ])
            ->assertSessionHasErrors('assigned_to_user_ids');

        $this->actingAs($companyAdmin)
            ->post(route('policy-assignments.store'), [
                'library_file_id' => $file->id,
                'assigned_to_user_ids' => [$employee->id],
                'department_ids' => [],
                'due_date' => now()->addDays(5)->toDateString(),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('policy_assignments', [
            'assigned_to_user_id' => $employee->id,
            'tenant_id' => $tenant->id,
        ]);
    }

    public function test_assignee_must_open_before_acknowledging_and_open_records_view_state(): void
    {
        $superAdmin = $this->superAdmin();
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $employee = $this->tenantUser($tenant, 'employee');
        $file = $this->publishedPolicy($superAdmin);

        $this->actingAs($superAdmin)
            ->post(route('policy-assignments.store'), [
                'library_file_id' => $file->id,
                'assigned_to_user_ids' => [$employee->id],
                'department_ids' => [],
                'due_date' => now()->addDays(3)->toDateString(),
            ])
            ->assertRedirect();

        $assignment = PolicyAssignment::query()->firstOrFail();

        $this->actingAs($employee)
            ->post(route('policy-assignments.acknowledge', $assignment), [
                'confirmed' => true,
            ])
            ->assertSessionHasErrors('confirmed');

        $this->actingAs($employee)
            ->get(route('policy-assignments.open', $assignment))
            ->assertOk()
            ->assertDownload($file->original_name);

        $assignment->refresh();

        $this->assertSame(1, $assignment->view_count);
        $this->assertNotNull($assignment->first_viewed_at);
        $this->assertSame(PolicyAssignmentStatus::Viewed, $assignment->status);

        $this->actingAs($employee)
            ->post(route('policy-assignments.acknowledge', $assignment), [
                'confirmed' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('policy_assignments', [
            'id' => $assignment->id,
            'status' => PolicyAssignmentStatus::Acknowledged->value,
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'policy_acknowledged',
            'entity_type' => PolicyAssignment::class,
            'entity_id' => $assignment->id,
        ]);
    }

    public function test_overdue_reminder_command_marks_assignment_overdue_and_only_sends_once_per_day(): void
    {
        $superAdmin = $this->superAdmin();
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $employee = $this->tenantUser($tenant, 'employee');
        $file = $this->publishedPolicy($superAdmin);

        $version = LibraryFileVersion::query()->where('library_file_id', $file->id)->firstOrFail();
        $assignment = PolicyAssignment::query()->create([
            'tenant_id' => $tenant->id,
            'library_file_id' => $file->id,
            'library_file_version_id' => $version->id,
            'assigned_to_user_id' => $employee->id,
            'assigned_by' => $superAdmin->id,
            'source_type' => 'user',
            'due_date' => now()->subDay()->toDateString(),
            'status' => PolicyAssignmentStatus::Pending,
            'view_count' => 0,
        ]);

        $this->artisan('policies:send-overdue-reminders')->assertSuccessful();
        $this->artisan('policies:send-overdue-reminders')->assertSuccessful();

        $assignment->refresh();

        $this->assertSame(PolicyAssignmentStatus::Overdue, $assignment->status);
        $this->assertNotNull($assignment->last_reminded_at);
        $this->assertDatabaseCount('app_notifications', 1);
        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $employee->id,
            'type' => 'policy_overdue',
        ]);
        Notification::assertSentOnDemand(GenericActionMailNotification::class);
    }

    public function test_my_policies_workspace_only_shows_current_users_assignments(): void
    {
        $superAdmin = $this->superAdmin();
        $tenant = Tenant::factory()->create(['status' => 'active']);
        $employee = $this->tenantUser($tenant, 'employee');
        $otherEmployee = $this->tenantUser($tenant, 'reviewer');
        $file = $this->publishedPolicy($superAdmin);

        $this->actingAs($superAdmin)->post(route('policy-assignments.store'), [
            'library_file_id' => $file->id,
            'assigned_to_user_ids' => [$employee->id, $otherEmployee->id],
            'department_ids' => [],
            'due_date' => now()->addDays(10)->toDateString(),
        ]);

        $this->actingAs($employee)
            ->get(route('policies.index', ['tab' => 'my']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('policies/index')
                ->has('myPolicies.data', 1)
                ->where('myPolicies.data.0.policy_title', $file->title)
            );
    }

    protected function superAdmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('super_admin');

        return $user;
    }

    protected function tenantUser(Tenant $tenant, string $role): User
    {
        $department = Department::factory()->create([
            'tenant_id' => $tenant->id,
        ]);

        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
        ]);
        $user->assignRole($role);

        EmployeeProfile::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'department_id' => $department->id,
            'job_title' => ucfirst(str_replace('_', ' ', $role)),
            'branch' => 'Harare',
            'phone' => '+263771000321',
        ]);

        return $user;
    }

    protected function storedLibraryFile(): LibraryFile
    {
        Storage::disk('private')->put('library-files/shared/policy.pdf', 'policy body');

        return LibraryFile::factory()->create([
            'title' => 'CDPA Chapter 12:07',
            'original_name' => 'cdpa.pdf',
            'file_path' => 'library-files/shared/policy.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 1024,
            'uploaded_by' => User::factory()->create()->id,
        ]);
    }

    protected function publishedPolicy(User $superAdmin): LibraryFile
    {
        $file = $this->storedLibraryFile();

        $this->actingAs($superAdmin)
            ->post(route('files.policy.publish', $file))
            ->assertRedirect();

        return $file->fresh();
    }
}
