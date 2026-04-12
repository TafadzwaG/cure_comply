import InputError from '@/components/input-error';
import { PhoneInput } from '@/components/phone-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import privacyCureLogo from '@/images/privacycure-logo.png';
import { SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    BadgeCheck,
    Building2,
    BriefcaseBusiness,
    Check,
    ContactRound,
    MapPinned,
    Phone,
    ShieldCheck,
    Sparkles,
    UserRound,
} from 'lucide-react';

const employmentTypes = [
    { value: 'full_time', label: 'Full time' },
    { value: 'part_time', label: 'Part time' },
    { value: 'contract', label: 'Contract' },
    { value: 'intern', label: 'Intern' },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <Label>{children}</Label>;
}

function FormInput({
    id,
    error,
    className = '',
    ...props
}: React.ComponentProps<typeof Input> & { error?: string; className?: string }) {
    return (
        <Input
            id={id}
            className={error ? `border-destructive ${className}`.trim() : className}
            {...props}
        />
    );
}

export default function CompleteProfile({
    employeeProfile,
    role,
    department,
}: {
    employeeProfile?: {
        job_title?: string | null;
        branch?: string | null;
        phone?: string | null;
        alternate_phone?: string | null;
        employment_type?: string | null;
    } | null;
    role?: string | null;
    department?: {
        id: number;
        name: string;
    } | null;
}) {
    const { auth } = usePage<SharedData>().props;

    const form = useForm({
        name: auth.user?.name ?? '',
        job_title: employeeProfile?.job_title ?? '',
        branch: employeeProfile?.branch ?? '',
        phone: employeeProfile?.phone ?? '',
        alternate_phone: employeeProfile?.alternate_phone ?? '',
        employment_type: employeeProfile?.employment_type ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.patch(route('employee-profile.complete.update'), {
            preserveScroll: true,
            onError: (errors) => {
                const message = Object.values(errors).filter(Boolean).join('\n') || 'Unable to complete your profile. Please review the form and try again.';

                toast.error(message);
            },
            onSuccess: () => {
                toast.success('Profile completed. Opening your dashboard.');
            },
        });
    };

    return (
        <>
            <Head title="Complete Profile">
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <style>{`
                    body { font-family: 'Inter', sans-serif; }
                    h1, h2, h3, h4, h5 { font-family: 'Plus Jakarta Sans', sans-serif; }
                    .complete-profile-root { background: #f7f9fb; color: #191c1e; }
                    .dark .complete-profile-root { background: #020817; color: #f8fafc; }
                    .dark .complete-profile-root .complete-profile-shell {
                        background: #020817;
                        border-color: rgba(148,163,184,0.24);
                    }
                    .dark .complete-profile-root .complete-profile-topbar {
                        background: rgba(15,23,42,0.82);
                        border-color: rgba(148,163,184,0.2);
                    }
                    .dark .complete-profile-root .complete-profile-aside {
                        background: rgba(15,23,42,0.52);
                    }
                    .dark .complete-profile-root .complete-profile-card {
                        background: #0f172a;
                        border-color: rgba(148,163,184,0.2);
                    }
                    .dark .complete-profile-root h1,
                    .dark .complete-profile-root h3,
                    .dark .complete-profile-root h4,
                    .dark .complete-profile-root h5,
                    .dark .complete-profile-root label,
                    .dark .complete-profile-root .complete-profile-brand,
                    .dark .complete-profile-root .complete-profile-step {
                        color: #f8fafc !important;
                    }
                    .dark .complete-profile-root p,
                    .dark .complete-profile-root .complete-profile-muted {
                        color: rgba(226,232,240,0.78) !important;
                    }
                    .dark .complete-profile-root h1 span {
                        color: #93c5fd !important;
                    }
                    .dark .complete-profile-root .complete-profile-support-link {
                        color: rgba(226,232,240,0.78) !important;
                    }
                    .dark .complete-profile-root .complete-profile-support-link:hover {
                        color: #f8fafc !important;
                    }
                `}</style>
            </Head>

            <div className="complete-profile-root min-h-screen bg-[#f7f9fb] text-[#191c1e]">
                <div className="mx-auto w-full max-w-[96rem]">
                    <div className="complete-profile-shell overflow-hidden border border-[#c3c6d1]/15 bg-[#f7f9fb] shadow-[0_24px_70px_-40px_rgba(0,39,83,0.22)]">
                        <div className="complete-profile-topbar flex flex-col items-center justify-between gap-6 border-b border-[#c3c6d1]/15 bg-[#f2f4f6]/70 px-8 py-6 md:flex-row">
                            <Link href={route('home')} className="flex items-center gap-3">
                                <img src={privacyCureLogo} alt="Privacy Cure" className="h-9 w-auto" />
                                <span className="complete-profile-brand text-lg font-extrabold tracking-tight text-[#002753]">Privacy Cure</span>
                            </Link>

                            <div className="flex w-full items-center gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
                                <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#002753]/10 px-3 py-1">
                                    <span className="h-2 w-2 rounded-full bg-[#002753]" />
                                    <span className="complete-profile-step text-[10px] font-bold uppercase tracking-widest text-[#002753]">1. Identity</span>
                                </div>
                                <div className="h-px w-4 bg-[#c3c6d1]/40" />
                                <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#002753]/10 px-3 py-1">
                                    <span className="h-2 w-2 rounded-full bg-[#002753]" />
                                    <span className="complete-profile-step text-[10px] font-bold uppercase tracking-widest text-[#002753]">2. Profile</span>
                                </div>
                                <div className="h-px w-4 bg-[#c3c6d1]/40" />
                                <div className="flex shrink-0 items-center gap-2 px-3 py-1">
                                    <span className="h-2 w-2 rounded-full bg-[#c3c6d1]" />
                                    <span className="complete-profile-muted text-[10px] font-bold uppercase tracking-widest text-[#434750]">3. Workspace</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            <div className="border-r border-[#c3c6d1]/15 p-8 md:p-12 lg:col-span-8">
                                <header className="mb-12">
                                    <span className="mb-4 inline-flex items-center rounded-full bg-[#00444d] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#00b9ce]">
                                        Profile completion
                                    </span>
                                    <h1 className="mb-4 text-3xl leading-tight font-bold text-[#002753] md:text-5xl">
                                        Complete Your Workspace <br />
                                        <span className="text-[#194781]">Identity Layer</span>
                                    </h1>
                                    <p className="max-w-2xl text-base leading-relaxed text-[#434750]">
                                        Your profile needs a minimum operational footprint before the platform can route dashboards,
                                        assignments, compliance tasks, and support workflows correctly.
                                    </p>
                                </header>

                                <form onSubmit={submit} noValidate className="space-y-12">
                                    <section className="space-y-8">
                                        <h3 className="flex items-center gap-3 text-xl font-bold text-[#002753]">
                                            <span className="h-6 w-1.5 rounded-full bg-[#00daf3]" />
                                            Identity Profile
                                        </h3>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="space-y-2 md:col-span-2">
                                                <FieldLabel>Full Name</FieldLabel>
                                                <FormInput
                                                    id="name"
                                                    name="name"
                                                    value={form.data.name}
                                                    onChange={(event) => form.setData('name', event.target.value)}
                                                    placeholder="Your full name"
                                                    error={form.errors.name}
                                                    required
                                                    autoComplete="name"
                                                />
                                                <InputError message={form.errors.name} />
                                            </div>

                                            <div className="space-y-2">
                                                <FieldLabel>Job Title</FieldLabel>
                                                <FormInput
                                                    id="job_title"
                                                    name="job_title"
                                                    value={form.data.job_title}
                                                    onChange={(event) => form.setData('job_title', event.target.value)}
                                                    placeholder="e.g. Compliance Officer"
                                                    error={form.errors.job_title}
                                                    required
                                                    autoComplete="organization-title"
                                                />
                                                <InputError message={form.errors.job_title} />
                                            </div>

                                            <div className="space-y-2">
                                                <FieldLabel>Branch / Office</FieldLabel>
                                                <FormInput
                                                    id="branch"
                                                    name="branch"
                                                    value={form.data.branch}
                                                    onChange={(event) => form.setData('branch', event.target.value)}
                                                    placeholder="e.g. Harare HQ"
                                                    error={form.errors.branch}
                                                    required
                                                />
                                                <InputError message={form.errors.branch} />
                                            </div>

                                            <div className="space-y-2">
                                                <FieldLabel>Primary Phone</FieldLabel>
                                                <PhoneInput
                                                    id="phone"
                                                    name="phone"
                                                    value={form.data.phone}
                                                    onChange={(value) => form.setData('phone', value)}
                                                    placeholder="77 123 4567"
                                                    error={form.errors.phone}
                                                    required
                                                    autoComplete="tel"
                                                />
                                                <InputError message={form.errors.phone} />
                                            </div>

                                            <div className="space-y-2">
                                                <FieldLabel>Alternate Phone</FieldLabel>
                                                <PhoneInput
                                                    id="alternate_phone"
                                                    name="alternate_phone"
                                                    value={form.data.alternate_phone}
                                                    onChange={(value) => form.setData('alternate_phone', value)}
                                                    placeholder="Optional alternate number"
                                                    error={form.errors.alternate_phone}
                                                    autoComplete="tel-national"
                                                />
                                                <InputError message={form.errors.alternate_phone} />
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <FieldLabel>Employment Type</FieldLabel>
                                                <Select value={form.data.employment_type || '__unset__'} onValueChange={(value) => form.setData('employment_type', value === '__unset__' ? '' : value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select employment type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="__unset__">Prefer not to say</SelectItem>
                                                        {employmentTypes.map((type) => (
                                                            <SelectItem key={type.value} value={type.value}>
                                                                {type.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={form.errors.employment_type} />
                                            </div>
                                        </div>
                                    </section>

                                    <div className="flex items-center justify-between border-t border-[#c3c6d1]/15 pt-8">
                                        <div className="complete-profile-muted flex items-center gap-2 text-sm font-medium text-[#434750]">
                                            <Sparkles className="size-4 text-[#00b9ce]" />
                                            Complete this once to unlock your dashboard.
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={form.processing}
                                            className="rounded-full bg-[#002753] px-8 py-6 text-base font-bold text-white shadow-lg shadow-[#002753]/20 hover:bg-[#00444d] hover:text-[#00b9ce]"
                                        >
                                            <BadgeCheck className="size-4" />
                                            Complete profile and continue
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            <div className="complete-profile-aside space-y-8 bg-[#f2f4f6]/30 p-8 lg:col-span-4">
                                <div className="space-y-4 rounded-2xl overflow-hidden">
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-square">
                                        <img
                                            className="absolute inset-0 h-full w-full object-cover grayscale brightness-50 transition-all duration-700 hover:grayscale-0"
                                            alt="Structured workplace architecture"
                                            src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80"
                                        />
                                        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#002753]/90 via-[#002753]/40 to-transparent p-6">
                                            <ShieldCheck className="mb-3 size-8 text-[#00daf3]" />
                                            <h4 className="mb-2 text-lg font-bold text-white">Profile before access</h4>
                                            <p className="text-xs leading-relaxed text-[#83a9ea]">
                                                This final identity pass ensures dashboards, reporting, and workflow assignment stay accurate from your first login.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="complete-profile-card space-y-6 rounded-2xl border border-[#c3c6d1]/15 bg-white p-6">
                                    <h5 className="border-b border-[#c3c6d1]/30 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#002753]">
                                        Activation milestones
                                    </h5>
                                    <ul className="space-y-5">
                                        <Milestone
                                            icon={<Check className="size-3 text-[#002753]" />}
                                            iconClass="bg-[#00daf3]"
                                            title="Account authenticated"
                                            description="Your login identity is already confirmed."
                                        />
                                        <Milestone
                                            icon={<div className="h-1.5 w-1.5 rounded-full bg-[#00daf3]" />}
                                            iconClass="bg-[#083d77] animate-pulse"
                                            title="Profile finalization"
                                            description="Operational details are being captured for tenant routing."
                                        />
                                        <Milestone
                                            icon={null}
                                            iconClass="border border-[#737781] bg-transparent"
                                            title="Dashboard access"
                                            description="Your workspace opens immediately after completion."
                                            dim
                                        />
                                    </ul>
                                </div>

                                <div className="space-y-4">
                                    <InfoRow icon={UserRound} title="Role" description={role ? role.replace('_', ' ') : 'Workspace user'} />
                                    <InfoRow icon={Building2} title="Department" description={department?.name ?? 'Will be assigned by your administrator'} />
                                    <InfoRow icon={MapPinned} title="Branch reporting" description="Your branch is used in reports and operational routing." />
                                    <InfoRow icon={Phone} title="Support reachability" description="Phone details help your company and support team reach you quickly." />
                                    <InfoRow icon={BriefcaseBusiness} title="Assignment accuracy" description="Training and compliance work depend on a complete profile." />
                                </div>

                                <div className="flex flex-col gap-4 pt-4">
                                    <div className="complete-profile-support-link flex cursor-pointer items-center gap-3 text-[#434750] transition-colors hover:text-[#002753]">
                                        <ContactRound className="size-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Support</span>
                                    </div>
                                    <div className="complete-profile-support-link flex cursor-pointer items-center gap-3 text-[#434750] transition-colors hover:text-[#002753]">
                                        <ShieldCheck className="size-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Access policy</span>
                                    </div>
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

function InfoRow({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof UserRound;
    title: string;
    description: string;
}) {
    return (
        <div className="complete-profile-card rounded-2xl border border-[#c3c6d1]/15 bg-white p-5">
            <div className="mb-3 inline-flex rounded-xl border border-[#c3c6d1]/15 bg-[#f2f4f6] p-2.5">
                <Icon className="size-4 text-[#002753]" />
            </div>
            <p className="font-medium text-[#002753]">{title}</p>
            <p className="mt-2 text-sm leading-6 text-[#434750]">{description}</p>
        </div>
    );
}
