<?php

namespace App\Http\Controllers;

use App\Enums\TenantStatus;
use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\TenantUpdateRequest;
use App\Models\ComplianceSubmission;
use App\Models\EvidenceFile;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TenantController extends Controller
{
    use InteractsWithIndexTables;

    public function index(Request $request): Response|StreamedResponse
    {
        $this->authorize('viewAny', Tenant::class);

        $filters = $this->validateIndex($request, ['name', 'status', 'industry', 'company_size', 'created_at', 'updated_at'], [
            'status' => ['nullable', 'string'],
            'industry' => ['nullable', 'string', 'max:255'],
        ]);

        $query = Tenant::query()->withCount(['users', 'departments']);
        $this->applySearch($query, $filters['search'] ?? null, ['name', 'industry', 'contact_email', 'registration_number', 'contact_name']);
        $this->applyFilters($query, $filters, [
            'status' => 'status',
            'industry' => 'industry',
        ]);
        $this->applySort($query, [
            'name' => 'name',
            'status' => 'status',
            'industry' => 'industry',
            'company_size' => 'company_size',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
        ], $filters['sort'] ?? null, $filters['direction'] ?? null);

        if ($this->wantsExport($filters)) {
            $rows = $query->get()->map(fn (Tenant $tenant) => [
                $tenant->name,
                $tenant->industry ?: 'Unspecified',
                $tenant->company_size ?: 'Unknown',
                $tenant->registration_number ?: 'N/A',
                $tenant->contact_name ?: 'N/A',
                $tenant->contact_email ?: 'N/A',
                $tenant->status->value,
            ])->all();

            return $this->exportTable('tenants.xlsx', ['Name', 'Industry', 'Size', 'Registration', 'Contact Name', 'Contact Email', 'Status'], $rows);
        }

        return Inertia::render('tenants/index', [
            'tenants' => $query->paginate($this->perPage($filters))->withQueryString(),
            'filters' => $filters,
            'stats' => [
                'total' => Tenant::query()->count(),
                'pending' => Tenant::query()->where('status', TenantStatus::Pending)->count(),
                'active' => Tenant::query()->where('status', TenantStatus::Active)->count(),
                'suspended' => Tenant::query()->where('status', TenantStatus::Suspended)->count(),
            ],
            'industries' => Tenant::query()->whereNotNull('industry')->distinct()->orderBy('industry')->pluck('industry')->values(),
        ]);
    }

    public function show(Tenant $tenant): Response
    {
        $this->authorize('view', $tenant);

        $tenant->load([
            'users.roles',
            'users.employeeProfile.department',
            'departments' => fn ($query) => $query->withCount('employeeProfiles')->orderBy('name'),
        ])->loadCount([
            'users',
            'departments',
            'submissions',
        ]);

        $submissions = ComplianceSubmission::query()
            ->where('tenant_id', $tenant->id)
            ->with(['framework:id,name', 'score'])
            ->latest()
            ->get();

        $latestScoredSubmission = $submissions->first(fn (ComplianceSubmission $submission) => $submission->score !== null);
        $averageScore = $submissions
            ->filter(fn (ComplianceSubmission $submission) => $submission->score !== null)
            ->avg(fn (ComplianceSubmission $submission) => (float) $submission->score->overall_score);

        $evidenceStats = EvidenceFile::query()
            ->where('tenant_id', $tenant->id)
            ->selectRaw('review_status, COUNT(*) as aggregate')
            ->groupBy('review_status')
            ->pluck('aggregate', 'review_status');

        $roleMix = User::query()
            ->where('tenant_id', $tenant->id)
            ->with('roles')
            ->get()
            ->flatMap->roles
            ->countBy('name');

        return Inertia::render('tenants/show', [
            'tenant' => $tenant,
            'stats' => [
                'users' => $tenant->users_count,
                'activeUsers' => $tenant->users->filter(fn (User $user) => $user->status?->value === 'active')->count(),
                'invitedUsers' => $tenant->users->filter(fn (User $user) => $user->status?->value === 'invited')->count(),
                'departments' => $tenant->departments_count,
                'submissions' => $tenant->submissions_count,
                'submittedSubmissions' => $submissions->filter(fn (ComplianceSubmission $submission) => $submission->status?->value === 'submitted')->count(),
                'scoredSubmissions' => $submissions->filter(fn (ComplianceSubmission $submission) => $submission->score !== null)->count(),
                'averageScore' => $averageScore ? round($averageScore, 1) : null,
                'latestScore' => $latestScoredSubmission?->score?->overall_score,
                'latestRating' => $latestScoredSubmission?->score?->rating?->value,
                'pendingEvidence' => (int) ($evidenceStats['pending'] ?? 0),
                'approvedEvidence' => (int) ($evidenceStats['approved'] ?? 0),
                'rejectedEvidence' => (int) ($evidenceStats['rejected'] ?? 0),
            ],
            'compliance' => [
                'score' => $latestScoredSubmission?->score?->overall_score,
                'rating' => $latestScoredSubmission?->score?->rating?->value,
                'calculated_at' => $latestScoredSubmission?->score?->calculated_at,
                'sections' => $latestScoredSubmission?->sectionScores()
                    ->with('section:id,name')
                    ->orderByDesc('score')
                    ->get()
                    ->map(fn ($sectionScore) => [
                        'id' => $sectionScore->id,
                        'name' => $sectionScore->section?->name,
                        'score' => $sectionScore->score,
                        'rating' => $sectionScore->rating?->value,
                    ])
                    ->values() ?? [],
            ],
            'roleMix' => [
                'company_admin' => (int) ($roleMix['company_admin'] ?? 0),
                'reviewer' => (int) ($roleMix['reviewer'] ?? 0),
                'employee' => (int) ($roleMix['employee'] ?? 0),
            ],
            'recentSubmissions' => $submissions->take(5)->map(fn (ComplianceSubmission $submission) => [
                'id' => $submission->id,
                'title' => $submission->title,
                'status' => $submission->status->value,
                'framework' => $submission->framework?->name,
                'reporting_period' => $submission->reporting_period,
                'submitted_at' => $submission->submitted_at,
                'score' => $submission->score?->overall_score,
                'rating' => $submission->score?->rating?->value,
            ])->values(),
        ]);
    }

    public function edit(Tenant $tenant): Response
    {
        $this->authorize('update', $tenant);

        return Inertia::render('tenants/edit', [
            'tenant' => $tenant,
        ]);
    }

    public function update(TenantUpdateRequest $request, Tenant $tenant): RedirectResponse
    {
        $this->authorize('update', $tenant);

        $tenant->update($request->validated());

        return back()->with('success', 'Tenant updated.');
    }

    public function destroy(Tenant $tenant): RedirectResponse
    {
        $this->authorize('delete', $tenant);

        try {
            $tenant->delete();
        } catch (\Throwable $e) {
            Log::error('Tenant deletion failed', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to delete tenant. Please try again.');
        }

        return redirect()->route('tenants.index')->with('success', 'Tenant deleted.');
    }
}
