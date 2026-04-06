import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { type PendingFramework } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PendingFrameworksDialogProps {
    frameworks: PendingFramework[] | null | undefined;
}

const statusStyles: Record<string, string> = {
    draft: 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400',
    submitted: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    in_review: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
};

export default function PendingFrameworksDialog({ frameworks }: PendingFrameworksDialogProps) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (frameworks && frameworks.length > 0) {
            const timer = setTimeout(() => setOpen(true), 600);
            return () => clearTimeout(timer);
        }
    }, [frameworks]);

    if (!frameworks || frameworks.length === 0) {
        return null;
    }

    const totalPending = frameworks.reduce((sum, fw) => sum + fw.pending_count, 0);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-amber-300/70 bg-amber-100 p-2.5 text-amber-700 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg">Compliance Frameworks Pending</DialogTitle>
                            <DialogDescription>
                                You have {totalPending} pending {totalPending === 1 ? 'submission' : 'submissions'} across{' '}
                                {frameworks.length} {frameworks.length === 1 ? 'framework' : 'frameworks'}.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {frameworks.map((framework) => (
                        <div
                            key={framework.id}
                            className="rounded-lg border border-[#c3c6d1]/50 bg-[#f2f4f6]/50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
                        >
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-sm font-semibold text-[#002753] dark:text-slate-100">
                                        {framework.name}
                                    </h4>
                                    {framework.version && (
                                        <p className="text-xs text-[#434750] dark:text-slate-400">
                                            Version {framework.version}
                                        </p>
                                    )}
                                </div>
                                <Badge variant="outline" className="rounded-full tabular-nums">
                                    {framework.pending_count} pending
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                {framework.submissions.map((submission) => (
                                    <Link
                                        key={submission.id}
                                        href={submission.href}
                                        onClick={() => setOpen(false)}
                                        className="group flex items-center justify-between gap-3 rounded-md border border-[#c3c6d1]/30 bg-white px-3 py-2 transition-all hover:border-[#14417A]/30 hover:bg-[#d6e3ff]/10 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-slate-500 dark:hover:bg-slate-800"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-[#002753] dark:text-slate-100">
                                                {submission.title}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={`rounded-full px-2 py-0 text-[10px] uppercase tracking-wider ${statusStyles[submission.status] ?? statusStyles.draft}`}
                                            >
                                                {submission.status.replace('_', ' ')}
                                            </Badge>
                                            <ArrowRight className="size-3.5 text-[#434750]/50 transition-transform group-hover:translate-x-0.5 group-hover:text-[#14417A] dark:text-slate-500 dark:group-hover:text-slate-300" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Dismiss
                    </Button>
                    <Button asChild>
                        <Link href="/submissions" onClick={() => setOpen(false)}>
                            View All Submissions
                        </Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
