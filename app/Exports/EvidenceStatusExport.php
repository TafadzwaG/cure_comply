<?php

namespace App\Exports;

class EvidenceStatusExport extends BaseXlsxExport
{
    public function headings(): array
    {
        return ['Question', 'Evidence Count', 'Review Status', 'Reviewer Comments Summary'];
    }

    public function rows(): array
    {
        return array_map(fn ($row) => [
            $row['question'],
            $row['evidence_count'],
            $row['review_status'],
            $row['reviewer_comments_summary'],
        ], $this->dataset);
    }
}
