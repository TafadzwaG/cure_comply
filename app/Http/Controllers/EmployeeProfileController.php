<?php

namespace App\Http\Controllers;

use App\Exports\ArrayXlsxExport;
use App\Http\Controllers\Concerns\InteractsWithIndexTables;
use App\Http\Requests\EmployeeImportRequest;
use App\Http\Requests\EmployeeProfileRequest;
use App\Models\AuditLog;
use App\Models\ComplianceResponse;
use App\Models\CourseAssignment;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\EvidenceFile;
use App\Models\LessonProgress;
use App\Models\Tenant;
use App\Models\TestAssignment;
use App\Models\TestAttempt;
use App\Models\User;
use App\Services\EmployeeImportService;
use App\Services\UserLifecycleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EmployeeProfileController extends Controller
{
    use InteractsWithIndexTables;

    public function __construct(
        protected UserLifecycleService $userLifecycleService,
        protected EmployeeImportService $employeeImportService,
    ) {
    }

    public function index(Request $request): Response|RedirectResponse
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
                $profile->user?->roles?->pluck('name')->first(),
                $profile->department?->name ?: 'Unassigned',
                $profile->job_title ?: 'Not set',
                $profile->employment_type ?: 'Not set',
                $profile->start_date?->format('Y-m-d'),
                $profile->risk_level ?: '',
                $profile->branch ?: '',
                $profile->employee_number ?: '',
                $profile->phone ?: '',
                $profile->alternate_phone ?: '',
                $profile->status->value,
            ])->all();

            return $this->queueTableExport(
                $request,
                'employees.index',
                $filters,
                ['Name', 'Email', 'Role', 'Department', 'Job Title', 'Employment Type', 'Start Date', 'Risk Level', 'Branch', 'Employee Number', 'Phone', 'Alternate Phone', 'Status'],
                $rows,
                'Employees',
            );
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
            'tenants' => $request->user()?->isSuperAdmin()
                ? Tenant::query()->orderBy('name')->get(['id', 'name'])
                : [],
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

    public function importTemplate(): StreamedResponse
    {
        $this->authorize('create', EmployeeProfile::class);

        return (new ArrayXlsxExport(
            ['Name', 'Email', 'Role', 'Department', 'Job Title', 'Employment Type', 'Start Date', 'Risk Level', 'Branch', 'Employee Number', 'Phone', 'Alternate Phone'],
            [],
        ))->download('employee-import-template.xlsx');
    }

    public function import(EmployeeImportRequest $request): RedirectResponse
    {
        $this->authorize('create', EmployeeProfile::class);

        $summary = $this->employeeImportService->import(
            $request->file('file'),
            $request->user(),
            (int) $request->tenantId(),
        );

        $parts = [];

        if ($summary['updated'] > 0) {
            $parts[] = sprintf('%d existing %s updated.', $summary['updated'], $summary['updated'] === 1 ? 'employee was' : 'employees were');
        }

        if ($summary['invited'] > 0) {
            $parts[] = sprintf('%d new %s queued for invitation delivery.', $summary['invited'], $summary['invited'] === 1 ? 'employee was' : 'employees were');
        }

        if ($summary['resent'] > 0) {
            $parts[] = sprintf('%d pending %s re-queued.', $summary['resent'], $summary['resent'] === 1 ? 'invitation was' : 'invitations were');
        }

        if ($parts === []) {
            $parts[] = 'No employee rows were changed.';
        }

        return back()->with('success', 'Employee import completed. '.implode(' ', $parts));
    }

    public function show(EmployeeProfile $employee): Response
    {
        $this->authorize('view', $employee);

        $employee->load([
            'user.roles.permissions',
            'user.permissions',
            'user.tenant:id,name',
            'department',
            'tenant:id,name',
            'manager:id,name,email',
            'directReports.user:id,name,email',
        ]);

        $user = $employee->user;
        $userId = $employee->user_id;

        $assignments = CourseAssignment::query()
            ->with('course:id,title')
            ->where('assigned_to_user_id', $userId)
            ->latest('assigned_at')
            ->get();

        $lessonProgress = LessonProgress::query()
            ->with('lesson:id,title')
            ->where('user_id', $userId)
            ->latest('completed_at')
            ->get();

        $testAssignments = TestAssignment::query()
            ->with('test:id,title')
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

        $completedCourses = $assignments->filter(
            fn (CourseAssignment $assignment) => $assignment->status?->value === 'completed'
        )->count();

        $overdueCourses = $assignments->filter(
            fn (CourseAssignment $assignment) => $assignment->due_date && $assignment->due_date->isPast() && $assignment->status?->value !== 'completed'
        )->count();

        $completedLessons = $lessonProgress->filter(
            fn (LessonProgress $progress) => $progress->status?->value === 'completed'
        )->count();

        $pendingTests = $testAssignments->filter(
            fn (TestAssignment $assignment) => ($assignment->status ?? 'assigned') !== 'completed'
        )->count();

        $roleNames = $user?->roles?->pluck('name')->values()->all() ?? [];
        $permissionNames = $user?->getAllPermissions()->pluck('name')->values()->all() ?? [];

        return Inertia::render('employees/show', [
            'employee' => [
                ...$employee->toArray(),
                'user' => $user ? $user->toArray() : [
                    'id' => $userId,
                    'tenant_id' => $employee->tenant_id,
                    'name' => 'Missing user record',
                    'email' => 'Unavailable',
                    'status' => $employee->status?->value ?? $employee->status,
                    'roles' => [],
                    'permissions' => [],
                    'tenant' => $employee->tenant ? [
                        'id' => $employee->tenant->id,
                        'name' => $employee->tenant->name,
                    ] : null,
                    'last_login_at' => null,
                    'last_password_changed_at' => null,
                    'created_at' => $employee->created_at,
                    'updated_at' => $employee->updated_at,
                ],
                'summary' => [
                    'assigned_courses' => $assignments->count(),
                    'completed_courses' => $completedCourses,
                    'overdue_courses' => $overdueCourses,
                    'completed_lessons' => $completedLessons,
                    'assigned_tests' => $testAssignments->count(),
                    'pending_tests' => $pendingTests,
                    'tests_taken' => $testAttempts->count(),
                    'best_test_score' => $testAttempts->max('percentage'),
                    'latest_test_score' => $testAttempts->first()?->percentage,
                    'responses_answered' => $responses->count(),
                    'evidence_uploaded' => $evidenceUploads->count(),
                    'flagged_responses' => $responses->filter(fn (ComplianceResponse $response) => $response->status?->value === 'flagged')->count(),
                ],
                'access' => [
                    'role_names' => $roleNames,
                    'permission_names' => $permissionNames,
                ],
                'assignments' => $assignments->map(fn (CourseAssignment $assignment) => [
                    'id' => $assignment->id,
                    'course' => $assignment->course?->title,
                    'status' => $assignment->status?->value,
                    'due_date' => $assignment->due_date,
                    'assigned_at' => $assignment->assigned_at,
                ])->values(),
                'lesson_progress' => $lessonProgress->map(fn (LessonProgress $progress) => [
                    'id' => $progress->id,
                    'lesson' => $progress->lesson?->title,
                    'status' => $progress->status?->value,
                    'completed_at' => $progress->completed_at,
                ])->values(),
                'test_assignments' => $testAssignments->map(fn (TestAssignment $assignment) => [
                    'id' => $assignment->id,
                    'test' => $assignment->test?->title,
                    'status' => $assignment->status,
                    'assigned_at' => $assignment->assigned_at,
                    'due_date' => $assignment->due_date,
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
            'managers' => User::query()->where('tenant_id', $employee->tenant_id)->orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    public function update(EmployeeProfileRequest $request, EmployeeProfile $employee): RedirectResponse
    {
        $this->authorize('update', $employee);

        $employee->user->update($request->safe()->only(['name', 'email']));
        $employee->update($request->safe()->except(['name', 'email']));

        return back()->with('success', 'Employee updated.');
    }

    public function destroy(EmployeeProfile $employee): RedirectResponse
    {
        $this->authorize('delete', $employee);

        $user = $employee->user;

        if (! $user) {
            return back()->with('error', 'This employee is missing a linked user account and cannot be deactivated.');
        }

        if ($user->isInactive()) {
            return back()->with('error', 'This employee account is already inactive.');
        }

        $this->userLifecycleService->deactivate($user);

        return back()->with('success', 'Employee account deactivated.');
    }
}
