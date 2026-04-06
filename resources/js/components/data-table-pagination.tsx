import { Button } from '@/components/ui/button';
import { Paginated } from '@/types';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    paginated: Paginated<unknown>;
    filters: Record<string, string | number | null | undefined>;
}

export function DataTablePagination({ paginated, filters }: Props) {
    if (paginated.last_page <= 1) {
        return null;
    }

    const goToPage = (page: number) => {
        router.get(
            window.location.pathname,
            {
                ...sanitize(filters),
                page,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const pages = Array.from({ length: paginated.last_page }, (_, index) => index + 1).slice(
        Math.max(0, paginated.current_page - 3),
        Math.min(paginated.last_page, paginated.current_page + 2),
    );

    const from = (paginated.current_page - 1) * paginated.per_page + 1;
    const to = Math.min(paginated.current_page * paginated.per_page, paginated.total);

    return (
        <nav aria-label="Pagination" className="flex flex-col gap-4 border-t border-border/70 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground" aria-live="polite">
                Showing <span className="font-medium text-foreground">{from}</span> to <span className="font-medium text-foreground">{to}</span> of{' '}
                <span className="font-medium text-foreground">{paginated.total}</span> items
            </p>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(paginated.current_page - 1)}
                    disabled={paginated.current_page <= 1}
                    aria-label="Go to previous page"
                >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    Previous
                </Button>

                {pages.map((page) => (
                    <Button
                        key={page}
                        variant={page === paginated.current_page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToPage(page)}
                        aria-label={`Page ${page}`}
                        aria-current={page === paginated.current_page ? 'page' : undefined}
                    >
                        {page}
                    </Button>
                ))}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(paginated.current_page + 1)}
                    disabled={paginated.current_page >= paginated.last_page}
                    aria-label="Go to next page"
                >
                    Next
                    <ChevronRight className="size-4" aria-hidden="true" />
                </Button>
            </div>
        </nav>
    );
}

function sanitize(filters: Record<string, string | number | null | undefined>) {
    return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined));
}
