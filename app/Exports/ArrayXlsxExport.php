<?php

namespace App\Exports;

class ArrayXlsxExport extends BaseXlsxExport
{
    public function __construct(array $headings, array $rows)
    {
        parent::__construct([
            'headings' => $headings,
            'rows' => $rows,
        ]);
    }

    public function headings(): array
    {
        return $this->dataset['headings'];
    }

    public function rows(): array
    {
        return $this->dataset['rows'];
    }
}
