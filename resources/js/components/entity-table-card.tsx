import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface EntityTableCardProps<T> {
    title: string;
    description: string;
    columns: string[];
    rows: T[];
    renderRow: (row: T) => ReactNode;
}

export function EntityTableCard<T>({ title, description, columns, rows, renderRow }: EntityTableCardProps<T>) {
    return (
        <Card className="border-border/60 shadow-sm shadow-black/5">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table aria-label={title}>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column}>{column}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>{rows.map(renderRow)}</TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
