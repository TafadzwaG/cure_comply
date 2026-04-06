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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlatformLayout from '@/layouts/platform-layout';
import { Tenant, User } from '@/types';
import { router, useForm } from '@inertiajs/react';
import { Building2, Eye, KeyRound, Shield, ShieldCheck, UserCog, UserRoundCheck } from 'lucide-react';
import { ReactNode } from 'react';

interface RoleOption {
    id: number;
    name: string;
}

interface PermissionOption {
    id: number;
    name: string;
}

interface AuditTrailRow {
    id: number;
    action: string;
    entity_type: string;
    created_at: string;
}

interface UserRecord extends User {
    tenant?: Tenant | null;
    roles?: RoleOption[];
    permissions?: PermissionOption[];
    employee_profile?: {
        job_title?: string | null;
        branch?: string | null;
        employee_number?: string | null;
        phone?: string | null;
        department?: { name: string } | null;
    } | null;
}

export default function UserShow({
    userRecord,
    tenants,
    roles,
    permissions,
    auditTrail,
}: {
    userRecord: UserRecord;
    tenants: Array<{ id: number; name: string }>;
    roles: RoleOption[];
    permissions: PermissionOption[];
    auditTrail: AuditTrailRow[];
}) {
    const profileForm = useForm({
        tenant_id: userRecord.tenant_id ? String(userRecord.tenant_id) : 'platform',
        name: userRecord.name,
        email: userRecord.email,
        status: userRecord.status ?? 'active',
    });

    const passwordForm = useForm({
        password: '',
        password_confirmation: '',
    });

    const accessForm = useForm({
        roles: userRecord.roles?.map((role) => role.name) ?? [],
        permissions: userRecord.permissions?.map((permission) => permission.name) ?? [],
    });

    const isSuperAdminTarget = userRecord.roles?.some((role) => role.name === 'super_admin');

    const toggleAccessValue = (field: 'roles' | 'permissions', value: string) => {
        const current = accessForm.data[field];

        accessForm.setData(
            field,
            current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value],
        );
    };

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader
                    title={userRecord.name}
                    description="Update user identity, access configuration, password credentials, and support actions from one workspace."
                >
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                        Cross-tenant user operations
                    </Badge>
                    {!isSuperAdminTarget ? (
                        <Button variant="outline" onClick={() => router.post(route('impersonation.start', userRecord.id))}>
                            <Eye className="size-4" />
                            <UserCog className="size-4" />
                            Impersonate User
                        </Button>
                    ) : null}
                </PageHeader>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Tenant" value={userRecord.tenant?.name ?? 'Platform'} icon={Building2} />
                    <MetricCard
                        label="Role footprint"
                        value={userRecord.roles?.map((role) => role.name.replaceAll('_', ' ')).join(', ') || 'No role'}
                        icon={Shield}
                    />
                    <MetricCard label="Status" value={userRecord.status ?? 'active'} icon={UserRoundCheck} status />
                    <MetricCard label="Direct permissions" value={userRecord.permissions?.length ?? 0} icon={ShieldCheck} />
                </section>

                <Tabs defaultValue="profile" className="space-y-4">
                    <TabsList className="h-auto w-full justify-start rounded-xl border border-border bg-muted/35 p-1">
                        <TabsTrigger value="profile" className="rounded-lg px-4 py-2.5">Profile</TabsTrigger>
                        <TabsTrigger value="access" className="rounded-lg px-4 py-2.5">Roles & permissions</TabsTrigger>
                        <TabsTrigger value="security" className="rounded-lg px-4 py-2.5">Security</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-4">
                        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle>Profile information</CardTitle>
                                    <CardDescription>Update the user identity, email address, workspace assignment, and status.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input value={profileForm.data.name} onChange={(event) => profileForm.setData('name', event.target.value)} />
                                            <InputError message={profileForm.errors.name} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input type="email" value={profileForm.data.email} onChange={(event) => profileForm.setData('email', event.target.value)} />
                                            <InputError message={profileForm.errors.email} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Tenant</Label>
                                            <Select value={profileForm.data.tenant_id} onValueChange={(value) => profileForm.setData('tenant_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select tenant" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="platform">Platform</SelectItem>
                                                    {tenants.map((tenant) => (
                                                        <SelectItem key={tenant.id} value={String(tenant.id)}>
                                                            {tenant.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={profileForm.errors.tenant_id} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={profileForm.data.status} onValueChange={(value) => profileForm.setData('status', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="invited">Invited</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={profileForm.errors.status} />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() =>
                                            profileForm.transform((data) => ({
                                                ...data,
                                                tenant_id: data.tenant_id === 'platform' ? null : Number(data.tenant_id),
                                            })).patch(route('users.update', userRecord.id))
                                        }
                                    >
                                        <UserCog className="size-4" />
                                        Save profile changes
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 bg-muted/20 shadow-none">
                                <CardHeader>
                                    <CardTitle>Work profile snapshot</CardTitle>
                                    <CardDescription>Read-only operational detail from the linked employee profile.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <SnapshotItem label="Department" value={userRecord.employee_profile?.department?.name ?? 'Not assigned'} />
                                    <SnapshotItem label="Job title" value={userRecord.employee_profile?.job_title ?? 'Not set'} />
                                    <SnapshotItem label="Branch" value={userRecord.employee_profile?.branch ?? 'Not set'} />
                                    <SnapshotItem label="Employee number" value={userRecord.employee_profile?.employee_number ?? 'Not set'} />
                                    <SnapshotItem label="Phone" value={userRecord.employee_profile?.phone ?? 'Not set'} />
                                    <Separator />
                                    <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Recent activity</p>
                                        <div className="space-y-3">
                                            {auditTrail.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">No recent audit activity is available for this user.</p>
                                            ) : (
                                                auditTrail.slice(0, 4).map((entry) => (
                                                    <div key={entry.id} className="rounded-lg border border-border/70 bg-background p-3">
                                                        <div className="text-sm font-medium">{entry.action}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {entry.entity_type} · {entry.created_at}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="access" className="space-y-4">
                        <div className="grid gap-6 xl:grid-cols-2">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle>Role assignment</CardTitle>
                                    <CardDescription>Roles define the default permission baseline for the account.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-3">
                                    {roles.map((role) => (
                                        <ToggleRow
                                            key={role.id}
                                            checked={accessForm.data.roles.includes(role.name)}
                                            label={role.name.replaceAll('_', ' ')}
                                            description={`Grant the ${role.name.replaceAll('_', ' ')} role to this user.`}
                                            onCheckedChange={() => toggleAccessValue('roles', role.name)}
                                        />
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle>Direct permissions</CardTitle>
                                    <CardDescription>Use direct permissions sparingly when a role alone is not precise enough.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-3">
                                    {permissions.map((permission) => (
                                        <ToggleRow
                                            key={permission.id}
                                            checked={accessForm.data.permissions.includes(permission.name)}
                                            label={permission.name}
                                            description={`Directly assign ${permission.name} to this account.`}
                                            onCheckedChange={() => toggleAccessValue('permissions', permission.name)}
                                        />
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        <InputError message={accessForm.errors.roles || accessForm.errors.permissions} />
                        <Button onClick={() => accessForm.patch(route('users.access.update', userRecord.id))}>
                            <ShieldCheck className="size-4" />
                            Save access changes
                        </Button>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-4">
                        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle>Password reset</CardTitle>
                                    <CardDescription>Set a new password directly for this account.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>New password</Label>
                                        <Input
                                            type="password"
                                            value={passwordForm.data.password}
                                            onChange={(event) => passwordForm.setData('password', event.target.value)}
                                        />
                                        <InputError message={passwordForm.errors.password} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirm password</Label>
                                        <Input
                                            type="password"
                                            value={passwordForm.data.password_confirmation}
                                            onChange={(event) => passwordForm.setData('password_confirmation', event.target.value)}
                                        />
                                    </div>
                                    <Button onClick={() => passwordForm.patch(route('users.password.update', userRecord.id))}>
                                        <KeyRound className="size-4" />
                                        Update password
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 bg-muted/20 shadow-none">
                                <CardHeader>
                                    <CardTitle>Support actions</CardTitle>
                                    <CardDescription>High-impact actions available to super admins for account support.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ActionDetail
                                        icon={Eye}
                                        title="Impersonate user"
                                        description="Open the platform exactly as this user sees it to debug permission or workflow issues."
                                        action={
                                            isSuperAdminTarget ? null : (
                                                <Button variant="outline" onClick={() => router.post(route('impersonation.start', userRecord.id))}>
                                                    <Eye className="size-4" />
                                                    <UserCog className="size-4" />
                                                    Start impersonation
                                                </Button>
                                            )
                                        }
                                    />
                                    <Separator />
                                    <ActionDetail
                                        icon={Building2}
                                        title="Tenant context"
                                        description="Review the tenant workspace associated with this account."
                                        action={
                                            userRecord.tenant ? (
                                                <Button asChild variant="outline">
                                                    <a href={route('tenants.show', userRecord.tenant.id)}>
                                                        <Building2 className="size-4" />
                                                        View tenant
                                                    </a>
                                                </Button>
                                            ) : null
                                        }
                                    />
                                    <Separator />
                                    <ActionDetail
                                        icon={Shield}
                                        title="Access posture"
                                        description="Roles and direct permissions are managed separately so emergency support overrides stay explicit."
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </PlatformLayout>
    );
}

function MetricCard({
    label,
    value,
    icon: Icon,
    status = false,
}: {
    label: string;
    value: string | number;
    icon: typeof UserCog;
    status?: boolean;
}) {
    return (
        <Card className="border-border/70 shadow-none">
            <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    {status ? <StatusBadge value={String(value)} /> : <p className="text-lg font-semibold tracking-tight">{value}</p>}
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/35 p-2.5">
                    <Icon className="size-4" />
                </div>
            </CardContent>
        </Card>
    );
}

function SnapshotItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-background p-3">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}

function ToggleRow({
    checked,
    label,
    description,
    onCheckedChange,
}: {
    checked: boolean;
    label: string;
    description: string;
    onCheckedChange: () => void;
}) {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/70 bg-background p-3">
            <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
            <div className="space-y-1">
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs leading-5 text-muted-foreground">{description}</div>
            </div>
        </label>
    );
}

function ActionDetail({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: typeof Eye;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
                <div className="rounded-lg border border-border/70 bg-background p-2">
                    <Icon className="size-4" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
            </div>
            {action}
        </div>
    );
}
