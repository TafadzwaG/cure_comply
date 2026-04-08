<?php

namespace App\Http\Controllers;

use App\Exports\ComplianceSummaryExport;
use App\Exports\EmployeeTrainingExport;
use App\Exports\EvidenceStatusExport;
use App\Exports\TestPerformanceExport;
use App\Http\Requests\ReportFilterRequest;
use App\Models\ComplianceFramework;
use App\Models\Department;
use App\Models\Tenant;
use App\Models\User;
use App\Services\ExportRequestService;
use App\Services\ReportService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(protected ReportService $reportService)
    {
    }

    public function index(ReportFilterRequest $request): Response
    {
        $filters = $request->validated();
        $user = $request->user();
        $selectedTenantId = (int) ($filters['tenant_id'] ?? $user?->tenant_id ?? 0);

        $tenants = Tenant::query()
            ->when(! $user?->isSuperAdmin(), fn ($query) => $query->whereKey($user?->tenant_id))
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Tenant $tenant) => [
                'value' => (string) $tenant->id,
                'label' => $tenant->name,
            ])
            ->values();

        $departments = Department::query()
            ->when($selectedTenantId > 0, fn ($query) => $query->where('tenant_id', $selectedTenantId))
            ->when($selectedTenantId === 0 && ! $user?->isSuperAdmin(), fn ($query) => $query->where('tenant_id', $user?->tenant_id))
            ->orderBy('name')
            ->get(['id', 'name', 'tenant_id'])
            ->map(fn (Department $department) => [
                'value' => (string) $department->id,
                'label' => $department->name,
                'tenant_id' => (string) $department->tenant_id,
            ])
            ->values();

        $employees = User::query()
            ->with(['employeeProfile:id,user_id,department_id', 'tenant:id,name'])
            ->when($selectedTenantId > 0, fn ($query) => $query->where('tenant_id', $selectedTenantId))
            ->when($selectedTenantId === 0 && ! $user?->isSuperAdmin(), fn ($query) => $query->where('tenant_id', $user?->tenant_id))
            ->orderBy('name')
            ->get(['id', 'name', 'tenant_id'])
            ->map(fn (User $employee) => [
                'value' => (string) $employee->id,
                'label' => $employee->name,
                'tenant_id' => $employee->tenant_id ? (string) $employee->tenant_id : null,
                'department_id' => $employee->employeeProfile?->department_id ? (string) $employee->employeeProfile->department_id : null,
            ])
            ->values();

        $frameworks = ComplianceFramework::query()
            ->orderBy('name')
            ->get(['id', 'name', 'version'])
            ->map(fn (ComplianceFramework $framework) => [
                'value' => (string) $framework->id,
                'label' => trim($framework->name.' '.($framework->version ? '('.$framework->version.')' : '')),
            ])
            ->values();

        return Inertia::render('reports/index', [
            'filters' => $filters,
            'reports' => [
                'employeeTraining' => $this->reportService->employeeTraining($filters),
                'testPerformance' => $this->reportService->testPerformance($filters),
                'complianceSummary' => $this->reportService->complianceSummary($filters),
                'evidenceStatus' => $this->reportService->evidenceStatus($filters),
            ],
            'filterOptions' => [
                'tenants' => $tenants,
                'departments' => $departments,
                'employees' => $employees,
                'frameworks' => $frameworks,
            ],
        ]);
    }

    public function employeeTraining(ReportFilterRequest $request): RedirectResponse
    {
        return $this->respond($request, 'employee-training', new EmployeeTrainingExport($this->reportService->employeeTraining($request->validated())));
    }

    public function testPerformance(ReportFilterRequest $request): RedirectResponse
    {
        return $this->respond($request, 'test-performance', new TestPerformanceExport($this->reportService->testPerformance($request->validated())));
    }

    public function complianceSummary(ReportFilterRequest $request): RedirectResponse
    {
        return $this->respond($request, 'compliance-summary', new ComplianceSummaryExport($this->reportService->complianceSummary($request->validated())));
    }

    public function evidenceStatus(ReportFilterRequest $request): RedirectResponse
    {
        return $this->respond($request, 'evidence-status', new EvidenceStatusExport($this->reportService->evidenceStatus($request->validated())));
    }

    protected function respond(ReportFilterRequest $request, string $name, mixed $export): RedirectResponse
    {
        $format = $request->string('format')->lower()->value() === 'pdf' ? 'pdf' : 'xlsx';

        app(ExportRequestService::class)->queue(
            $request->user(),
            'reports.'.$name,
            $format,
            $request->validated(),
            $format === 'xlsx'
                ? [
                    'title' => str($name)->headline()->value(),
                    'headings' => $export->headings(),
                    'rows' => $export->rows(),
                ]
                : [
                    'title' => str($name)->headline()->value(),
                    'rows' => $export->rows(),
                ]
        );

        return back()->with('success', 'Report export queued. You will be notified when it is ready.');
    }
}
