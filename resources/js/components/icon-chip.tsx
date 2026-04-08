import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

export function IconChip({ icon, className }: { icon: ReactNode; className?: string }) {
    return <div className={cn('rounded-xl bg-[#d6e3ff] p-2 text-[#083d77] dark:bg-[#083d77]/20 dark:text-[#a9c7ff]', className)}>{icon}</div>;
}
