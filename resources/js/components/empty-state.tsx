import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { type LucideIcon } from 'lucide-react';

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: { label: string; href: string };
}) {
    return (
        <div className="rounded-xl border border-dashed border-[#c3c6d1]/60 bg-[#f2f4f6] p-6 text-center dark:border-neutral-700 dark:bg-neutral-900">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#d6e3ff] text-[#083d77] dark:bg-[#083d77]/20 dark:text-[#a9c7ff]">
                <Icon className="size-5" />
            </div>
            <h3 className="text-sm font-semibold text-[#002753] dark:text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#434750] dark:text-neutral-400">{description}</p>
            {action ? (
                <Button asChild className="mt-4">
                    <Link href={action.href}>{action.label}</Link>
                </Button>
            ) : null}
        </div>
    );
}
