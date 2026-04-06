<?php

namespace App\Exports;

class ComplianceSummaryExport extends BaseXlsxExport
{
    public function headings(): array
    {
        return ['Framework', 'Submission', 'Section Scores', 'Overall Score', 'Rating'];
    }

    public function rows(): array
    {
        return array_map(fn ($row) => [
            $row['framework'],
            $row['submission'],
            collect($row['section_scores'])->map(fn ($section) => "{$section['section']}: {$section['score']} ({$section['rating']})")->implode(' | '),
            $row['overall_score'],
            $row['rating'],
        ], $this->dataset);
    }
}
