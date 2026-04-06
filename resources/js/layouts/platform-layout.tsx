import PendingFrameworksDialog from '@/components/pending-frameworks-dialog';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    Eye,
    ShieldAlert,
    ShieldX,
    TriangleAlert,
    UserRound,
} from 'lucide-react';
import { PropsWithChildren } from 'react';

export default function PlatformLayout({ children }: PropsWithChildren) {
    const { auth, impersonation, flash } = usePage<SharedData>().props;

    return (
        <AppLayout>
            <div className="space-y-4 p-4 md:p-6">
                {impersonation.active ? (
                    <div
                        role="alert"
                        className="relative overflow-hidden rounded-[24px] border border-[#0D3B73] bg-gradient-to-br from-[#001A3A] via-[#002753] to-[#0A3E78] text-white shadow-xl shadow-[#001833]/25"
                    >
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.10),transparent_28%)]" />

                        <div className="relative flex flex-col gap-4 p-4 md:p-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-1 items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm">
                                    <ShieldAlert className="size-5 text-white" />
                                </div>

                                <div className="min-w-0 flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
                                            <Eye className="size-3" />
                                            Live impersonation
                                        </div>

                                        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
                                            <BadgeCheck className="size-3" />
                                            Admin session
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">
                                            You are impersonating{' '}
                                            <span className="text-cyan-200">
                                                {auth.user?.name ?? 'a user'}
                                            </span>
                                            .
                                        </h2>

                                        <p className="max-w-3xl text-sm leading-5 text-white/75">
                                            Every action in this session is being executed from this
                                            user’s perspective. End the session before returning to
                                            normal platform administration.
                                        </p>
                                    </div>

                                    <div className="grid gap-2 md:grid-cols-3">
                                        <div className="rounded-xl border border-white/10 bg-white/10 p-2.5 backdrop-blur-sm">
                                            <div className="mb-1 flex items-center gap-1.5 text-cyan-100">
                                                <UserRound className="size-3.5" />
                                                <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                                                    Acting as
                                                </span>
                                            </div>
                                            <p className="truncate text-sm font-medium text-white">
                                                {auth.user?.name ?? 'Unknown user'}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-white/10 p-2.5 backdrop-blur-sm">
                                            <div className="mb-1 flex items-center gap-1.5 text-emerald-100">
                                                <BadgeCheck className="size-3.5" />
                                                <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                                                    Status
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-white">
                                                Monitoring enabled
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-white/10 bg-white/10 p-2.5 backdrop-blur-sm">
                                            <div className="mb-1 flex items-center gap-1.5 text-amber-100">
                                                <TriangleAlert className="size-3.5" />
                                                <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                                                    Caution
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-white">
                                                Changes affect this account
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full flex-col gap-2 lg:w-auto lg:min-w-[220px] lg:items-end">
                                <Button
                                    variant="outline"
                                    className="h-10 rounded-xl border-white/15 bg-white px-4 text-[#002753] shadow-sm transition-all hover:scale-[1.01] hover:bg-cyan-50"
                                    onClick={() => router.delete(route('impersonation.stop'))}
                                >
                                    <ShieldX className="size-4" />
                                    Stop impersonation
                                </Button>

                                <p className="text-xs leading-4 text-white/65 lg:max-w-[210px] lg:text-right">
                                    End this session to resume actions as admin.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null}

                {children}

                <PendingFrameworksDialog frameworks={flash?.pendingFrameworks} />
            </div>
        </AppLayout>
    );
}