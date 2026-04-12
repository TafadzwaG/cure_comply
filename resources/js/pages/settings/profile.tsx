import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { formatLongDateTime } from '@/lib/date';
import { resolveBranding } from '@/lib/tenant-branding';
import PlatformLayout from '@/layouts/platform-layout';
import { Tenant, TenantBranding, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Bell, BellRing, Building2, CircleHelp, ImagePlus, KeyRound, Mail, MailCheck, Palette, Save, Shield, ShieldCheck, SwatchBook, UploadCloud, UserRound, UserRoundCog, X } from 'lucide-react';
import { type DragEvent, type FormEventHandler, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

interface PlatformRecipientUser {
    id: number;
    name: string;
    email: string;
}

interface BrandingTenantOption {
    id: number;
    name: string;
    status: string;
}

const HEX_COLOR_PATTERN = /^#?[0-9A-F]{6}$/i;

export default function Profile({
    mustVerifyEmail,
    status,
    settingsAccess,
    platformNotificationSettings,
    platformRecipientUsers = [],
    pendingTenantCount = 0,
    brandingSelectedTenant = null,
    brandingTenantOptions = [],
    brandingDefaults,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    settingsAccess: {
        canManageTenantNotifications: boolean;
        canManageBranding: boolean;
    };
    platformNotificationSettings?: {
        recipient_user_ids: number[];
        recipient_emails: string[];
    } | null;
    platformRecipientUsers?: PlatformRecipientUser[];
    pendingTenantCount?: number;
    brandingSelectedTenant?: Tenant | null;
    brandingTenantOptions?: BrandingTenantOption[];
    brandingDefaults: TenantBranding;
}) {
    const { auth, tenant } = usePage<SharedData>().props;
    const user = auth.user;

    const isSuperAdmin = user?.display_role === 'super_admin';
    const canManageTenantNotifications = settingsAccess?.canManageTenantNotifications ?? false;
    const canManageBranding = settingsAccess?.canManageBranding ?? false;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
    });
    const notificationForm = useForm({
        recipient_user_ids: platformNotificationSettings?.recipient_user_ids ?? [],
        recipient_emails_text: (platformNotificationSettings?.recipient_emails ?? []).join('\n'),
    });
    const [brandingLogoFile, setBrandingLogoFile] = useState<File | null>(null);
    const [isDraggingBrandLogo, setIsDraggingBrandLogo] = useState(false);
    const brandingFileInputRef = useRef<HTMLInputElement | null>(null);
    const brandingForm = useForm<{
        tenant_id: number | null;
        primary_color: string;
        logo: File | null;
        remove_logo: boolean;
    }>({
        tenant_id: brandingSelectedTenant?.id ?? null,
        primary_color: brandingSelectedTenant?.primary_color ?? resolveBranding(brandingSelectedTenant?.branding ?? brandingDefaults).primary_color,
        logo: null,
        remove_logo: false,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        patch(route('profile.update'));
    };

    const selectedRecipientUsers = platformRecipientUsers.filter((recipient) => notificationForm.data.recipient_user_ids.includes(recipient.id));
    const extraRecipientEmails = notificationForm.data.recipient_emails_text
        .split(/[\n,]+/)
        .map((email) => email.trim())
        .filter(Boolean);

    const savePlatformRecipients = () => {
        notificationForm.transform((current) => ({
            recipient_user_ids: current.recipient_user_ids,
            recipient_emails: current.recipient_emails_text
                .split(/[\n,]+/)
                .map((email) => email.trim())
                .filter(Boolean),
        }));
        notificationForm.put(route('settings.platform.update'));
    };

    const selectedBranding = resolveBranding(brandingSelectedTenant?.branding ?? brandingDefaults);
    const tabParams = new URLSearchParams(window.location.search);
    const availableTabs = ['profile', 'account', ...(canManageBranding ? ['branding'] : []), ...(canManageTenantNotifications ? ['tenant-notifications'] : []), 'support'];
    const currentTab = availableTabs.includes(tabParams.get('tab') ?? '') ? (tabParams.get('tab') as string) : 'profile';

    useEffect(() => {
        brandingForm.setData({
            tenant_id: brandingSelectedTenant?.id ?? null,
            primary_color: brandingSelectedTenant?.primary_color ?? selectedBranding.primary_color,
            logo: null,
            remove_logo: false,
        });
        setBrandingLogoFile(null);
        setIsDraggingBrandLogo(false);

        if (brandingFileInputRef.current) {
            brandingFileInputRef.current.value = '';
        }
    }, [brandingSelectedTenant?.id, brandingSelectedTenant?.primary_color, selectedBranding.primary_color]);

    const brandingPreviewUrl = useMemo(() => {
        if (brandingLogoFile) {
            return URL.createObjectURL(brandingLogoFile);
        }

        if (brandingForm.data.remove_logo) {
            return null;
        }

        return selectedBranding.logo_url ?? null;
    }, [brandingLogoFile, brandingForm.data.remove_logo, selectedBranding.logo_url]);

    useEffect(() => {
        return () => {
            if (brandingPreviewUrl && brandingLogoFile) {
                URL.revokeObjectURL(brandingPreviewUrl);
            }
        };
    }, [brandingPreviewUrl, brandingLogoFile]);

    const previewBranding = resolveBranding({
        ...selectedBranding,
        primary_color: HEX_COLOR_PATTERN.test(brandingForm.data.primary_color) ? brandingForm.data.primary_color : selectedBranding.primary_color,
        logo_url: brandingPreviewUrl,
        is_customized: Boolean((brandingForm.data.primary_color && brandingForm.data.primary_color !== brandingDefaults.primary_color) || brandingPreviewUrl),
    });

    if (!user) {
        return null;
    }

    const roleNames = user.roles?.map((role) => role.name.replaceAll('_', ' ')) ?? [];
    const roleSummary = roleNames.length > 0 ? roleNames.join(', ') : (user.display_role ?? 'User');
    const tenantName = user.tenant?.name ?? tenant?.name ?? 'Platform workspace';
    const profile = user.employee_profile;
    const permissionCount = auth.permissions?.length ?? 0;

    const navigateProfile = (updates: Record<string, string | undefined>) => {
        const params = new URLSearchParams(window.location.search);

        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        router.get(route('profile.edit'), Object.fromEntries(params.entries()), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const saveBranding = () => {
        brandingForm.transform((current) => ({
            tenant_id: current.tenant_id,
            primary_color: current.primary_color,
            logo: current.logo,
            remove_logo: current.remove_logo,
        }));
        brandingForm.post(route('settings.branding.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const applyBrandingLogoFile = (file: File | null) => {
        setBrandingLogoFile(file);
        brandingForm.setData('logo', file);

        if (file) {
            brandingForm.setData('remove_logo', false);
        }
    };

    const handleBrandingLogoDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDraggingBrandLogo(false);
        applyBrandingLogoFile(event.dataTransfer.files?.[0] ?? null);
    };

    return (
        <PlatformLayout>
            <Head title="Profile settings" />

            <div className="flex flex-col gap-6">
                <PageHeader
                    title="My profile"
                    description="Maintain your account identity, workspace details, and support shortcuts from one profile workspace."
                    icon={UserRoundCog}
                    eyebrow="Account settings"
                >
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.22em]">
                        Personal workspace
                    </Badge>
                    <Button asChild variant="outline">
                        <Link href={route('help.index')}>
                            <CircleHelp data-icon="inline-start" />
                            Help / Support
                        </Link>
                    </Button>
                </PageHeader>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <ProfileMetric label="Role footprint" value={roleSummary} icon={<ShieldCheck className="size-4" />} />
                    <ProfileMetric label="Account status" value={user.status ?? 'active'} icon={<UserRound className="size-4" />} status />
                    <ProfileMetric label="Workspace" value={tenantName} icon={<Building2 className="size-4" />} />
                    <ProfileMetric label="Granted permissions" value={permissionCount} icon={<KeyRound className="size-4" />} />
                </section>

                <Tabs value={currentTab} onValueChange={(value) => navigateProfile({ tab: value })} className="flex flex-col gap-4">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="account">Account snapshot</TabsTrigger>
                        {canManageBranding ? <TabsTrigger value="branding">Branding</TabsTrigger> : null}
                        {canManageTenantNotifications ? <TabsTrigger value="tenant-notifications">Tenant notifications</TabsTrigger> : null}
                        <TabsTrigger value="support">Help / Support</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-0">
                        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle>Profile information</CardTitle>
                                    <CardDescription>Update the name and email address attached to your sign-in identity.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={submit} className="flex flex-col gap-5">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(event) => setData('name', event.target.value)}
                                                    required
                                                    autoComplete="name"
                                                    placeholder="Full name"
                                                    aria-invalid={Boolean(errors.name)}
                                                />
                                                <InputError message={errors.name} />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="email">Email address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(event) => setData('email', event.target.value)}
                                                    required
                                                    autoComplete="username"
                                                    placeholder="Email address"
                                                    aria-invalid={Boolean(errors.email)}
                                                />
                                                <InputError message={errors.email} />
                                            </div>
                                        </div>

                                        {mustVerifyEmail && user.email_verified_at === null ? (
                                            <div className="rounded-lg border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                                                <p>Your email address is unverified.</p>
                                                <Link
                                                    href={route('verification.send')}
                                                    method="post"
                                                    as="button"
                                                    className="mt-2 font-medium text-foreground underline underline-offset-4"
                                                >
                                                    Re-send the verification email
                                                </Link>

                                                {status === 'verification-link-sent' ? (
                                                    <p className="mt-2 font-medium text-foreground">A new verification link has been sent to your email address.</p>
                                                ) : null}
                                            </div>
                                        ) : null}

                                        <div className="flex flex-wrap items-center gap-4">
                                            <Button disabled={processing}>
                                                <Save data-icon="inline-start" />
                                                Save profile
                                            </Button>

                                            <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                                                <p className="text-sm text-muted-foreground">Saved</p>
                                            </Transition>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 bg-muted/20 shadow-none">
                                <CardHeader>
                                    <CardTitle>Profile snapshot</CardTitle>
                                    <CardDescription>Operational details pulled from your account and employee record.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3 text-sm">
                                    <SnapshotItem label="Tenant" value={tenantName} />
                                    <SnapshotItem label="Role" value={roleSummary} />
                                    <SnapshotItem label="Department" value={profile?.department?.name ?? 'Not assigned'} />
                                    <SnapshotItem label="Job title" value={profile?.job_title ?? 'Not set'} />
                                    <SnapshotItem label="Branch" value={profile?.branch ?? 'Not set'} />
                                    <SnapshotItem label="Employee number" value={profile?.employee_number ?? 'Not set'} />
                                    <Separator />
                                    <SnapshotItem label="Last login" value={formatLongDateTime(user.last_login_at)} />
                                    <SnapshotItem label="Password changed" value={formatLongDateTime(user.last_password_changed_at)} />
                                    <SnapshotItem label="Created" value={formatLongDateTime(user.created_at)} />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="account" className="mt-0">
                        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle>Account state</CardTitle>
                                    <CardDescription>Your current access state and verification posture.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <AccountRow title="Lifecycle status" description="Inactive accounts cannot sign in until an administrator reactivates them.">
                                        <StatusBadge value={user.status ?? 'active'} />
                                    </AccountRow>
                                    <Separator />
                                    <AccountRow title="Email verification" description="Verified email addresses receive operational alerts and security messages.">
                                        <Badge variant="outline">{user.email_verified_at ? 'Verified' : 'Unverified'}</Badge>
                                    </AccountRow>
                                    <Separator />
                                    <AccountRow title="Archived email" description="Used only when an administrator deactivates an account and frees the original address.">
                                        <span className="text-sm font-medium">{user.archived_email ?? 'None'}</span>
                                    </AccountRow>
                                    <Separator />
                                    <AccountRow title="Deactivated at" description="Timestamp for the latest lifecycle deactivation, if applicable.">
                                        <span className="text-sm font-medium">{formatLongDateTime(user.deactivated_at)}</span>
                                    </AccountRow>
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 bg-muted/20 shadow-none">
                                <CardHeader>
                                    <CardTitle>Security shortcuts</CardTitle>
                                    <CardDescription>Manage password access and review the notifications tied to your account.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <ActionLink
                                        href={route('password.edit')}
                                        icon={<KeyRound className="size-5" />}
                                        title="Password settings"
                                        description="Change your password and keep account access current."
                                    />
                                    <ActionLink
                                        href={route('notifications.index')}
                                        icon={<Bell className="size-5" />}
                                        title="Notifications"
                                        description="Open your workflow alerts, export updates, and assignment reminders."
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {canManageBranding ? (
                        <TabsContent value="branding" className="mt-0">
                            <div className="space-y-6">
                                {isSuperAdmin ? (
                                    <Card className="border-border/70 shadow-none">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Building2 className="size-4" />
                                                Tenant context
                                            </CardTitle>
                                            <CardDescription>Select the tenant whose branding you want to edit.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Select
                                                value={brandingSelectedTenant?.id ? String(brandingSelectedTenant.id) : undefined}
                                                onValueChange={(value) => navigateProfile({ tab: 'branding', branding_tenant_id: value })}
                                            >
                                                <SelectTrigger id="branding_tenant_id">
                                                    <SelectValue placeholder="Choose a tenant" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {brandingTenantOptions.map((tenantOption) => (
                                                        <SelectItem key={tenantOption.id} value={String(tenantOption.id)}>
                                                            {tenantOption.name} ({tenantOption.status})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </CardContent>
                                    </Card>
                                ) : null}

                                {!brandingSelectedTenant ? (
                                <Card className="border-border/70 shadow-none">
                                    <CardContent className="flex min-h-[260px] flex-col items-center justify-center gap-4 p-10 text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Palette className="size-5" />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-lg font-medium tracking-tight">Select a tenant to edit branding</h2>
                                            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                                                Branding is applied per tenant. Choose a workspace first, then upload a logo and set the shell accent color.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                ) : (
                                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                                    <Card className="border-border/70 shadow-none">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <SwatchBook className="size-4" />
                                                Tenant branding
                                            </CardTitle>
                                            <CardDescription>
                                                Update the logo and primary color used across the authenticated shell and tenant lifecycle emails.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {!isSuperAdmin ? (
                                                <div className="rounded-lg border border-border/70 bg-muted/15 px-4 py-3 text-sm text-muted-foreground">
                                                    Branding changes will apply to <span className="font-medium text-foreground">{brandingSelectedTenant.name}</span>.
                                                </div>
                                            ) : null}

                                            <div className="space-y-3">
                                                <Label htmlFor="branding_primary_color">Primary color</Label>
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                                    <Input
                                                        id="branding_primary_color"
                                                        type="color"
                                                        value={HEX_COLOR_PATTERN.test(brandingForm.data.primary_color) ? brandingForm.data.primary_color : selectedBranding.primary_color}
                                                        onChange={(event) => brandingForm.setData('primary_color', event.target.value.toUpperCase())}
                                                        className="h-12 w-full rounded-lg sm:w-24"
                                                    />
                                                    <Input
                                                        value={brandingForm.data.primary_color}
                                                        onChange={(event) => brandingForm.setData('primary_color', event.target.value.toUpperCase())}
                                                        placeholder="#083D77"
                                                        className="h-12 rounded-lg font-mono uppercase"
                                                    />
                                                    <Badge
                                                        variant="outline"
                                                        className="w-fit rounded-full px-3 py-1.5"
                                                        style={{ borderColor: previewBranding.primary_color, color: previewBranding.primary_color }}
                                                    >
                                                        Live accent
                                                    </Badge>
                                                </div>
                                                <InputError message={brandingForm.errors.primary_color} />
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="branding_logo">Tenant logo</Label>
                                                <label
                                                    htmlFor="branding_logo"
                                                    onDragOver={(event) => {
                                                        event.preventDefault();
                                                        setIsDraggingBrandLogo(true);
                                                    }}
                                                    onDragLeave={() => setIsDraggingBrandLogo(false)}
                                                    onDrop={handleBrandingLogoDrop}
                                                    className="block"
                                                >
                                                    <div
                                                        className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-8 text-center transition-colors"
                                                        style={{
                                                            borderColor: isDraggingBrandLogo ? previewBranding.primary_color : undefined,
                                                            backgroundColor: isDraggingBrandLogo ? previewBranding.soft_color : undefined,
                                                        }}
                                                    >
                                                        <div
                                                            className="flex h-12 w-12 items-center justify-center rounded-lg"
                                                            style={{
                                                                backgroundColor: previewBranding.soft_color,
                                                                color: previewBranding.primary_color,
                                                            }}
                                                        >
                                                            <UploadCloud className="size-5" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-medium">
                                                                {brandingLogoFile ? brandingLogoFile.name : 'Drag and drop a logo here'}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Click to browse or drop a PNG, JPG, WEBP, or other supported image file.
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Input
                                                        ref={brandingFileInputRef}
                                                        id="branding_logo"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(event) => applyBrandingLogoFile(event.target.files?.[0] ?? null)}
                                                        className="sr-only"
                                                    />
                                                </label>

                                                {brandingLogoFile ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            applyBrandingLogoFile(null);

                                                            if (brandingFileInputRef.current) {
                                                                brandingFileInputRef.current.value = '';
                                                            }
                                                        }}
                                                    >
                                                        <X className="size-4" />
                                                        Clear selected file
                                                    </Button>
                                                ) : null}

                                                <label className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/10 px-4 py-3">
                                                    <Checkbox
                                                        checked={brandingForm.data.remove_logo}
                                                        onCheckedChange={(checked) => brandingForm.setData('remove_logo', Boolean(checked))}
                                                    />
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium">Remove current logo</div>
                                                        <div className="text-xs text-muted-foreground">Fall back to the default Privacy Cure logo until a new logo is uploaded.</div>
                                                    </div>
                                                </label>
                                                <InputError message={brandingForm.errors.logo} />
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4">
                                                <Button type="button" onClick={saveBranding} disabled={brandingForm.processing}>
                                                    <Save data-icon="inline-start" />
                                                    {brandingForm.processing ? 'Saving branding...' : 'Save branding'}
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        brandingForm.setData({
                                                            tenant_id: brandingSelectedTenant.id,
                                                            primary_color: brandingDefaults.primary_color,
                                                            logo: null,
                                                            remove_logo: true,
                                                        })
                                                    }
                                                >
                                                    <ImagePlus data-icon="inline-start" />
                                                    Reset to default
                                                </Button>

                                                <Transition
                                                    show={brandingForm.recentlySuccessful}
                                                    enter="transition ease-in-out"
                                                    enterFrom="opacity-0"
                                                    leave="transition ease-in-out"
                                                    leaveTo="opacity-0"
                                                >
                                                    <p className="text-sm text-muted-foreground">Saved</p>
                                                </Transition>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-6">
                                        <Card className="border-border/70 bg-muted/20 shadow-none">
                                            <CardHeader>
                                                <CardTitle>Live preview</CardTitle>
                                                <CardDescription>Preview how the shell accent and logo treatment will look for tenant users.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="rounded-xl border border-border/70 bg-background p-4">
                                                    <div
                                                        className="rounded-lg border p-4"
                                                        style={{ borderColor: previewBranding.soft_border_color, backgroundColor: previewBranding.soft_color }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-11 min-w-11 items-center justify-center overflow-hidden rounded-lg bg-white/90 p-2 shadow-sm">
                                                                {previewBranding.logo_url ? (
                                                                    <img src={previewBranding.logo_url} alt={brandingSelectedTenant.name} className="max-h-7 w-auto object-contain" />
                                                                ) : (
                                                                    <span className="text-xs font-semibold" style={{ color: previewBranding.primary_color }}>
                                                                        {brandingSelectedTenant.name.slice(0, 2).toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium">{brandingSelectedTenant.name}</div>
                                                                <div className="text-xs text-muted-foreground">Tenant workspace branding</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
                                                        <div
                                                            className="rounded-lg p-4 text-sm"
                                                            style={{
                                                                backgroundColor: previewBranding.primary_color,
                                                                color: previewBranding.primary_foreground,
                                                            }}
                                                        >
                                                            <div className="mb-4 text-xs uppercase tracking-[0.18em]">Sidebar</div>
                                                            <div className="space-y-2">
                                                                <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}>
                                                                    Dashboard
                                                                </div>
                                                                <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                                                                    Compliance
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="rounded-lg border border-border/70 p-4">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div>
                                                                    <div className="text-sm font-medium">Header actions</div>
                                                                    <div className="text-xs text-muted-foreground">Primary button and shell accent</div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        className="rounded-full px-4 py-2 text-xs font-medium"
                                                                        style={{
                                                                            backgroundColor: previewBranding.soft_color,
                                                                            color: previewBranding.primary_color,
                                                                            border: `1px solid ${previewBranding.soft_border_color}`,
                                                                        }}
                                                                    >
                                                                        Overview
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="rounded-full px-4 py-2 text-xs font-medium"
                                                                        style={{
                                                                            backgroundColor: previewBranding.primary_color,
                                                                            color: previewBranding.primary_foreground,
                                                                        }}
                                                                    >
                                                                        Primary action
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-border/70 shadow-none">
                                            <CardContent className="space-y-4 p-6">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                    <Shield className="size-4" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="font-medium tracking-tight">Branding scope</h3>
                                                    <p className="text-sm leading-6 text-muted-foreground">
                                                        Only super admins and company admins can see this tab. Branding applies to the authenticated shell and tenant lifecycle emails.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}
                            </div>
                        </TabsContent>
                    ) : null}

                    {canManageTenantNotifications ? (
                        <TabsContent value="tenant-notifications" className="mt-0">
                            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                                <Card className="border-border/70 shadow-none">
                                    <CardHeader>
                                        <CardTitle>New tenant registration recipients</CardTitle>
                                        <CardDescription>
                                            Choose which platform users and external addresses receive email notifications when a new tenant registers.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-3">
                                            <Label>Internal platform users</Label>
                                            <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/15 p-4">
                                                {platformRecipientUsers.length > 0 ? (
                                                    platformRecipientUsers.map((recipient) => {
                                                        const checked = notificationForm.data.recipient_user_ids.includes(recipient.id);

                                                        return (
                                                            <label
                                                                key={recipient.id}
                                                                className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-background px-4 py-3"
                                                            >
                                                                <Checkbox
                                                                    checked={checked}
                                                                    onCheckedChange={(state) => {
                                                                        notificationForm.setData(
                                                                            'recipient_user_ids',
                                                                            state
                                                                                ? [...notificationForm.data.recipient_user_ids, recipient.id]
                                                                                : notificationForm.data.recipient_user_ids.filter((id) => id !== recipient.id),
                                                                        );
                                                                    }}
                                                                />
                                                                <div className="space-y-1">
                                                                    <div className="font-medium">{recipient.name}</div>
                                                                    <div className="text-sm text-muted-foreground">{recipient.email}</div>
                                                                </div>
                                                            </label>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="rounded-xl border border-dashed border-border/70 bg-background px-4 py-5 text-sm text-muted-foreground">
                                                        No super admin users are available to receive these alerts yet.
                                                    </div>
                                                )}
                                            </div>
                                            <InputError message={notificationForm.errors.recipient_user_ids} />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="recipient_emails_text">Extra email recipients</Label>
                                            <Textarea
                                                id="recipient_emails_text"
                                                value={notificationForm.data.recipient_emails_text}
                                                onChange={(event) => notificationForm.setData('recipient_emails_text', event.target.value)}
                                                rows={5}
                                                placeholder={'ops@privacycure.com\ncompliance@privacycure.com'}
                                            />
                                            <p className="text-sm text-muted-foreground">Add one email per line or separate addresses with commas.</p>
                                            <InputError message={notificationForm.errors.recipient_emails} />
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4">
                                            <Button type="button" onClick={savePlatformRecipients} disabled={notificationForm.processing}>
                                                <BellRing data-icon="inline-start" />
                                                {notificationForm.processing ? 'Saving recipients...' : 'Save notification recipients'}
                                            </Button>

                                            <Transition
                                                show={notificationForm.recentlySuccessful}
                                                enter="transition ease-in-out"
                                                enterFrom="opacity-0"
                                                leave="transition ease-in-out"
                                                leaveTo="opacity-0"
                                            >
                                                <p className="text-sm text-muted-foreground">Saved</p>
                                            </Transition>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-border/70 bg-muted/20 shadow-none">
                                    <CardHeader>
                                        <CardTitle>Notification summary</CardTitle>
                                        <CardDescription>See who currently gets notified and how the registration review flow works.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="grid gap-4">
                                            <NotificationSummaryRow
                                                icon={<Bell className="size-4" />}
                                                label="Internal recipients"
                                                value={selectedRecipientUsers.length}
                                                description="Selected platform users receive both in-app alerts and email."
                                            />
                                            <NotificationSummaryRow
                                                icon={<Mail className="size-4" />}
                                                label="Email-only recipients"
                                                value={extraRecipientEmails.length}
                                                description="External addresses receive email only."
                                            />
                                            <NotificationSummaryRow
                                                icon={<Building2 className="size-4" />}
                                                label="Pending tenants"
                                                value={pendingTenantCount}
                                                description="New registrations waiting for activation review."
                                            />
                                        </div>

                                        <Separator />

                                        <div className="space-y-3">
                                            <p className="text-sm font-medium">Current internal recipients</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedRecipientUsers.length > 0 ? (
                                                    selectedRecipientUsers.map((recipient) => (
                                                        <Badge key={recipient.id} variant="outline" className="rounded-full px-3 py-1">
                                                            {recipient.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">No internal recipients selected.</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-sm font-medium">Current extra emails</p>
                                            <div className="flex flex-wrap gap-2">
                                                {extraRecipientEmails.length > 0 ? (
                                                    extraRecipientEmails.map((email) => (
                                                        <Badge key={email} variant="outline" className="rounded-full px-3 py-1">
                                                            {email}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">No extra email recipients configured.</span>
                                                )}
                                            </div>
                                        </div>

                                        <Button asChild variant="outline">
                                            <Link href={route('settings.platform.edit')}>
                                                <BellRing data-icon="inline-start" />
                                                Open full platform approvals
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    ) : null}

                    <TabsContent value="support" className="mt-0">
                        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle>Support workspace</CardTitle>
                                    <CardDescription>Use support when profile, assignment, or compliance workflow access is blocked.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <ActionLink
                                        href={route('help.index')}
                                        icon={<CircleHelp className="size-5" />}
                                        title="Open Help / Support"
                                        description="Find guidance for courses, assignments, tests, submissions, certificates, and profile issues."
                                    />
                                    <ActionLink
                                        href="mailto:support@privacycure.com"
                                        icon={<MailCheck className="size-5" />}
                                        title="Email platform support"
                                        description="Include your company name, profile email, and the workflow that is blocked."
                                        external
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-border/70 bg-muted/20 shadow-none">
                                <CardHeader>
                                    <CardTitle>When to contact an admin</CardTitle>
                                    <CardDescription>Some issues are controlled by tenant administrators, not your personal profile.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                                    <p>Missing mandatory courses, tests, or submissions usually means the task has not been assigned to your account.</p>
                                    <p>Department, job title, branch, and employee number are managed through the employee profile workspace.</p>
                                    <p>Inactive account status must be resolved by a company admin or platform administrator.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </PlatformLayout>
    );
}

function NotificationSummaryRow({
    icon,
    label,
    value,
    description,
}: {
    icon: ReactNode;
    label: string;
    value: string | number;
    description: string;
}) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-background p-4">
            <div className="flex items-start gap-3">
                <div className="rounded-lg border border-border/70 bg-muted/35 p-2 text-primary">{icon}</div>
                <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
            </div>
            <div className="text-lg font-semibold tracking-tight">{value}</div>
        </div>
    );
}

function ProfileMetric({
    label,
    value,
    icon,
    status = false,
}: {
    label: string;
    value: string | number;
    icon: ReactNode;
    status?: boolean;
}) {
    return (
        <Card className="border-border/70 shadow-none">
            <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="min-w-0 flex flex-col gap-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    {status ? <StatusBadge value={String(value)} /> : <p className="truncate text-lg font-semibold tracking-tight">{value}</p>}
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/35 p-2.5">{icon}</div>
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

function AccountRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xl">
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}

function ActionLink({
    href,
    icon,
    title,
    description,
    external = false,
}: {
    href: string;
    icon: ReactNode;
    title: string;
    description: string;
    external?: boolean;
}) {
    const content = (
        <div className="flex h-full items-start gap-3 rounded-lg border border-border/70 bg-background p-4 transition-colors hover:bg-muted/40">
            <div className="rounded-lg border border-border/70 bg-muted/35 p-2 text-primary">{icon}</div>
            <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
        </div>
    );

    if (external) {
        return (
            <a href={href} className="block h-full">
                {content}
            </a>
        );
    }

    return (
        <Link href={href} className="block h-full">
            {content}
        </Link>
    );
}
