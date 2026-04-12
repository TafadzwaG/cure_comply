import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableFilterConfig, TableFilterOption, TableFilters } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Download, RotateCcw, Search } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

interface Props {
    filters: TableFilters;
    filterConfigs?: TableFilterConfig[];
    exportable?: boolean;
    sortOptions?: TableFilterOption[];
}

export function DataTableToolbar({
    filters,
    filterConfigs = [],
    exportable = false,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const query = useMemo(() => sanitize(filters), [filters]);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            window.location.pathname,
            sanitize({
                ...filters,
                search,
                page: undefined,
            }),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const setFilter = (key: string, value: string) => {
        router.get(
            window.location.pathname,
            sanitize({
                ...filters,
                [key]: value === '__all__' ? undefined : value,
                page: undefined,
            }),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <div className="flex flex-col gap-3 border-b border-border/70 px-6 py-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <form onSubmit={submit} className="flex w-full max-w-xl items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records" className="pl-9" />
                    </div>
                    <Button type="submit" variant="outline">
                        Search
                    </Button>
                </form>

                <div className="flex flex-wrap items-center gap-2">
                    {exportable ? (
                        <Button asChild variant="outline">
                            <a href={`${window.location.pathname}?${new URLSearchParams({ ...stringify(query), export: 'xlsx' }).toString()}`}>
                                <Download className="size-4" />
                                Export Excel
                            </a>
                        </Button>
                    ) : null}

                    <Button asChild variant="ghost">
                        <Link href={window.location.pathname}>
                            <RotateCcw className="size-4" />
                            Reset
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                {filterConfigs.map((config) => (
                    <Select key={config.key} value={String(filters[config.key] ?? '__all__')} onValueChange={(value) => setFilter(config.key, value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={config.label} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All {config.label}</SelectItem>
                            {config.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ))}

                <Select value={String(filters.per_page ?? 12)} onValueChange={(value) => setFilter('per_page', value)}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Per page" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10 / page</SelectItem>
                        <SelectItem value="25">25 / page</SelectItem>
                        <SelectItem value="50">50 / page</SelectItem>
                        <SelectItem value="100">100 / page</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

function sanitize(filters: Record<string, string | number | null | undefined>) {
    return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined));
}

function stringify(filters: Record<string, string | number | null | undefined>) {
    return Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, String(value)]));
}
