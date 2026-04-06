<?php

namespace App\Exports;

use OpenSpout\Common\Entity\Cell;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;
use Symfony\Component\HttpFoundation\StreamedResponse;

abstract class BaseXlsxExport
{
    public function __construct(protected array $dataset)
    {
    }

    abstract public function headings(): array;

    abstract public function rows(): array;

    public function download(string $filename): StreamedResponse
    {
        return response()->streamDownload(function () {
            $writer = new Writer();
            $writer->openToFile('php://output');
            $writer->addRow(new Row(array_map(fn ($heading) => Cell::fromValue($heading), $this->headings())));

            foreach ($this->rows() as $row) {
                $writer->addRow(new Row(array_map(fn ($value) => Cell::fromValue($value), $row)));
            }

            $writer->close();
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
