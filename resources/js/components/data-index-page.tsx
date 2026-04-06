import { DataTablePagination } from '@/components/data-table-pagination';
import { DataTableToolbar } from '@/components/data-table-toolbar';
import { IndexStatCard } from '@/components/index-stat-card';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IndexAction, IndexStat, Paginated, TableFilterConfig, TableFilterOption, TableFilters } from '@/types';
import { Link } from '@inertiajs/react';

interface Props {
    title: string;
    description: string;
    stats: IndexStat[];
    actions?: IndexAction[];
    filters: TableFilters;
    filterConfigs?: TableFilterConfig[];
    sortOptions?: TableFilterOption[];
    paginated: Paginated<unknown>;
    tableTitle: string;
    tableDescription: string;
    exportable?: boolean;
    children: React.ReactNode;
}

export function DataIndexPage({
    title,
    description,
    stats,
    actions = [],
    filters,
    filterConfigs = [],
    sortOptions,
    paginated,
    tableTitle,
    tableDescription,
    exportable = false,
    children,
}: Props) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <PageHeader title={title} description={description} />
                <div className="flex flex-wrap items-center gap-2">
                    {actions.map((action) =>
                        action.href ? (
                            <Button key={action.label} asChild variant={action.variant ?? 'default'}>
                                {action.href.startsWith('#') ? (
                                    <a href={action.href}>
                                        {action.icon ? <action.icon className="size-4" /> : null}
                                        {action.label}
                                    </a>
                                ) : (
                                    <Link href={action.href}>
                                        {action.icon ? <action.icon className="size-4" /> : null}
                                        {action.label}
                                    </Link>
                                )}
                            </Button>
                        ) : (
                            <Button key={action.label} variant={action.variant ?? 'default'} onClick={action.onClick}>
                                {action.icon ? <action.icon className="size-4" /> : null}
                                {action.label}
                            </Button>
                        ),
                    )}
                    
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <IndexStatCard key={stat.label} {...stat} />
                ))}
            </div>

            <Card className="border-border/70 shadow-none">
                <CardHeader className="space-y-1">
                    <CardTitle>{tableTitle}</CardTitle>
                    <CardDescription>{tableDescription}</CardDescription>
                </CardHeader>
                <DataTableToolbar filters={filters} filterConfigs={filterConfigs} sortOptions={sortOptions} exportable={exportable} />
                <CardContent className="p-0">{children}</CardContent>
                <DataTablePagination paginated={paginated} filters={filters} />
            </Card>
        </div>
    );
}
