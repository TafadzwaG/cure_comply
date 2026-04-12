import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { UserStatusActionDialog } from '@/components/user-status-action-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatLongDateTime } from '@/lib/date';
import PlatformLayout from '@/layouts/platform-layout';
import { Tenant, User } from '@/types';
import { Link, router, useForm } from '@inertiajs/react';
import { Building2, Eye, KeyRound, Mail, Shield, ShieldCheck, UserCog, UserRoundCheck } from 'lucide-react';
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

interface UserAbilities {
    canEdit: boolean;
    canChangeTenant: boolean;
    canUpdatePassword: boolean;
    canEditAccess: boolean;
    canDeactivate: boolean;
    canReactivate: boolean;
    canImpersonate: boolean;
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
    abilities,
}: {
    userRecord: UserRecord;
    tenants: Array<{ id: number; name: string }>;
    roles: RoleOption[];
    permissions: PermissionOption[];
    auditTrail: AuditTrailRow[];
    abilities: UserAbilities;
}) {
    const hasPlaceholderEmail = isDeactivatedPlaceholderEmail(userRecord.email);
    const profileForm = useForm({
        tenant_id: userRecord.tenant_id ? String(userRecord.tenant_id) : 'platform',
        name: userRecord.name,
        email: hasPlaceholderEmail ? '' : userRecord.email,
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
    const showAccessTab = abilities.canEditAccess;
    const showSecurityTab = abilities.canUpdatePassword || abilities.canDeactivate || abilities.canReactivate || abilities.canImpersonate || Boolean(userRecord.tenant);

    const toggleAccessValue = (field: 'roles' | 'permissions', value: string) => {
        const current = accessForm.data[field];

        accessForm.setData(
            field,
            current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value],
        );
    };

    const saveProfileChanges = () => {
        profileForm.transform((data) => ({
            ...data,
            email: hasPlaceholderEmail && data.email.trim() === '' ? userRecord.email : data.email,
            tenant_id: abilities.canChangeTenant
                ? (data.tenant_id === 'platform' ? null : Number(data.tenant_id))
                : userRecord.tenant_id ?? null,
        }));

        profileForm.patch(route('users.update', userRecord.id), {
            preserveScroll: true,
        });
    };

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader
                    title={userRecord.name}
                    description="Update user identity, password credentials, and lifecycle status from one workspace."
                >
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                        Account lifecycle workspace
                    </Badge>
                    {abilities.canReactivate ? (
                        <UserStatusActionDialog userId={userRecord.id} userName={userRecord.name} action="reactivate" triggerLabel="Reactivate user" />
                    ) : null}
                    {abilities.canDeactivate ? (
                        <UserStatusActionDialog userId={userRecord.id} userName={userRecord.name} action="deactivate" triggerLabel="Deactivate user" />
                    ) : null}
                    {abilities.canImpersonate && !isSuperAdminTarget ? (
                        <Button variant="outline" onClick={() => router.post(route('impersonation.start', userRecord.id))}>
                            <Eye className="size-4" />
                            <UserCog className="size-4" />
                            Impersonate user
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
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        {showAccessTab ? <TabsTrigger value="access">Roles & permissions</TabsTrigger> : null}
                        {showSecurityTab ? <TabsTrigger value="security">Security</TabsTrigger> : null}
                    </TabsList>

                    <TabsContent value="profile" className="space-y-4">
                        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle>Profile information</CardTitle>
                                    <CardDescription>Update the user identity, email address, and workspace assignment.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input value={profileForm.data.name} onChange={(event) => profileForm.setData('name', event.target.value)} disabled={!abilities.canEdit} />
                                            <InputError message={profileForm.errors.name} />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <Label>Email</Label>
                                                {hasPlaceholderEmail ? <Badge variant="destructive">Deactivated</Badge> : null}
                                            </div>
                                            <Input
                                                type="email"
                                                value={profileForm.data.email}
                                                onChange={(event) => profileForm.setData('email', event.target.value)}
                                                disabled={!abilities.canEdit}
                                                placeholder={hasPlaceholderEmail ? 'Enter a new email before reactivation' : 'Email address'}
                                            />
                                            <InputError message={profileForm.errors.email} />
                                        </div>
                                    </div>

                                    {abilities.canChangeTenant ? (
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
                                    ) : (
                                        <SnapshotItem label="Tenant" value={userRecord.tenant?.name ?? 'Platform'} />
                                    )}

                                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                                        Status changes now use dedicated lifecycle actions so inactive accounts can archive their current email and clear active sessions safely.
                                        {hasPlaceholderEmail ? ' Leave the email blank to keep the account deactivated, or enter a real email before reactivation.' : ''}
                                    </div>

                                    {abilities.canEdit ? (
                                        <Button type="button" disabled={profileForm.processing} onClick={saveProfileChanges}>
                                            <UserCog className="size-4" />
                                            Save profile changes
                                        </Button>
                                    ) : null}
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 bg-muted/20 shadow-none">
                                <CardHeader>
                                    <CardTitle>Account snapshot</CardTitle>
                                    <CardDescription>Read-only operational detail from the linked employee profile and lifecycle state.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <SnapshotItem label="Current status" value={userRecord.status ?? 'active'} />
                                    <SnapshotItem label="Archived email" value={userRecord.archived_email ?? 'None'} />
                                    <SnapshotItem label="Deactivated at" value={formatLongDateTime(userRecord.deactivated_at)} />
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
                                                            {entry.entity_type} · {formatLongDateTime(entry.created_at)}
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

                    {showAccessTab ? (
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
                    ) : null}

                    {showSecurityTab ? (
                        <TabsContent value="security" className="space-y-4">
                            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                                {abilities.canUpdatePassword ? (
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
                                ) : (
                                    <Card className="border-border/70 shadow-none">
                                        <CardHeader>
                                            <CardTitle>Password reset</CardTitle>
                                            <CardDescription>Password changes are not available for your current access level.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="text-sm text-muted-foreground">
                                            Contact a super admin if this account needs a direct password reset.
                                        </CardContent>
                                    </Card>
                                )}

                                <Card className="border-border/70 bg-muted/20 shadow-none">
                                    <CardHeader>
                                        <CardTitle>Support actions</CardTitle>
                                        <CardDescription>High-impact actions available for account support and lifecycle management.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ActionDetail
                                            icon={Mail}
                                            title="Email reuse lifecycle"
                                            description="Deactivate an account to archive its current email and make that address available for a new invitation or replacement account."
                                        />
                                        <Separator />
                                        <ActionDetail
                                            icon={Shield}
                                            title="Account lifecycle"
                                            description="Deactivation clears active sessions and blocks sign-in. Reactivation requires a real unique email address on the profile."
                                            action={
                                                <div className="flex flex-wrap gap-2">
                                                    {abilities.canDeactivate ? (
                                                        <UserStatusActionDialog userId={userRecord.id} userName={userRecord.name} action="deactivate" compact triggerLabel="Deactivate" />
                                                    ) : null}
                                                    {abilities.canReactivate ? (
                                                        <UserStatusActionDialog userId={userRecord.id} userName={userRecord.name} action="reactivate" compact triggerLabel="Reactivate" />
                                                    ) : null}
                                                </div>
                                            }
                                        />
                                        <Separator />
                                        <ActionDetail
                                            icon={Eye}
                                            title="Impersonate user"
                                            description="Open the platform exactly as this user sees it to debug permission or workflow issues."
                                            action={
                                                abilities.canImpersonate && !isSuperAdminTarget ? (
                                                    <Button variant="outline" onClick={() => router.post(route('impersonation.start', userRecord.id))}>
                                                        <Eye className="size-4" />
                                                        <UserCog className="size-4" />
                                                        Start impersonation
                                                    </Button>
                                                ) : null
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
                                                        <Link href={route('tenants.show', userRecord.tenant.id)}>
                                                            <Building2 className="size-4" />
                                                            View tenant
                                                        </Link>
                                                    </Button>
                                                ) : null
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    ) : null}
                </Tabs>
            </div>
        </PlatformLayout>
    );
}

function isDeactivatedPlaceholderEmail(email?: string | null) {
    return Boolean(email?.toLowerCase().includes('@users.privacycure.invalid'));
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
