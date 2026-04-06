<?php

namespace App\Exports;

class TestPerformanceExport extends BaseXlsxExport
{
    public function headings(): array
    {
        return ['Employee', 'Test', 'Attempts', 'Best Score', 'Latest Score', 'Pass/Fail'];
    }

    public function rows(): array
    {
        return array_map(fn ($row) => [
            $row['employee'],
            $row['test'],
            $row['attempts'],
            $row['best_score'],
            $row['latest_score'],
            $row['pass_fail'],
        ], $this->dataset);
    }
}
