import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PlatformLayout from '@/layouts/platform-layout';
import { Department, Tenant } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import moment from 'moment';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Building2,
    Crown,
    Mail,
    MailPlus,
    Send,
    ShieldCheck,
    UserPlus,
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

    const isPlatformAdmin = form.data.is_platform_admin;
    const roleOptions = tenantRoles;

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(route('invitations.store'), {
            onSuccess: () => toast.success('Invitation queued for delivery.'),
            onError: () => toast.error('Please fix the errors and try again.'),
        });
    };

    return (
        <PlatformLayout>
            <Head title="Invite User" />

            <div className="space-y-6">
                <PageHeader
                    title="Invite a user"
                    description="Queue an invitation into a company workspace, or create a new platform administrator."
                >
                    <Button asChild size="sm" className="bg-white text-[#0F2E52] hover:bg-white/90 hover:text-black">
                        <Link href={route('invitations.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to invitations
                        </Link>
                    </Button>
                </PageHeader>

                <form onSubmit={submit} noValidate>
                    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                        <div className="space-y-6">
                            {/* Mode */}
                            {isSuperAdmin && (
                                <Card className="border-[#14417A]/15 shadow-none">
                                    <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                                        <CardTitle className="flex items-center gap-2 text-[#0F2E52] dark:text-blue-200">
                                            <ShieldCheck className="h-4 w-4" />
                                            Invitation mode
                                        </CardTitle>
                                        <CardDescription>Decide whether this user is a tenant member or a global platform admin.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <label className="flex items-start gap-3 rounded-lg border border-[#14417A]/10 bg-[#14417A]/[0.03] p-4">
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
                                                className="mt-0.5"
                                            />
                                            <div className="space-y-1">
                                                <div className="text-sm font-semibold text-[#0F2E52] dark:text-blue-200">
                                                    Invite as platform admin
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Grants global access across all tenants. Not tied to a workspace.
                                                </p>
                                                <InputError message={form.errors.is_platform_admin} />
                                            </div>
                                        </label>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Profile */}
                            <Card className="border-[#14417A]/15 shadow-none">
                                <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                                    <CardTitle className="flex items-center gap-2 text-[#0F2E52] dark:text-blue-200">
                                        <UserPlus className="h-4 w-4" />
                                        Invite profile
                                    </CardTitle>
                                    <CardDescription>Identity, workspace routing, and access role.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5 p-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="name">Full name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={form.data.name}
                                                onChange={(e) => form.setData('name', e.target.value)}
                                                placeholder="e.g. Nyasha Moyo"
                                                required
                                                autoComplete="name"
                                            />
                                            <InputError message={form.errors.name} />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="email">Email address</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={form.data.email}
                                                onChange={(e) => form.setData('email', e.target.value)}
                                                placeholder="name@company.zw"
                                                required
                                                autoComplete="email"
                                            />
                                            <InputError message={form.errors.email} />
                                        </div>

                                        {isSuperAdmin && !isPlatformAdmin && (
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Company workspace</Label>
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
                                        )}

                                        {!isPlatformAdmin ? (
                                            <>
                                                <div className="space-y-2">
                                                    <Label>Role</Label>
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
                                                    <Label>Department</Label>
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
                                                <Label>Access level</Label>
                                                <div className="flex items-center gap-3 rounded-lg border border-[#14417A]/15 bg-[#14417A]/[0.04] p-4">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                        <Crown className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[#0F2E52] dark:text-blue-200">
                                                            Platform administrator
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Global access will be granted after the invite is accepted.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <Button
                                            type="submit"
                                            disabled={form.processing}
                                            className="bg-[#14417A] text-white hover:bg-[#0F2E52]"
                                        >
                                            <Send className="mr-2 h-4 w-4" />
                                            {form.processing ? 'Sending…' : 'Send invitation'}
                                        </Button>
                                        <Button asChild variant="outline">
                                            <Link href={route('invitations.index')}>
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Cancel
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent */}
                            <Card className="border-[#14417A]/15 shadow-none">
                                <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <CardTitle className="flex items-center gap-2 text-[#0F2E52] dark:text-blue-200">
                                                <Mail className="h-4 w-4" />
                                                Recent invitations
                                            </CardTitle>
                                            <CardDescription>Track whether recent invites are pending, accepted, or expired.</CardDescription>
                                        </div>
                                        <Link href={route('invitations.index')} className="text-sm font-medium text-[#14417A] hover:underline">
                                            View all
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-0 pb-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-border/60">
                                                <TableHead>Invitee</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Company</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Sent</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentInvitations.length ? (
                                                recentInvitations.map((invitation) => (
                                                    <TableRow key={invitation.id} className="border-border/60">
                                                        <TableCell className="py-3">
                                                            <div className="space-y-0.5">
                                                                <p className="text-sm font-semibold text-[#0F2E52] dark:text-blue-200">{invitation.name}</p>
                                                                <p className="text-xs text-muted-foreground">{invitation.email}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-3 text-sm capitalize text-muted-foreground">
                                                            {invitation.role.replaceAll('_', ' ')}
                                                        </TableCell>
                                                        <TableCell className="py-3 text-sm text-muted-foreground">
                                                            {invitation.tenant ?? 'Platform'}
                                                        </TableCell>
                                                        <TableCell className="py-3">
                                                            <StatusBadge value={invitation.status} />
                                                        </TableCell>
                                                        <TableCell className="py-3 text-xs text-muted-foreground">
                                                            {invitation.created_at ? moment(invitation.created_at).fromNow() : '—'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                                                        No invitations have been sent yet.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar guidance */}
                        <div className="space-y-4">
                            <Card className="border-[#14417A]/15 shadow-none">
                                <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                                    <CardTitle className="flex items-center gap-2 text-base text-[#0F2E52] dark:text-blue-200">
                                        <Building2 className="h-4 w-4" />
                                        How routing works
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 p-5 text-sm">
                                    <GuidanceRow
                                        icon={Building2}
                                        title="Company workspace"
                                        description={
                                            isPlatformAdmin
                                                ? 'Platform admins are not tied to a tenant.'
                                                : 'Pick the tenant first so departments and roles stay scoped.'
                                        }
                                    />
                                    <GuidanceRow
                                        icon={UsersRound}
                                        title="Access role"
                                        description={
                                            isPlatformAdmin
                                                ? 'This user will become a super admin on acceptance.'
                                                : 'Employee, reviewer, or company admin — pick based on needed access.'
                                        }
                                    />
                                    <GuidanceRow
                                        icon={Mail}
                                        title="SMTP delivery"
                                        description="Emails are pushed onto the mail queue. Workers must listen to both the mail and default queues."
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </PlatformLayout>
    );
}

function GuidanceRow({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof ShieldCheck;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
                <p className="text-sm font-semibold text-[#0F2E52] dark:text-blue-200">{title}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
