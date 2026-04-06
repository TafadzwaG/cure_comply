import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import privacyCureLogo from '@/images/privacycure-logo.png';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Check, KeyRound, MailCheck, ShieldCheck } from 'lucide-react';

type Invitation = {
    token: string;
    name: string;
    email: string;
    role: string;
    tenant_id?: number | null;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <Label>{children}</Label>;
}

function LightInput({
    className = '',
    ...props
}: React.ComponentProps<typeof Input>) {
    return <Input className={`border-[#c3c6d1]/20 bg-white text-[#191c1e] placeholder:text-[#737781] ${className}`.trim()} {...props} />;
}

export default function AcceptInvitation({ invitation }: { invitation: Invitation }) {
    const form = useForm({
        password: '',
        password_confirmation: '',
        job_title: '',
        phone: '',
    });

    const roleLabel = invitation.role.replaceAll('_', ' ');
    const isPlatformAdmin = invitation.role === 'super_admin';

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(route('invitations.accept.store', invitation.token));
    };

    return (
        <>
            <Head title="Accept Invitation">
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <style>{`
                    body { font-family: 'Inter', sans-serif; }
                    h1, h2, h3, h4, h5 { font-family: 'Plus Jakarta Sans', sans-serif; }
                `}</style>
            </Head>

            <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
                <div className="mx-auto w-full max-w-[96rem]">
                    <div className="overflow-hidden rounded-2xl border border-[#c3c6d1]/15 bg-[#f7f9fb] shadow-[0_24px_70px_-40px_rgba(0,39,83,0.22)]">
                        <div className="flex flex-col items-center justify-between gap-6 border-b border-[#c3c6d1]/15 bg-[#f2f4f6]/70 px-8 py-6 md:flex-row">
                            <Link href={route('home')} className="flex items-center gap-3">
                                <img src={privacyCureLogo} alt="Privacy Cure" className="h-9 w-auto" />
                                <span className="text-lg font-extrabold tracking-tight text-[#002753]">Privacy Cure</span>
                            </Link>

                            <div className="flex w-full items-center gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
                                <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#002753]/10 px-3 py-1">
                                    <span className="h-2 w-2 rounded-full bg-[#002753]" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#002753]">1. Invitation</span>
                                </div>
                                <div className="h-px w-4 bg-[#c3c6d1]/40" />
                                <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#002753]/10 px-3 py-1">
                                    <span className="h-2 w-2 rounded-full bg-[#002753]" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#002753]">2. Credentials</span>
                                </div>
                                <div className="h-px w-4 bg-[#c3c6d1]/40" />
                                <div className="flex shrink-0 items-center gap-2 px-3 py-1">
                                    <span className="h-2 w-2 rounded-full bg-[#c3c6d1]" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#434750]">3. Workspace</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            <div className="border-r border-[#c3c6d1]/15 p-8 md:p-12 lg:col-span-8">
                                <header className="mb-12">
                                    <span className="mb-4 inline-flex items-center rounded-full bg-[#00444d] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#00b9ce]">
                                        Invitation acceptance
                                    </span>
                                    <h1 className="mb-4 text-3xl leading-tight font-bold text-[#002753] md:text-5xl">
                                        Complete Your Access
                                        <br />
                                        <span className="text-[#194781]">Activation Layer</span>
                                    </h1>
                                    <p className="max-w-2xl text-base leading-relaxed text-[#434750]">
                                        {invitation.name}, you were invited as a {roleLabel}. Set your password and complete the minimum details needed to enter the platform securely.
                                    </p>
                                </header>

                                <form onSubmit={submit} noValidate className="space-y-12">
                                    <section className="space-y-8">
                                        <h3 className="flex items-center gap-3 text-xl font-bold text-[#002753]">
                                            <span className="h-6 w-1.5 rounded-full bg-[#00daf3]" />
                                            Invitation identity
                                        </h3>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="space-y-2 md:col-span-2">
                                                <FieldLabel>Email address</FieldLabel>
                                                <LightInput value={invitation.email} disabled className="disabled:border-[#c3c6d1]/20 disabled:bg-[#f2f4f6] disabled:text-[#434750] disabled:opacity-100" />
                                            </div>

                                            <div className="space-y-2">
                                                <FieldLabel>Assigned role</FieldLabel>
                                                <div className="flex h-10 items-center rounded-md border border-[#c3c6d1]/20 bg-white px-3 text-sm capitalize text-[#002753]">
                                                    {roleLabel}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <FieldLabel>Workspace scope</FieldLabel>
                                                <div className="flex h-10 items-center rounded-md border border-[#c3c6d1]/20 bg-white px-3 text-sm text-[#002753]">
                                                    {isPlatformAdmin ? 'Global platform access' : 'Tenant workspace access'}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-8">
                                        <h3 className="flex items-center gap-3 text-xl font-bold text-[#002753]">
                                            <span className="h-6 w-1.5 rounded-full bg-[#002753]" />
                                            Access credentials
                                        </h3>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <FieldLabel>Password</FieldLabel>
                                                <LightInput
                                                    id="password"
                                                    name="password"
                                                    type="password"
                                                    value={form.data.password}
                                                    onChange={(event) => form.setData('password', event.target.value)}
                                                    placeholder="Create a strong password"
                                                    autoComplete="new-password"
                                                />
                                                <InputError message={form.errors.password} />
                                            </div>

                                            <div className="space-y-2">
                                                <FieldLabel>Confirm password</FieldLabel>
                                                <LightInput
                                                    id="password_confirmation"
                                                    name="password_confirmation"
                                                    type="password"
                                                    value={form.data.password_confirmation}
                                                    onChange={(event) => form.setData('password_confirmation', event.target.value)}
                                                    placeholder="Confirm your password"
                                                    autoComplete="new-password"
                                                />
                                                <InputError message={form.errors.password_confirmation} />
                                            </div>

                                            <div className="space-y-2">
                                                <FieldLabel>Job title</FieldLabel>
                                                <LightInput
                                                    id="job_title"
                                                    name="job_title"
                                                    value={form.data.job_title}
                                                    onChange={(event) => form.setData('job_title', event.target.value)}
                                                    placeholder={isPlatformAdmin ? 'e.g. Platform Support Lead' : 'e.g. Compliance Officer'}
                                                />
                                                <InputError message={form.errors.job_title} />
                                            </div>

                                            <div className="space-y-2">
                                                <FieldLabel>Phone</FieldLabel>
                                                <LightInput
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    value={form.data.phone}
                                                    onChange={(event) => form.setData('phone', event.target.value)}
                                                    placeholder="+263..."
                                                    autoComplete="tel"
                                                />
                                                <InputError message={form.errors.phone} />
                                            </div>
                                        </div>
                                    </section>

                                    <div className="flex items-center justify-between border-t border-[#c3c6d1]/15 pt-8">
                                        <Link href={route('home')} className="group flex items-center gap-2 text-sm font-bold text-[#002753] hover:underline">
                                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                                            Back to Welcome
                                        </Link>

                                        <Button
                                            type="submit"
                                            disabled={form.processing}
                                            className="rounded-full bg-[#002753] px-8 py-6 text-base font-bold text-white shadow-lg shadow-[#002753]/20 hover:bg-[#00444d] hover:text-[#00b9ce]"
                                        >
                                            <BadgeCheck className="size-4" />
                                            Activate account
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            <div className="space-y-8 bg-[#f2f4f6]/30 p-8 lg:col-span-4">
                                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-square">
                                    <img
                                        className="absolute inset-0 h-full w-full object-cover grayscale brightness-50 transition-all duration-700 hover:grayscale-0"
                                        alt="Access architecture"
                                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
                                    />
                                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#002753]/90 via-[#002753]/40 to-transparent p-6">
                                        <ShieldCheck className="mb-3 size-8 text-[#00daf3]" />
                                        <h4 className="mb-2 text-lg font-bold text-white">Secure first entry</h4>
                                        <p className="text-xs leading-relaxed text-[#83a9ea]">
                                            This one-time flow activates your account and prepares your access path into Privacy Cure Compliance.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6 rounded-2xl border border-[#c3c6d1]/15 bg-white p-6">
                                    <h5 className="border-b border-[#c3c6d1]/30 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#002753]">
                                        Acceptance milestones
                                    </h5>
                                    <ul className="space-y-5">
                                        <Milestone
                                            icon={<Check className="size-3 text-[#002753]" />}
                                            iconClass="bg-[#00daf3]"
                                            title="Invitation verified"
                                            description="Your token is valid and ready for account activation."
                                        />
                                        <Milestone
                                            icon={<div className="h-1.5 w-1.5 rounded-full bg-[#00daf3]" />}
                                            iconClass="bg-[#083d77] animate-pulse"
                                            title="Credentials captured"
                                            description="Your password and baseline identity details are being stored securely."
                                        />
                                        <Milestone
                                            icon={null}
                                            iconClass="border border-[#737781] bg-transparent"
                                            title="Dashboard access"
                                            description="You will be signed in and routed into the correct workspace flow immediately after activation."
                                            dim
                                        />
                                    </ul>
                                </div>

                                <div className="grid gap-4">
                                    <InfoCard
                                        icon={MailCheck}
                                        title="Invitation recipient"
                                        description="This activation is bound to the email address that received the original invitation."
                                    />
                                    <InfoCard
                                        icon={KeyRound}
                                        title="Access control"
                                        description="The password you set here becomes the login credential for your new account."
                                    />
                                    <InfoCard
                                        icon={ShieldCheck}
                                        title="Post-activation routing"
                                        description="After sign-in, the platform will still enforce tenant activation and profile completion where required."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function Milestone({
    icon,
    iconClass,
    title,
    description,
    dim = false,
}: {
    icon: React.ReactNode;
    iconClass: string;
    title: string;
    description: string;
    dim?: boolean;
}) {
    return (
        <li className={`flex items-start gap-3 ${dim ? 'opacity-40' : ''}`}>
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${iconClass}`}>{icon}</div>
            <div>
                <p className="text-xs font-bold text-[#002753]">{title}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-[#434750]">{description}</p>
            </div>
        </li>
    );
}

function InfoCard({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof ShieldCheck;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-[#c3c6d1]/15 bg-white p-5">
            <div className="mb-3 inline-flex rounded-xl border border-[#c3c6d1]/15 bg-[#f2f4f6] p-2.5">
                <Icon className="size-4 text-[#002753]" />
            </div>
            <p className="font-semibold text-[#002753]">{title}</p>
            <p className="mt-2 text-sm leading-6 text-[#434750]">{description}</p>
        </div>
    );
}
