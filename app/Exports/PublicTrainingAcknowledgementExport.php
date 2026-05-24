<?php

namespace App\Exports;

class PublicTrainingAcknowledgementExport extends BaseXlsxExport
{
    public function headings(): array
    {
        return ['Full Name', 'Tenant', 'Course', 'Acknowledged At'];
    }

    public function rows(): array
    {
        return array_map(fn ($row) => [
            $row['full_name'],
            $row['tenant'],
            $row['course'],
            $row['acknowledged_at'],
        ], $this->dataset);
    }
}
