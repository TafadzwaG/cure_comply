import HeadingSmall from '@/components/heading-small';
import { TenantStatusActionDialog } from '@/components/tenant-status-action-dialog';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { BreadcrumbItem, Tenant } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { BellRing, Building2, Mail, Settings2, ShieldAlert, ShieldCheck } from 'lucide-react';
import moment from 'moment';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Platform settings',
        href: '/settings/platform',
    },
];

interface RecipientUser {
    id: number;
    name: string;
    email: string;
}

export default function PlatformSettingsPage({
    settings,
    recipientUsers,
    pendingTenants,
}: {
    settings: {
        recipient_user_ids: number[];
        recipient_emails: string[];
    };
    recipientUsers: RecipientUser[];
    pendingTenants: Tenant[];
}) {
    const selectedUsers = recipientUsers.filter((user) => settings.recipient_user_ids?.includes(user.id));
    const extraRecipientEmails = settings.recipient_emails ?? [];
    const form = useForm({
        recipient_user_ids: settings.recipient_user_ids ?? [],
        recipient_emails_text: (settings.recipient_emails ?? []).join('\n'),
    });

    const submit = () => {
        form.transform((data) => ({
            recipient_user_ids: data.recipient_user_ids,
            recipient_emails: data.recipient_emails_text
                .split(/[\n,]+/)
                .map((email) => email.trim())
                .filter(Boolean),
        }));
        form.put(route('settings.platform.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Platform settings" />

            <SettingsLayout fullWidth>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Tenant registration notifications"
                        description="Choose exactly who receives new tenant registration email notifications and in-app alerts, then review pending workspaces from the same settings area."
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                        <InfoCard
                            icon={BellRing}
                            title="Internal recipients"
                            description={`${selectedUsers.length} ${selectedUsers.length === 1 ? 'platform user is' : 'platform users are'} configured to receive in-app alerts and email when a new company registers.`}
                        />
                        <InfoCard
                            icon={Mail}
                            title="Email-only recipients"
                            description={`${extraRecipientEmails.length} ${extraRecipientEmails.length === 1 ? 'external address is' : 'external addresses are'} configured to receive tenant registration emails only.`}
                        />
                        <InfoCard
                            icon={ShieldAlert}
                            title="Notification scope"
                            description="Only the recipients configured on this page receive new tenant registration alerts. The system does not notify every super admin automatically."
                        />
                    </div>

                    <Card className="border-border/70 shadow-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base font-medium">
                                <Settings2 className="size-4" />
                                Who gets new tenant registration emails
                            </CardTitle>
                            <CardDescription>
                                Internal platform recipients receive both in-app alerts and email. Extra addresses receive email only.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-border/70 bg-muted/15 p-4">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                                        <BellRing className="size-4 text-[#083d77]" />
                                        In-app and email recipients
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUsers.length > 0 ? (
                                            selectedUsers.map((user) => (
                                                <Badge key={user.id} variant="outline" className="rounded-full px-3 py-1">
                                                    {user.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground">No internal platform users selected yet.</span>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-border/70 bg-muted/15 p-4">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                                        <Mail className="size-4 text-[#083d77]" />
                                        Email-only recipients
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {extraRecipientEmails.length > 0 ? (
                                            extraRecipientEmails.map((email) => (
                                                <Badge key={email} variant="outline" className="rounded-full px-3 py-1">
                                                    {email}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground">No extra email recipients configured yet.</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Internal platform users</Label>
                                <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/15 p-4">
                                    {recipientUsers.map((user) => {
                                        const checked = form.data.recipient_user_ids.includes(user.id);

                                        return (
                                            <label key={user.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-background px-4 py-3">
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(state) => {
                                                        form.setData(
                                                            'recipient_user_ids',
                                                            state
                                                                ? [...form.data.recipient_user_ids, user.id]
                                                                : form.data.recipient_user_ids.filter((id) => id !== user.id),
                                                        );
                                                    }}
                                                />
                                                <div className="space-y-1">
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                                <InputError message={form.errors.recipient_user_ids} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="recipient_emails_text">Extra email recipients</Label>
                                <Textarea
                                    id="recipient_emails_text"
                                    value={form.data.recipient_emails_text}
                                    onChange={(event) => form.setData('recipient_emails_text', event.target.value)}
                                    rows={5}
                                    placeholder={'ops@privacycure.com\ncompliance@privacycure.com'}
                                />
                                <p className="text-sm text-muted-foreground">Add one email per line or separate addresses with commas.</p>
                                <InputError message={form.errors.recipient_emails} />
                            </div>

                            <Button type="button" onClick={submit} disabled={form.processing}>
                                <BellRing className="size-4" />
                                {form.processing ? 'Saving notification settings...' : 'Save notification recipients'}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border/70 shadow-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base font-medium">
                                <ShieldAlert className="size-4" />
                                Recent pending tenants
                            </CardTitle>
                            <CardDescription>Review newly registered companies and activate or deactivate them without leaving settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {pendingTenants.length > 0 ? (
                                pendingTenants.map((tenant) => (
                                    <div key={tenant.id} className="rounded-2xl border border-border/70 bg-muted/15 p-4">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="size-4 text-[#083d77]" />
                                                    <span className="font-medium">{tenant.name}</span>
                                                    <Badge variant="outline" className="rounded-full px-3 py-1">
                                                        {tenant.status}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {tenant.contact_name ?? 'No contact'}
                                                    {tenant.contact_email ? ` · ${tenant.contact_email}` : ''}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Registered {moment(tenant.created_at).format('D MMM YYYY, h:mm A')}</div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Button variant="outline" asChild>
                                                    <Link href={route('tenants.show', tenant.id)}>
                                                        <Mail className="size-4" />
                                                        Review tenant
                                                    </Link>
                                                </Button>
                                                <TenantStatusActionDialog tenantId={tenant.id} tenantName={tenant.name} action="activate" compact />
                                                <TenantStatusActionDialog tenantId={tenant.id} tenantName={tenant.name} action="deactivate" compact />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-6 text-sm text-muted-foreground">
                                    There are no tenant registrations waiting for activation right now.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2">
                        <InfoCard
                            icon={ShieldCheck}
                            title="Activation notice"
                            description="Activation and deactivation both send branded lifecycle emails and in-app notifications to the tenant administrator."
                        />
                        <InfoCard
                            icon={ShieldAlert}
                            title="Registration flow"
                            description="New company signups stay in pending status until a super admin explicitly activates the tenant."
                        />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

function InfoCard({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof BellRing;
    title: string;
    description: string;
}) {
    return (
        <Card className="border-border/70 shadow-none">
            <CardContent className="space-y-3 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d6e3ff] text-[#083d77]">
                    <Icon className="size-4" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-medium tracking-tight">{title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}
