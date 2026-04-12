import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusTone: Record<string, string> = {
    active: 'border-border bg-background text-foreground',
    published: 'border-border bg-background text-foreground',
    completed: 'border-border bg-background text-foreground',
    approved: 'border-border bg-background text-foreground',
    pending: 'border-border bg-muted text-foreground',
    submitted: 'border-border bg-muted text-foreground',
    in_review: 'border-border bg-muted text-foreground',
    draft: 'border-dashed border-border bg-muted/60 text-muted-foreground',
    suspended: 'border-border bg-muted/70 text-foreground',
    rejected: 'border-border bg-muted/70 text-foreground',
    failed: 'border-border bg-muted/70 text-foreground',
    archived: 'border-dashed border-border bg-muted/60 text-muted-foreground',
    inactive: 'border-destructive/40 bg-destructive/10 text-destructive',
    scored: 'border-border bg-background text-foreground',
    closed: 'border-dashed border-border bg-muted/60 text-muted-foreground',
    unread: 'border-border bg-background text-foreground',
    read: 'border-dashed border-border bg-muted/60 text-muted-foreground',
};

export function StatusBadge({ value }: { value?: string | null }) {
    const normalized = value ?? 'unknown';

    return (
        <Badge variant="outline" className={cn('capitalize font-medium', statusTone[normalized] ?? 'border-border bg-muted/50 text-muted-foreground')}>
            {normalized.replaceAll('_', ' ')}
        </Badge>
    );
}
