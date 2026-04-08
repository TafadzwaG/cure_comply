<?php

namespace App\Http\Controllers\Concerns;

use App\Exports\ArrayXlsxExport;
use App\Services\ExportRequestService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

trait InteractsWithIndexTables
{
    protected function validateIndex(Request $request, array $allowedSorts, array $extraRules = []): array
    {
        return $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', Rule::in($allowedSorts)],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', Rule::in([10, 25, 50, 100])],
            'export' => ['nullable', Rule::in(['xlsx'])],
            ...$extraRules,
        ]);
    }

    protected function applySearch(Builder $query, ?string $search, array $columns): Builder
    {
        if (! $search) {
            return $query;
        }

        $query->where(function (Builder $builder) use ($search, $columns) {
            foreach ($columns as $column) {
                if (is_callable($column)) {
                    $column($builder, $search);

                    continue;
                }

                if (str_contains($column, '.')) {
                    [$relation, $relatedColumn] = explode('.', $column, 2);

                    $builder->orWhereHas($relation, fn (Builder $relationQuery) => $relationQuery->where($relatedColumn, 'like', "%{$search}%"));

                    continue;
                }

                $builder->orWhere($column, 'like', "%{$search}%");
            }
        });

        return $query;
    }

    protected function applyFilters(Builder $query, array $filters, array $map): Builder
    {
        foreach ($map as $filter => $handler) {
            $value = Arr::get($filters, $filter);

            if ($value === null || $value === '') {
                continue;
            }

            if (is_callable($handler)) {
                $handler($query, $value, $filters);

                continue;
            }

            if (str_contains($handler, '.')) {
                [$relation, $column] = explode('.', $handler, 2);
                $query->whereHas($relation, fn (Builder $relationQuery) => $relationQuery->where($column, $value));

                continue;
            }

            $query->where($handler, $value);
        }

        return $query;
    }

    protected function applySort(Builder $query, array $map, ?string $sort, ?string $direction, string $default = 'created_at'): Builder
    {
        $direction = $direction === 'asc' ? 'asc' : 'desc';
        $handler = $sort && array_key_exists($sort, $map) ? $map[$sort] : $default;

        if (is_callable($handler)) {
            $handler($query, $direction);

            return $query;
        }

        return $query->orderBy($handler, $direction);
    }

    protected function perPage(array $filters, int $default = 25): int
    {
        return (int) ($filters['per_page'] ?? $default);
    }

    protected function wantsExport(array $filters): bool
    {
        return ($filters['export'] ?? null) === 'xlsx';
    }

    protected function exportTable(string $filename, array $headings, array $rows): StreamedResponse
    {
        return (new ArrayXlsxExport($headings, $rows))->download($filename);
    }

    protected function queueTableExport(Request $request, string $source, array $filters, array $headings, array $rows, ?string $title = null): RedirectResponse
    {
        app(ExportRequestService::class)->queue(
            $request->user(),
            $source,
            'xlsx',
            $filters,
            [
                'headings' => $headings,
                'rows' => $rows,
                'title' => $title,
            ]
        );

        return back()->with('success', 'Export queued. You will be notified when it is ready.');
    }

    protected function queuePdfExport(Request $request, string $source, array $filters = [], array $payload = []): RedirectResponse
    {
        app(ExportRequestService::class)->queue(
            $request->user(),
            $source,
            'pdf',
            $filters,
            $payload
        );

        return back()->with('success', 'PDF export queued. You will be notified when it is ready.');
    }
}
