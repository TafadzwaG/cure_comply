<?php

namespace App\Exports;

class EmployeeTrainingExport extends BaseXlsxExport
{
    public function headings(): array
    {
        return ['Employee Name', 'Department', 'Course', 'Progress', 'Completion Status', 'Due Date'];
    }

    public function rows(): array
    {
        return array_map(fn ($row) => [
            $row['employee_name'],
            $row['department'],
            $row['course'],
            $row['progress'],
            $row['completion_status'],
            $row['due_date'],
        ], $this->dataset);
    }
}
