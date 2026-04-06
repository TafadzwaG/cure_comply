import InputError from '@/components/input-error';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatLongDateTime } from '@/lib/date';
import PlatformLayout from '@/layouts/platform-layout';
import { Department, Tenant } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    BadgeCheck,
    Building2,
    Check,
    Crown,
    Mail,
    MailCheck,
    Rocket,
    ShieldCheck,
    Sparkles,
    UserCog,
    UsersRound,
} from 'lucide-react';

type InvitationCreateProps = {
    departments: Array<Department & { tenant_id?: number | null }>;
    tenants: Tenant[];
    isSuperAdmin: boolean;
    recentInvitations: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        tenant?: string | null;
        department?: string | null;
        created_at?: string | null;
        expires_at?: string | null;
        accepted_at?: string | null;
        status: string;
    }>;
};

const tenantRoles = [
    { value: 'employee', label: 'Employee' },
    { value: 'reviewer', label: 'Reviewer' },
    { value: 'company_admin', label: 'Company admin' },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <Label>{children}</Label>;
}

function statusLabel(status?: string | null) {
    if (!status) {
        return 'Unknown';
    }

    return status.replace('_', ' ');
}

export default function InvitationsCreate({ departments, tenants, isSuperAdmin, recentInvitations }: InvitationCreateProps) {
    const form = useForm({
        tenant_id: '',
        is_platform_admin: false,
        name: '',
        email: '',
        role: 'employee',
        department_id: '',
    });

    const filteredDepartments = isSuperAdmin
        ? departments.filter((department) => String(department.tenant_id ?? '') === String(form.data.tenant_id))
        : departments;

    const selectedTenant = tenants.find((tenant) => String(tenant.id) === String(form.data.tenant_id));
    const isPlatformAdmin = form.data.is_platform_admin;
    const roleOptions = isSuperAdmin ? tenantRoles : tenantRoles.filter((role) => role.value !== 'company_admin');

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(route('invitations.store'));
    };

    return (
        <PlatformLayout>
            <Head title="Invite User" />

            <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-[#c3c6d1]/15 bg-[#f7f9fb] shadow-[0_24px_70px_-40px_rgba(0,39,83,0.22)]">
                    <div className="flex flex-col items-center justify-between gap-6 border-b border-[#c3c6d1]/15 bg-[#f2f4f6]/70 px-8 py-6 md:flex-row">
                        <div className="space-y-2">
                            <span className="inline-flex items-center rounded-full bg-[#00444d] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#00b9ce]">
                                Invitation control
                            </span>
                            <div>
                                <h1 className="text-3xl font-bold text-[#002753] md:text-4xl">Invite a user into the platform</h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#434750]">
                                    Send a secure queued invitation into a tenant workspace, or create another platform administrator when global support access is needed.
                                </p>
                            </div>
                        </div>

                        <div className="flex w-full items-center gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
                            <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#002753]/10 px-3 py-1">
                                <span className="h-2 w-2 rounded-full bg-[#002753]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#002753]">1. Identity</span>
                            </div>
                            <div className="h-px w-4 bg-[#c3c6d1]/40" />
                            <div className="flex shrink-0 items-center gap-2 px-3 py-1">
                                <span className="h-2 w-2 rounded-full bg-[#c3c6d1]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#434750]">2. Routing</span>
                            </div>
                            <div className="h-px w-4 bg-[#c3c6d1]/40" />
                            <div className="flex shrink-0 items-center gap-2 px-3 py-1">
                                <span className="h-2 w-2 rounded-full bg-[#c3c6d1]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#434750]">3. Delivery</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        <div className="border-r border-[#c3c6d1]/15 p-8 md:p-12 lg:col-span-8">
                            <header className="mb-12">
                                <span className="mb-4 inline-flex items-center rounded-full bg-[#e7deff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#494265]">
                                    Access provisioning
                                </span>
                                <h2 className="mb-4 text-3xl font-bold text-[#002753] md:text-5xl">
                                    Build the right access path
                                    <br />
                                    <span className="text-[#194781]">before the invite is sent</span>
                                </h2>
                                <p className="max-w-3xl text-base leading-relaxed text-[#434750]">
                                    Super admins can place invitations directly into a company workspace or create a new platform administrator. Company admins stay tenant-scoped and only invite into their own company.
                                </p>
                            </header>

                            <form onSubmit={submit} noValidate className="space-y-12">
                                {isSuperAdmin ? (
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3 text-xl font-bold text-[#002753]">
                                            <span className="h-6 w-1.5 rounded-full bg-[#00daf3]" />
                                            Invitation mode
                                        </div>

                                        <div className="rounded-2xl border border-[#c3c6d1]/15 bg-white p-5">
                                            <div className="flex items-start gap-4">
                                                <Checkbox
                                                    id="is_platform_admin"
                                                    checked={form.data.is_platform_admin}
                                                    onCheckedChange={(checked) => {
                                                        const isChecked = checked === true;
                                                        form.setData((data) => ({
                                                            ...data,
                                                            is_platform_admin: isChecked,
                                                            tenant_id: isChecked ? '' : data.tenant_id,
                                                            department_id: '',
                                                            role: isChecked ? 'super_admin' : 'employee',
                                                        }));
                                                    }}
                                                    className="mt-1 rounded-md data-[state=checked]:border-[#002753] data-[state=checked]:bg-[#002753]"
                                                />
                                                <div className="space-y-2">
                                                    <Label htmlFor="is_platform_admin" className="cursor-pointer text-base font-semibold text-[#002753]">
                                                        Invite as platform admin
                                                    </Label>
                                                    <p className="text-sm leading-6 text-[#434750]">
                                                        Use this for another internal administrator who should manage the platform globally. When this is enabled, the invite is not tied to a tenant workspace.
                                                    </p>
                                                    <InputError message={form.errors.is_platform_admin} />
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                ) : null}

                                <section className="space-y-8">
                                    <h3 className="flex items-center gap-3 text-xl font-bold text-[#002753]">
                                        <span className="h-6 w-1.5 rounded-full bg-[#002753]" />
                                        Invite profile
                                    </h3>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-2 md:col-span-2">
                                            <FieldLabel>Full name</FieldLabel>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={form.data.name}
                                                onChange={(event) => form.setData('name', event.target.value)}
                                                placeholder="e.g. Nyasha Moyo"
                                                required
                                                autoComplete="name"
                                            />
                                            <InputError message={form.errors.name} />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <FieldLabel>Email address</FieldLabel>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={form.data.email}
                                                onChange={(event) => form.setData('email', event.target.value)}
                                                placeholder="name@company.zw"
                                                required
                                                autoComplete="email"
                                            />
                                            <InputError message={form.errors.email} />
                                        </div>

                                        {isSuperAdmin && !isPlatformAdmin ? (
                                            <div className="space-y-2 md:col-span-2">
                                                <FieldLabel>Company workspace</FieldLabel>
                                                <Select value={form.data.tenant_id} onValueChange={(value) => form.setData('tenant_id', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a company" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {tenants.map((tenant) => (
                                                            <SelectItem key={tenant.id} value={String(tenant.id)}>
                                                                {tenant.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={form.errors.tenant_id} />
                                            </div>
                                        ) : null}

                                        {!isPlatformAdmin ? (
                                            <>
                                                <div className="space-y-2">
                                                    <FieldLabel>Role</FieldLabel>
                                                    <Select value={form.data.role} onValueChange={(value) => form.setData('role', value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a role" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {roleOptions.map((role) => (
                                                                <SelectItem key={role.value} value={role.value}>
                                                                    {role.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={form.errors.role} />
                                                </div>

                                                <div className="space-y-2">
                                                    <FieldLabel>Department</FieldLabel>
                                                    <Select
                                                        value={form.data.department_id || '__none__'}
                                                        onValueChange={(value) => form.setData('department_id', value === '__none__' ? '' : value)}
                                                        disabled={isSuperAdmin && !form.data.tenant_id}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a department" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="__none__">No department yet</SelectItem>
                                                            {filteredDepartments.map((department) => (
                                                                <SelectItem key={department.id} value={String(department.id)}>
                                                                    {department.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={form.errors.department_id} />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="space-y-2 md:col-span-2">
                                                <FieldLabel>Access level</FieldLabel>
                                                <div className="flex items-center gap-3 rounded-2xl border border-[#002753]/10 bg-[#d6e3ff] px-4 py-3">
                                                    <Crown className="size-5 text-[#083d77]" />
                                                    <div>
                                                        <p className="font-semibold text-[#002753]">Platform administrator</p>
                                                        <p className="text-sm text-[#194781]">Global access will be granted after invitation acceptance.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <div className="flex items-center justify-between border-t border-[#c3c6d1]/15 pt-8">
                                    <Link href={route('invitations.index')} className="text-sm font-bold text-[#002753] hover:underline">
                                        Back to invitations
                                    </Link>

                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        className="rounded-full bg-[#002753] px-8 py-6 text-base font-bold text-white shadow-lg shadow-[#002753]/20 hover:bg-[#00444d] hover:text-[#00b9ce]"
                                    >
                                        <Rocket className="size-4" />
                                        Send queued invitation
                                    </Button>
                                </div>

                                <section className="space-y-6 border-t border-[#c3c6d1]/15 pt-10">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-[#002753]">Recent invitations</h3>
                                            <p className="mt-1 text-sm leading-6 text-[#434750]">
                                                Monitor whether recent invites are still pending, have been accepted, or have expired.
                                            </p>
                                        </div>
                                        <Link href={route('invitations.index')} className="text-sm font-bold text-[#002753] hover:underline">
                                            View all invitations
                                        </Link>
                                    </div>

                                    <div className="overflow-hidden rounded-2xl border border-[#c3c6d1]/15 bg-white">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead>Invitee</TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead>Company</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Sent</TableHead>
                                                    <TableHead>Handled</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {recentInvitations.length ? (
                                                    recentInvitations.map((invitation) => (
                                                        <TableRow key={invitation.id}>
                                                            <TableCell>
                                                                <div>
                                                                    <p className="font-medium text-[#002753]">{invitation.name}</p>
                                                                    <p className="text-xs text-[#434750]">{invitation.email}</p>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="capitalize">{invitation.role.replaceAll('_', ' ')}</TableCell>
                                                            <TableCell>
                                                                <div>
                                                                    <p className="text-sm text-[#002753]">{invitation.tenant ?? 'Platform access'}</p>
                                                                    <p className="text-xs text-[#434750]">{invitation.department ?? 'No department'}</p>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <StatusBadge value={invitation.status} />
                                                            </TableCell>
                                                            <TableCell className="text-sm text-[#434750]">{formatLongDateTime(invitation.created_at)}</TableCell>
                                                            <TableCell className="text-sm text-[#434750]">
                                                                {invitation.accepted_at
                                                                    ? `Accepted ${formatLongDateTime(invitation.accepted_at)}`
                                                                    : invitation.status === 'expired'
                                                                      ? `Expired ${formatLongDateTime(invitation.expires_at)}`
                                                                      : 'Awaiting response'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="py-10 text-center text-sm text-[#434750]">
                                                            No invitations have been sent yet.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </section>
                            </form>
                        </div>

                        <div className="space-y-8 bg-[#f2f4f6]/30 p-8 lg:col-span-4">
                            <div className="rounded-2xl overflow-hidden">
                                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-square">
                                    <img
                                        className="absolute inset-0 h-full w-full object-cover grayscale brightness-50 transition-all duration-700 hover:grayscale-0"
                                        alt="Workspace access architecture"
                                        src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80"
                                    />
                                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#002753]/90 via-[#002753]/40 to-transparent p-6">
                                        <MailCheck className="mb-3 size-8 text-[#00daf3]" />
                                        <h4 className="mb-2 text-lg font-bold text-white">Queued delivery pipeline</h4>
                                        <p className="text-xs leading-relaxed text-[#83a9ea]">
                                            Invitations are written first, then dispatched onto the mail queue so SMTP delivery can happen safely outside the request cycle.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 rounded-2xl border border-[#c3c6d1]/15 bg-white p-6">
                                <h5 className="border-b border-[#c3c6d1]/30 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#002753]">
                                    Invitation milestones
                                </h5>
                                <ul className="space-y-5">
                                    <StatusMilestone
                                        icon={<BadgeCheck className="size-3 text-[#002753]" />}
                                        iconClass="bg-[#00daf3]"
                                        title="Invite payload prepared"
                                        description="Identity, routing, and role data are validated before the invite is created."
                                    />
                                    <StatusMilestone
                                        icon={<div className="h-1.5 w-1.5 rounded-full bg-[#00daf3]" />}
                                        iconClass="bg-[#083d77] animate-pulse"
                                        title="Email queued for SMTP delivery"
                                        description="The notification is pushed to the database queue and sent by the queue worker."
                                    />
                                    <StatusMilestone
                                        icon={null}
                                        iconClass="border border-[#737781] bg-transparent"
                                        title="Recipient completes setup"
                                        description="The invited user accepts the link, sets a password, and enters the platform."
                                        dim
                                    />
                                </ul>
                            </div>

                            <div className="grid gap-4">
                                <InfoCard
                                    icon={Building2}
                                    title="Company routing"
                                    description={
                                        isPlatformAdmin
                                            ? 'Platform administrators stay global and are not attached to a tenant.'
                                            : selectedTenant
                                              ? `${selectedTenant.name} is the destination workspace for this invitation.`
                                              : isSuperAdmin
                                                ? 'Choose the company first so department and role routing stay accurate.'
                                                : 'This invitation is automatically tied to your current tenant.'
                                    }
                                    subtle={isPlatformAdmin ? 'Global access path' : selectedTenant ? statusLabel(selectedTenant.status) : 'Awaiting tenant selection'}
                                />
                                <InfoCard
                                    icon={UsersRound}
                                    title="Access role"
                                    description={
                                        isPlatformAdmin
                                            ? 'This user will become a super admin after accepting the invitation.'
                                            : 'Use employee, reviewer, or company admin depending on the access they need in the workspace.'
                                    }
                                    subtle={isPlatformAdmin ? 'super admin' : form.data.role.replace('_', ' ')}
                                />
                                <InfoCard
                                    icon={Mail}
                                    title="SMTP delivery"
                                    description="Your configured SMTP mailer will send the invite from the queue worker instead of blocking the browser request."
                                    subtle="queue: mail"
                                />
                            </div>

                            <div className="rounded-2xl border border-[#c3c6d1]/15 bg-white p-5">
                                <div className="flex items-start gap-3">
                                    <Sparkles className="mt-0.5 size-4 text-[#00b9ce]" />
                                    <div className="space-y-2 text-sm leading-6 text-[#434750]">
                                        <p className="font-semibold text-[#002753]">Operational note</p>
                                        <p>Keep a queue worker running so queued invitation emails leave immediately after they are created.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PlatformLayout>
    );
}

function StatusMilestone({
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
        <li className={`flex items-start gap-3 ${dim ? 'opacity-50' : ''}`}>
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
    subtle,
}: {
    icon: typeof ShieldCheck;
    title: string;
    description: string;
    subtle: string;
}) {
    return (
        <div className="rounded-2xl border border-[#c3c6d1]/15 bg-white p-5">
            <div className="mb-3 inline-flex rounded-xl border border-[#c3c6d1]/15 bg-[#f2f4f6] p-2.5">
                <Icon className="size-4 text-[#002753]" />
            </div>
            <p className="font-semibold text-[#002753]">{title}</p>
            <p className="mt-2 text-sm leading-6 text-[#434750]">{description}</p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#194781]">{subtle}</p>
        </div>
    );
}
