import { Button } from '@/components/ui/button';
import { TableHead } from '@/components/ui/table';
import { TableFilters } from '@/types';
import { router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

interface Props {
    label: string;
    column: string;
    filters: TableFilters;
    className?: string;
}

export function SortableTableHead({ label, column, filters, className }: Props) {
    const isActive = filters.sort === column;
    const nextDirection = isActive && filters.direction === 'asc' ? 'desc' : 'asc';

    const onSort = () => {
        router.get(
            window.location.pathname,
            sanitize({
                ...filters,
                sort: column,
                direction: nextDirection,
                page: undefined,
            }),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const Icon = !isActive ? ArrowUpDown : filters.direction === 'asc' ? ArrowUp : ArrowDown;
    const ariaSortValue = !isActive ? 'none' : (filters.direction === 'asc' ? 'ascending' : 'descending');

    return (
        <TableHead className={className} aria-sort={ariaSortValue as 'none' | 'ascending' | 'descending'}>
            <Button
                type="button"
                variant="ghost"
                className="-ml-3 h-8 px-3 text-muted-foreground hover:text-foreground"
                onClick={onSort}
                aria-label={`Sort by ${label}, currently ${ariaSortValue}`}
            >
                {label}
                <Icon className="size-4" aria-hidden="true" />
            </Button>
        </TableHead>
    );
}

function sanitize(filters: Record<string, string | number | null | undefined>) {
    return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined));
}
