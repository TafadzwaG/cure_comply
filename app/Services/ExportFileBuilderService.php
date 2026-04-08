<?php

namespace App\Services;

use App\Models\ComplianceFramework;
use App\Models\ComplianceSubmission;
use App\Models\ExportRequest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use OpenSpout\Common\Entity\Cell;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;

class ExportFileBuilderService
{
    public function buildXlsx(ExportRequest $exportRequest): string
    {
        $payload = $exportRequest->payload ?? [];
        $headings = $payload['headings'] ?? [];
        $rows = $payload['rows'] ?? [];

        $relativePath = 'exports/'.$exportRequest->id.'/'.($exportRequest->file_name ?? 'export.xlsx');
        $absolutePath = Storage::disk('private')->path($relativePath);

        if (! is_dir(dirname($absolutePath))) {
            mkdir(dirname($absolutePath), 0777, true);
        }

        $writer = new Writer();
        $writer->openToFile($absolutePath);
        $writer->addRow(new Row(array_map(fn ($heading) => Cell::fromValue($heading), $headings)));

        foreach ($rows as $row) {
            $writer->addRow(new Row(array_map(fn ($value) => Cell::fromValue($value), array_values($row))));
        }

        $writer->close();

        return $relativePath;
    }

    public function buildPdf(ExportRequest $exportRequest): string
    {
        $payload = $exportRequest->payload ?? [];
        $relativePath = 'exports/'.$exportRequest->id.'/'.($exportRequest->file_name ?? 'export.pdf');

        $binary = match ($exportRequest->source) {
            'frameworks.pdf' => $this->frameworkPdf((int) ($payload['framework_id'] ?? 0)),
            'submissions.pdf' => $this->submissionPdf((int) ($payload['submission_id'] ?? 0)),
            default => $this->genericPdf($payload),
        };

        Storage::disk('private')->put($relativePath, $binary);

        return $relativePath;
    }

    protected function genericPdf(array $payload): string
    {
        return Pdf::loadView('reports.generic', [
            'rows' => $payload['rows'] ?? [],
            'title' => $payload['title'] ?? 'Export',
        ])->output();
    }

    protected function frameworkPdf(int $frameworkId): string
    {
        $framework = ComplianceFramework::query()
            ->with([
                'sections' => fn ($q) => $q->orderBy('sort_order'),
                'sections.questions' => fn ($q) => $q->orderBy('sort_order'),
            ])
            ->findOrFail($frameworkId);

        return Pdf::loadView('pdf.framework', ['framework' => $framework])->setPaper('a4')->output();
    }

    protected function submissionPdf(int $submissionId): string
    {
        $submission = ComplianceSubmission::query()
            ->with([
                'framework.sections.questions' => fn ($q) => $q->orderBy('sort_order'),
                'responses.evidenceFiles.reviews',
                'score',
                'sectionScores.section',
            ])
            ->findOrFail($submissionId);

        return Pdf::loadView('pdf.submission', ['submission' => $submission])->setPaper('a4')->output();
    }
}
