<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\EmployeeProfileRequest;
use App\Models\AuditLog;
use App\Models\ComplianceResponse;
use App\Models\CourseAssignment;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\EvidenceFile;
use App\Models\TestAttempt;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EmployeeProfileController extends Controller
{
    use InteractsWithIndexTables;

    public function index(Request $request): Response|StreamedResponse
    {
        $this->authorize('viewAny', EmployeeProfile::class);

        $filters = $this->validateIndex($request, ['name', 'status', 'department', 'created_at', 'updated_at'], [
            'status' => ['nullable', 'string'],
            'department_id' => ['nullable', 'integer'],
            'role' => ['nullable', 'string'],
            'risk_level' => ['nullable', 'string'],
            'overdue' => ['nullable', 'string'],
        ]);

        $query = EmployeeProfile::query()->with([
            'user.roles',
            'department',
            'manager:id,name,email',
        ]);

        $this->applySearch($query, $filters['search'] ?? null, ['user.name', 'user.email', 'job_title', 'employee_number', 'branch']);
        $this->applyFilters($query, $filters, [
            'status' => 'status',
            'department_id' => 'department_id',
            'risk_level' => 'risk_level',
            'role' => fn ($builder, $value) => $builder->whereHas('user.roles', fn ($roleQuery) => $roleQuery->where('name', $value)),
            'overdue' => fn ($builder, $value) => $value === 'yes'
                ? $builder->whereHas('user.assignedCourses', fn ($assignmentQuery) => $assignmentQuery
                    ->whereDate('due_date', '<', now())
                    ->whereNotIn('status', ['completed']))
                : $builder,
        ]);
        $this->applySort($query, [
            'status' => 'status',
            'created_at' => 'created_at',
            'updated_at' => 'updated_at',
            'name' => fn ($builder, $direction) => $builder->join('users', 'users.id', '=', 'employee_profiles.user_id')
                ->orderBy('users.name', $direction)
                ->select('employee_profiles.*'),
            'department' => fn ($builder, $direction) => $builder->leftJoin('departments', 'departments.id', '=', 'employee_profiles.department_id')
                ->orderBy('departments.name', $direction)
                ->select('employee_profiles.*'),
            'last_login' => fn ($builder, $direction) => $builder->join('users', 'users.id', '=', 'employee_profiles.user_id')
                ->orderBy('users.last_login_at', $direction)
                ->select('employee_profiles.*'),
        ], $filters['sort'] ?? null, $filters['direction'] ?? null);

        if ($this->wantsExport($filters)) {
            $rows = $query->get()->map(fn (EmployeeProfile $profile) => [
                $profile->user?->name,
                $profile->user?->email,
                $profile->department?->name ?: 'Unassigned',
                $profile->job_title ?: 'Not set',
                $profile->employment_type ?: 'Not set',
                $profile->risk_level ?: 'Unscored',
                $profile->user?->last_login_at?->format('Y-m-d H:i') ?: 'Never',
                $profile->status->value,
            ])->all();

            return $this->exportTable('employees.xlsx', ['Name', 'Email', 'Department', 'Job Title', 'Employment Type', 'Risk Level', 'Last Login', 'Status'], $rows);
        }

        $paginated = $query->paginate($this->perPage($filters))->withQueryString();

        $userIds = $paginated->getCollection()->pluck('user_id')->filter()->unique()->values();

        $assignmentCounts = CourseAssignment::query()
            ->whereIn('assigned_to_user_id', $userIds)
            ->selectRaw('assigned_to_user_id, COUNT(*) as total, SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as completed, SUM(CASE WHEN due_date < ? AND status != ? THEN 1 ELSE 0 END) as overdue', ['completed', now()->toDateString(), 'completed'])
            ->groupBy('assigned_to_user_id')
            ->get()
            ->keyBy('assigned_to_user_id');

        $latestAttempts = TestAttempt::query()
            ->whereIn('user_id', $userIds)
            ->selectRaw('user_id, MAX(percentage) as latest_percentage')
            ->groupBy('user_id')
            ->pluck('latest_percentage', 'user_id');

        $employees = $paginated->through(function (EmployeeProfile $profile) use ($assignmentCounts, $latestAttempts) {
            $counts = $assignmentCounts->get($profile->user_id);
            $total = (int) ($counts?->total ?? 0);
            $completed = (int) ($counts?->completed ?? 0);

            return [
                ...$profile->toArray(),
                'training_completion_percentage' => $total > 0 ? (int) round(($completed / $total) * 100) : 0,
                'overdue_assignments_count' => (int) ($counts?->overdue ?? 0),
                'latest_test_percentage' => $latestAttempts->get($profile->user_id),
                'last_login_at' => $profile->user?->last_login_at,
                'manager_name' => $profile->manager?->name,
            ];
        });

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
            'filters' => $filters,
            'stats' => [
                'total' => EmployeeProfile::query()->count(),
                'active' => EmployeeProfile::query()->where('status', 'active')->count(),
                'invited' => EmployeeProfile::query()->where('status', 'invited')->count(),
                'departments' => Department::query()->count(),
                'overdue' => CourseAssignment::query()->whereDate('due_date', '<', now())->whereNotIn('status', ['completed'])->count(),
                'avgTestScore' => round((float) TestAttempt::query()->avg('percentage')),
            ],
        ]);
    }

    public function show(EmployeeProfile $employeeProfile): Response
    {
        $this->authorize('view', $employeeProfile);

        $employeeProfile->load([
            'user.roles.permissions',
            'user.permissions',
            'user.tenant:id,name',
            'department',
            'tenant:id,name',
            'manager:id,name,email',
            'directReports.user:id,name,email',
        ]);

        $user = $employeeProfile->user;
        $userId = $employeeProfile->user_id;

        $assignments = CourseAssignment::query()
            ->with('course:id,title')
            ->where('assigned_to_user_id', $userId)
            ->latest('assigned_at')
            ->get();

        $testAttempts = TestAttempt::query()
            ->with('test:id,title')
            ->where('user_id', $userId)
            ->latest('submitted_at')
            ->get();

        $responses = ComplianceResponse::query()
            ->with(['submission.framework:id,name', 'question:id,question_text'])
            ->where('answered_by', $userId)
            ->latest('answered_at')
            ->get();

        $evidenceUploads = EvidenceFile::query()
            ->with('submission.framework:id,name')
            ->where('uploaded_by', $userId)
            ->latest('uploaded_at')
            ->get();

        $reviewActivity = $user?->hasRole('reviewer')
            ? $user->evidenceReviews()->with('evidenceFile:id,original_name,review_status')->latest('reviewed_at')->get()
            : collect();

        $recentActivity = AuditLog::query()
            ->where('user_id', $userId)
            ->latest('created_at')
            ->limit(10)
            ->get();

        return Inertia::render('employees/show', [
            'employee' => [
                ...$employeeProfile->toArray(),
                'user' => $user ? $user->toArray() : [
                    'id' => $userId,
                    'tenant_id' => $employeeProfile->tenant_id,
                    'name' => 'Missing user record',
                    'email' => 'Unavailable',
                    'status' => $employeeProfile->status?->value ?? $employeeProfile->status,
                    'roles' => [],
                    'permissions' => [],
                    'tenant' => $employeeProfile->tenant ? [
                        'id' => $employeeProfile->tenant->id,
                        'name' => $employeeProfile->tenant->name,
                    ] : null,
                    'last_login_at' => null,
                    'last_password_changed_at' => null,
                    'created_at' => $employeeProfile->created_at,
                    'updated_at' => $employeeProfile->updated_at,
                ],
                'summary' => [
                    'assigned_courses' => $assignments->count(),
                    'completed_courses' => $assignments->filter(fn (CourseAssignment $assignment) => $assignment->status?->value === 'completed')->count(),
                    'overdue_courses' => $assignments->filter(fn (CourseAssignment $assignment) => $assignment->due_date && $assignment->due_date->isPast() && $assignment->status?->value !== 'completed')->count(),
                    'tests_taken' => $testAttempts->count(),
                    'best_test_score' => $testAttempts->max('percentage'),
                    'latest_test_score' => $testAttempts->first()?->percentage,
                    'responses_answered' => $responses->count(),
                    'evidence_uploaded' => $evidenceUploads->count(),
                    'flagged_responses' => $responses->filter(fn (ComplianceResponse $response) => $response->status?->value === 'flagged')->count(),
                ],
                'assignments' => $assignments->map(fn (CourseAssignment $assignment) => [
                    'id' => $assignment->id,
                    'course' => $assignment->course?->title,
                    'status' => $assignment->status?->value,
                    'due_date' => $assignment->due_date,
                    'assigned_at' => $assignment->assigned_at,
                ])->values(),
                'test_attempts' => $testAttempts->map(fn (TestAttempt $attempt) => [
                    'id' => $attempt->id,
                    'test' => $attempt->test?->title,
                    'attempt_number' => $attempt->attempt_number,
                    'percentage' => $attempt->percentage,
                    'result_status' => $attempt->result_status?->value,
                    'submitted_at' => $attempt->submitted_at,
                ])->values(),
                'compliance' => [
                    'responses' => $responses->map(fn (ComplianceResponse $response) => [
                        'id' => $response->id,
                        'question' => $response->question?->question_text,
                        'framework' => $response->submission?->framework?->name,
                        'status' => $response->status?->value,
                        'response_score' => $response->response_score,
                        'answered_at' => $response->answered_at,
                    ])->values(),
                    'evidence_uploads' => $evidenceUploads->map(fn (EvidenceFile $file) => [
                        'id' => $file->id,
                        'original_name' => $file->original_name,
                        'framework' => $file->submission?->framework?->name,
                        'review_status' => $file->review_status?->value,
                        'uploaded_at' => $file->uploaded_at,
                    ])->values(),
                    'review_activity' => $reviewActivity->map(fn ($review) => [
                        'id' => $review->id,
                        'file' => $review->evidenceFile?->original_name,
                        'review_status' => $review->review_status?->value,
                        'reviewed_at' => $review->reviewed_at,
                        'review_comment' => $review->review_comment,
                    ])->values(),
                ],
                'activity' => $recentActivity->map(fn (AuditLog $log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'entity_type' => $log->entity_type,
                    'created_at' => $log->created_at,
                ])->values(),
            ],
            'departments' => Department::query()->orderBy('name')->get(['id', 'name']),
            'managers' => User::query()->where('tenant_id', $employeeProfile->tenant_id)->orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    public function update(EmployeeProfileRequest $request, EmployeeProfile $employeeProfile): RedirectResponse
    {
        $this->authorize('update', $employeeProfile);

        $employeeProfile->user->update($request->safe()->only(['name', 'email', 'status']));
        $employeeProfile->update($request->safe()->except(['name', 'email', 'status']));

        return back()->with('success', 'Employee updated.');
    }

    public function destroy(EmployeeProfile $employeeProfile): RedirectResponse
    {
        $this->authorize('delete', $employeeProfile);

        $employeeProfile->delete();
        User::query()->whereKey($employeeProfile->user_id)->delete();

        return back()->with('success', 'Employee removed.');
    }
}
