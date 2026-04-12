<?php

namespace App\Http\Controllers;

use App\Enums\TenantStatus;
use App\Enums\UserStatus;
use App\Http\Requests\TestAssignmentRequest;
use App\Models\Tenant;
use App\Models\Test;
use App\Models\TestAssignment;
use App\Models\User;
use App\Services\AppNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TestAssignmentController extends Controller
{
    public function create(Request $request): Response
    {
        $this->authorize('create', TestAssignment::class);

        $user = $request->user();
        $isSuperAdmin = (bool) $user?->isSuperAdmin();
        $selectedTenantId = $isSuperAdmin ? ($request->integer('tenant_id') ?: null) : $user?->tenant_id;
        $selectedTestId = $request->integer('test_id') ?: null;

        $tenants = $isSuperAdmin
            ? Tenant::query()
                ->where('status', TenantStatus::Active)
                ->orderBy('name')
                ->get(['id', 'name', 'status'])
                ->map(fn (Tenant $tenant) => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'status' => $tenant->status instanceof \BackedEnum ? $tenant->status->value : (string) $tenant->status,
                ])
                ->values()
            : collect();

        $employees = collect();

        if ($selectedTenantId) {
            $employees = User::query()
                ->where('tenant_id', $selectedTenantId)
                ->where('status', UserStatus::Active)
                ->whereHas('roles', fn ($query) => $query->where('name', 'employee'))
                ->whereHas('employeeProfile')
                ->with(['employeeProfile.department:id,name'])
                ->orderBy('name')
                ->get(['id', 'tenant_id', 'name', 'email'])
                ->map(fn (User $employee) => [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'email' => $employee->email,
                    'department' => $employee->employeeProfile?->department?->name,
                    'job_title' => $employee->employeeProfile?->job_title,
                ])
                ->values();
        }

        $tests = Test::query()
            ->with('course:id,title')
            ->orderBy('title')
            ->get(['id', 'course_id', 'title', 'status', 'pass_mark'])
            ->map(fn (Test $test) => [
                'id' => $test->id,
                'title' => $test->title,
                'status' => $test->status instanceof \BackedEnum ? $test->status->value : (string) $test->status,
                'pass_mark' => $test->pass_mark,
                'course' => $test->course ? [
                    'id' => $test->course->id,
                    'title' => $test->course->title,
                ] : null,
            ])
            ->values();

        return Inertia::render('tests/assignments/create', [
            'tenants' => $tenants,
            'tests' => $tests,
            'employees' => $employees,
            'selectedTenantId' => $selectedTenantId,
            'selectedTestId' => $selectedTestId,
            'isSuperAdmin' => $isSuperAdmin,
        ]);
    }

    public function store(TestAssignmentRequest $request, Test $test): RedirectResponse
    {
        $this->authorize('create', TestAssignment::class);
        $this->authorize('view', $test);

        $assigneeIds = collect($request->input('assigned_to_user_ids', []))
            ->map(static fn ($id) => (int) $id)
            ->filter()
            ->values();

        if ($assigneeIds->isEmpty() && $request->filled('assigned_to_user_id')) {
            $assigneeIds = collect([(int) $request->integer('assigned_to_user_id')]);
        }

        $assignees = User::query()
            ->whereIn('id', $assigneeIds->all())
            ->get();

        abort_if($assignees->count() !== $assigneeIds->count(), 404);

        if ($request->filled('tenant_id')) {
            $selectedTenantId = $request->integer('tenant_id');
            $outsideSelectedTenant = $assignees->contains(
                fn (User $assignee) => (int) $assignee->tenant_id !== $selectedTenantId
            );

            if ($outsideSelectedTenant) {
                throw ValidationException::withMessages([
                    'assigned_to_user_ids' => 'Selected employees must belong to the selected tenant.',
                ]);
            }
        }

        if (! $request->user()?->isSuperAdmin()) {
            $outsideTenant = $assignees->contains(
                fn (User $assignee) => (int) $assignee->tenant_id !== (int) $request->user()?->tenant_id
            );

            abort_if($outsideTenant, 403);
        }

        $createdCount = 0;

        foreach ($assignees as $assignee) {
            $assignment = TestAssignment::query()->updateOrCreate(
                [
                    'test_id' => $test->id,
                    'assigned_to_user_id' => $assignee->id,
                ],
                [
                    'tenant_id' => $assignee->tenant_id,
                    'assigned_by' => $request->user()?->id,
                    'assigned_at' => now(),
                    'due_date' => $request->input('due_date'),
                    'status' => $request->input('status', 'assigned'),
                ]
            );

            $createdCount++;

            app(\App\Services\AuditLogService::class)->logModelCreated('test_assignment_created', $assignment);

            app(AppNotificationService::class)->sendToUser(
                $assignee,
                'test_assignment_created',
                'New test assigned',
                sprintf('You have been assigned %s.', $test->title),
                route('tests.show', ['test' => $test->id, 'tab' => 'overview'], false),
                ['test_id' => $test->id, 'test_assignment_id' => $assignment->id]
            );
        }

        return redirect()
            ->route('tests.show', ['test' => $test->id, 'tab' => 'assignments'])
            ->with('success', $createdCount === 1 ? 'Test assigned successfully.' : "Test assigned successfully to {$createdCount} employees.");
    }

    public function destroy(Test $test, TestAssignment $assignment): RedirectResponse
    {
        $this->authorize('delete', $assignment);
        $this->authorize('view', $test);

        abort_unless((int) $assignment->test_id === (int) $test->id, 404);

        $oldValues = $assignment->toArray();
        $assignment->delete();
        app(\App\Services\AuditLogService::class)->logModelDeleted('test_assignment_deleted', $assignment, $oldValues);

        return redirect()
            ->route('tests.show', ['test' => $test->id, 'tab' => 'assignments'])
            ->with('success', 'Test assignment removed.');
    }
}
