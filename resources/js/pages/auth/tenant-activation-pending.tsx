import { Button } from '@/components/ui/button';
import privacyCureLogo from '@/images/privacycure-logo.png';
import { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BadgeCheck, BellRing, Check, Clock3, LogOut, ShieldCheck } from 'lucide-react';

type TenantStatusPageProps = SharedData & {
    tenant: {
        name: string;
        contact_name?: string | null;
        contact_email?: string | null;
        status?: string | null;
    };
};

export default function TenantActivationPending() {
    const { tenant, flash } = usePage<TenantStatusPageProps>().props;

    const statusLabel =
        tenant.status === 'pending'
            ? 'Activation pending'
            : tenant.status === 'suspended'
              ? 'Workspace suspended'
              : 'Workspace inactive';

    const statusCopy =
        tenant.status === 'pending'
            ? 'Your registration was successful. Our team is reviewing your workspace request and will notify you as soon as the company is activated.'
            : tenant.status === 'suspended'
              ? 'This workspace is currently suspended. Please contact Privacy Cure support or your platform administrator for the next steps.'
              : 'This workspace is currently inactive. We will notify your team once access has been restored.';

    return (
        <>
            <Head title="Workspace activation pending">
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <style>{`
                    body { font-family: 'Inter', sans-serif; }
                    h1, h2, h3, h4, h5 { font-family: 'Plus Jakarta Sans', sans-serif; }
                `}</style>
            </Head>

            <div className="min-h-screen bg-[#f7f9fb] px-0 py-0 text-[#191c1e]">
                <div className="mx-auto w-full max-w-[96rem]">
                    <div className="overflow-hidden rounded-2xl border border-[#c3c6d1]/20 bg-[#f7f9fb] shadow-[0_24px_70px_-40px_rgba(0,39,83,0.22)]">
                        <div className="flex flex-col items-center justify-between gap-6 border-b border-[#c3c6d1]/15 bg-[#f2f4f6]/70 px-8 py-6 md:flex-row">
                            <Link href={route('home')} className="flex items-center gap-3">
                                <img src={privacyCureLogo} alt="Privacy Cure" className="h-9 w-auto" />
                                <span className="text-lg font-extrabold tracking-tight text-[#002753]">Privacy Cure</span>
                            </Link>

                            <div className="flex w-full items-center gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
                                <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#002753]/10 px-3 py-1">
                                    <span className="h-2 w-2 rounded-full bg-[#002753]" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#002753]">1. Registration submitted</span>
                                </div>
                                <div className="h-px w-4 bg-[#c3c6d1]/40" />
                                <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#002753]/10 px-3 py-1">
                                    <span className="h-2 w-2 rounded-full bg-[#002753]" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#002753]">2. Review in progress</span>
                                </div>
                                <div className="h-px w-4 bg-[#c3c6d1]/40" />
                                <div className="flex shrink-0 items-center gap-2 px-3 py-1">
                                    <span className="h-2 w-2 rounded-full bg-[#c3c6d1]" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#434750]">3. Workspace activation</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            <div className="border-r border-[#c3c6d1]/15 p-8 md:p-12 lg:col-span-8">
                                <header className="mb-12">
                                    <span className="mb-4 inline-flex items-center rounded-full bg-[#00444d] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#00b9ce]">
                                        Workspace status
                                    </span>
                                    <h1 className="mb-4 text-3xl leading-tight font-bold text-[#002753] md:text-5xl">
                                        Registration received for <br />
                                        <span className="text-[#194781]">{tenant.name}</span>
                                    </h1>
                                    <p className="max-w-2xl text-base leading-relaxed text-[#434750]">{statusCopy}</p>
                                </header>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <InfoStat
                                        icon={<BadgeCheck className="size-5" />}
                                        label="Current status"
                                        value={statusLabel}
                                        description="Your tenant cannot access the platform until activation is complete."
                                    />
                                    <InfoStat
                                        icon={<Clock3 className="size-5" />}
                                        label="What happens next"
                                        value="Platform review"
                                        description="A super admin verifies the company details and activates the workspace."
                                    />
                                    <InfoStat
                                        icon={<BellRing className="size-5" />}
                                        label="Notification"
                                        value={tenant.contact_email || 'Primary admin email'}
                                        description="We will send the activation update to the registered administrator."
                                    />
                                </div>

                                {flash.success && (
                                    <div className="mt-8 rounded-2xl border border-[#00b9ce]/20 bg-[#00b9ce]/10 p-5 text-sm text-[#002753]">
                                        {flash.success}
                                    </div>
                                )}

                                <div className="mt-10 rounded-2xl border border-[#c3c6d1]/15 bg-white p-6">
                                    <h3 className="text-lg font-bold text-[#002753]">What you can expect</h3>
                                    <ul className="mt-5 space-y-4 text-sm leading-6 text-[#434750]">
                                        <li className="flex gap-3">
                                            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#083d77]" />
                                            Your tenant workspace has already been created and linked to your administrator account.
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#083d77]" />
                                            Access to dashboards, submissions, evidence, and reports will open automatically once the tenant is activated.
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#083d77]" />
                                            If you are currently impersonating an inactive tenant user, this holding page will remain the landing page until activation.
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#c3c6d1]/15 pt-8">
                                    <Link href={route('home')} className="text-sm font-bold text-[#002753] hover:underline">
                                        Back to home
                                    </Link>

                                    <Button asChild className="rounded-full bg-[#002753] px-8 py-6 text-base font-bold text-white shadow-lg shadow-[#002753]/20">
                                        <Link href={route('logout')} method="post" as="button">
                                            <LogOut className="size-4" />
                                            Sign out
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-8 bg-[#f2f4f6]/30 p-8 lg:col-span-4">
                                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-square">
                                    <img
                                        className="absolute inset-0 h-full w-full object-cover grayscale brightness-50"
                                        alt="Monumental architecture"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaIRuQ4x_OmZ999tMbJ02_ySlS15C1VEAGjAXwKlK0YccxLDHoIwFUEUb1gUSLTELewmTRL074j5nbhUoAjPKvbYLU-1mIAjyp2RzvdaBvEwPFr3XwQGPsvWEslUVDN6961zxFKUym-1MfNa5TcSGFqRtgFCIg0u3uPKeGeNt4e_5CNtMTX2gGm_RUpJ12W0n7gMdWWqO-QG6pwymXlezyIqH3j7OdmJFh41MLiPUrQx6aJbBGgeEurlM-bnvF2lNfwsRHaGiPvHA"
                                    />
                                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#002753]/90 via-[#002753]/40 to-transparent p-6">
                                        <ShieldCheck className="mb-3 size-8 text-[#00daf3]" />
                                        <h4 className="mb-2 text-lg font-bold text-white">Activation in progress</h4>
                                        <p className="text-xs leading-relaxed text-[#83a9ea]">
                                            We hold access until the workspace is approved, so the platform opens with the correct tenant state from day one.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6 rounded-2xl border border-[#c3c6d1]/15 bg-white p-6">
                                    <h5 className="border-b border-[#c3c6d1]/30 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#002753]">
                                        Activation milestones
                                    </h5>
                                    <ul className="space-y-5">
                                        <StatusMilestone
                                            state="done"
                                            title="Registration completed"
                                            description="Company and administrator information has been submitted successfully."
                                        />
                                        <StatusMilestone
                                            state="active"
                                            title="Workspace pending activation"
                                            description="Your tenant currently exists in a non-active state and is awaiting review."
                                        />
                                        <StatusMilestone
                                            state="upcoming"
                                            title="Dashboard access unlocked"
                                            description="Once activated, you will be able to sign in normally and access the full workspace."
                                        />
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoStat({
    icon,
    label,
    value,
    description,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-[#c3c6d1]/15 bg-white p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d6e3ff] text-[#083d77]">{icon}</div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#434750]">{label}</p>
            <p className="mt-3 text-lg font-bold text-[#002753]">{value}</p>
            <p className="mt-2 text-sm leading-6 text-[#434750]">{description}</p>
        </div>
    );
}

function StatusMilestone({
    state,
    title,
    description,
}: {
    state: 'done' | 'active' | 'upcoming';
    title: string;
    description: string;
}) {
    const icon =
        state === 'done' ? (
            <Check className="size-3 text-[#002753]" />
        ) : state === 'active' ? (
            <div className="h-1.5 w-1.5 rounded-full bg-[#00daf3]" />
        ) : null;

    const wrapperClass =
        state === 'done'
            ? 'bg-[#00daf3]'
            : state === 'active'
              ? 'bg-[#083d77] animate-pulse'
              : 'border border-[#737781] bg-transparent';

    return (
        <li className={`flex items-start gap-3 ${state === 'upcoming' ? 'opacity-50' : ''}`}>
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${wrapperClass}`}>{icon}</div>
            <div>
                <p className="text-xs font-bold text-[#002753]">{title}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-[#434750]">{description}</p>
            </div>
        </li>
    );
}
