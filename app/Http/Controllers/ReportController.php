<?php

namespace App\Http\Controllers;

use App\Exports\ComplianceSummaryExport;
use App\Exports\EmployeeTrainingExport;
use App\Exports\EvidenceStatusExport;
use App\Exports\TestPerformanceExport;
use App\Http\Requests\ReportFilterRequest;
use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(protected ReportService $reportService)
    {
    }

    public function index(ReportFilterRequest $request): Response
    {
        return Inertia::render('reports/index', [
            'filters' => $request->validated(),
            'reports' => [
                'employeeTraining' => $this->reportService->employeeTraining($request->validated()),
                'testPerformance' => $this->reportService->testPerformance($request->validated()),
                'complianceSummary' => $this->reportService->complianceSummary($request->validated()),
                'evidenceStatus' => $this->reportService->evidenceStatus($request->validated()),
            ],
        ]);
    }

    public function employeeTraining(ReportFilterRequest $request): StreamedResponse|\Illuminate\Http\Response
    {
        return $this->respond($request, 'employee-training', new EmployeeTrainingExport($this->reportService->employeeTraining($request->validated())));
    }

    public function testPerformance(ReportFilterRequest $request): StreamedResponse|\Illuminate\Http\Response
    {
        return $this->respond($request, 'test-performance', new TestPerformanceExport($this->reportService->testPerformance($request->validated())));
    }

    public function complianceSummary(ReportFilterRequest $request): StreamedResponse|\Illuminate\Http\Response
    {
        return $this->respond($request, 'compliance-summary', new ComplianceSummaryExport($this->reportService->complianceSummary($request->validated())));
    }

    public function evidenceStatus(ReportFilterRequest $request): StreamedResponse|\Illuminate\Http\Response
    {
        return $this->respond($request, 'evidence-status', new EvidenceStatusExport($this->reportService->evidenceStatus($request->validated())));
    }

    protected function respond(ReportFilterRequest $request, string $name, mixed $export): StreamedResponse|\Illuminate\Http\Response
    {
        if ($request->string('format')->lower()->value() === 'pdf') {
            return Pdf::loadView('reports.generic', ['rows' => $export->rows(), 'title' => str($name)->headline()])->download($name.'.pdf');
        }

        return $export->download($name.'.xlsx');
    }
}
