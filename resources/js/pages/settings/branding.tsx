import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { resolveBranding } from '@/lib/tenant-branding';
import { BreadcrumbItem, SharedData, Tenant, TenantBranding } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Building2, ImagePlus, Palette, Save, Shield, SwatchBook, UploadCloud, X } from 'lucide-react';
import { DragEvent, useEffect, useMemo, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Branding',
        href: '/settings/branding',
    },
];

interface TenantOption {
    id: number;
    name: string;
    status: string;
}

const HEX_COLOR_PATTERN = /^#?[0-9A-F]{6}$/i;

export default function TenantBrandingPage({
    selectedTenant,
    tenantOptions,
    defaults,
}: {
    selectedTenant: Tenant | null;
    tenantOptions: TenantOption[];
    defaults: TenantBranding;
}) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user?.display_role === 'super_admin';
    const selectedBranding = resolveBranding(selectedTenant?.branding ?? defaults);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [isDraggingLogo, setIsDraggingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const form = useForm<{
        tenant_id: number | null;
        primary_color: string;
        logo: File | null;
        remove_logo: boolean;
    }>({
        tenant_id: selectedTenant?.id ?? null,
        primary_color: selectedTenant?.primary_color ?? selectedBranding.primary_color,
        logo: null,
        remove_logo: false,
    });

    useEffect(() => {
        form.setData({
            tenant_id: selectedTenant?.id ?? null,
            primary_color: selectedTenant?.primary_color ?? selectedBranding.primary_color,
            logo: null,
            remove_logo: false,
        });
        setLogoFile(null);
    }, [selectedTenant?.id, selectedTenant?.primary_color]);

    const previewUrl = useMemo(() => {
        if (logoFile) {
            return URL.createObjectURL(logoFile);
        }

        if (form.data.remove_logo) {
            return null;
        }

        return selectedBranding.logo_url ?? null;
    }, [logoFile, form.data.remove_logo, selectedBranding.logo_url]);

    useEffect(() => {
        return () => {
            if (previewUrl && logoFile) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl, logoFile]);

    const previewBranding = resolveBranding({
        ...selectedBranding,
        primary_color: HEX_COLOR_PATTERN.test(form.data.primary_color) ? form.data.primary_color : selectedBranding.primary_color,
        logo_url: previewUrl,
        is_customized: Boolean((form.data.primary_color && form.data.primary_color !== defaults.primary_color) || previewUrl),
    });

    const submit = () => {
        form.transform((data) => ({
            tenant_id: data.tenant_id,
            primary_color: data.primary_color,
            logo: data.logo,
            remove_logo: data.remove_logo,
        }));
        form.post(route('settings.branding.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const selectedTenantId = selectedTenant?.id ? String(selectedTenant.id) : undefined;

    const applyLogoFile = (file: File | null) => {
        setLogoFile(file);
        form.setData('logo', file);

        if (file) {
            form.setData('remove_logo', false);
        }
    };

    const handleLogoDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDraggingLogo(false);

        const file = event.dataTransfer.files?.[0] ?? null;
        applyLogoFile(file);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tenant branding" />

            <SettingsLayout fullWidth>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Tenant branding"
                        description="Manage the logo and primary shell color used inside tenant workspaces and tenant lifecycle emails."
                    />

                    {isSuperAdmin ? (
                        <Card className="border-border/70 shadow-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base font-medium">
                                    <Building2 className="size-4" />
                                    Tenant context
                                </CardTitle>
                                <CardDescription>Select the tenant whose branding you want to edit.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Label htmlFor="tenant-selector">Tenant</Label>
                                <Select
                                    value={selectedTenantId}
                                    onValueChange={(value) =>
                                        router.get(
                                            route('settings.branding.edit'),
                                            { tenant_id: value },
                                            { preserveScroll: true, preserveState: true, replace: true },
                                        )
                                    }
                                >
                                    <SelectTrigger id="tenant-selector">
                                        <SelectValue placeholder="Choose a tenant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tenantOptions.map((tenant) => (
                                            <SelectItem key={tenant.id} value={String(tenant.id)}>
                                                {tenant.name} ({tenant.status})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    ) : null}

                    {!selectedTenant ? (
                        <Card className="border-border/70 shadow-none">
                            <CardContent className="flex min-h-[260px] flex-col items-center justify-center gap-4 p-10 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <Palette className="size-5" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-lg font-medium tracking-tight">Select a tenant to edit branding</h2>
                                    <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                                        Branding is applied per tenant. Choose a workspace above to upload its logo and set the shell accent color.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                            <Card className="border-border/70 shadow-none">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                                        <SwatchBook className="size-4" />
                                        Branding setup
                                    </CardTitle>
                                    <CardDescription>Update the logo and accent color shown in the authenticated shell for {selectedTenant.name}.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="primary_color">Primary color</Label>
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                            <Input
                                                id="primary_color"
                                                type="color"
                                                value={HEX_COLOR_PATTERN.test(form.data.primary_color) ? form.data.primary_color : selectedBranding.primary_color}
                                                onChange={(event) => form.setData('primary_color', event.target.value.toUpperCase())}
                                                className="h-12 w-full rounded-lg sm:w-24"
                                            />
                                            <Input
                                                value={form.data.primary_color}
                                                onChange={(event) => form.setData('primary_color', event.target.value.toUpperCase())}
                                                placeholder="#083D77"
                                                className="h-12 rounded-lg font-mono uppercase"
                                            />
                                            <Badge variant="outline" className="w-fit rounded-full px-3 py-1.5" style={{ borderColor: previewBranding.primary_color, color: previewBranding.primary_color }}>
                                                Live accent
                                            </Badge>
                                        </div>
                                        <InputError message={form.errors.primary_color} />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="logo">Tenant logo</Label>
                                        <label
                                            htmlFor="logo"
                                            onDragOver={(event) => {
                                                event.preventDefault();
                                                setIsDraggingLogo(true);
                                            }}
                                            onDragLeave={() => setIsDraggingLogo(false)}
                                            onDrop={handleLogoDrop}
                                            className="block"
                                        >
                                            <div
                                                className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-8 text-center transition-colors"
                                                style={{
                                                    borderColor: isDraggingLogo ? previewBranding.primary_color : undefined,
                                                    backgroundColor: isDraggingLogo ? previewBranding.soft_color : undefined,
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
                                                        {logoFile ? logoFile.name : 'Drag and drop a logo here'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Click to browse or drop a PNG, JPG, SVG-compatible image export, or WEBP file.
                                                    </div>
                                                </div>
                                                {logoFile ? (
                                                    <div className="text-xs text-muted-foreground">
                                                        {(logoFile.size / 1024).toFixed(1)} KB selected
                                                    </div>
                                                ) : null}
                                            </div>
                                            <Input
                                                ref={fileInputRef}
                                                id="logo"
                                                type="file"
                                                accept="image/*"
                                                onChange={(event) => applyLogoFile(event.target.files?.[0] ?? null)}
                                                className="sr-only"
                                            />
                                        </label>
                                        {logoFile ? (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        applyLogoFile(null);
                                                        if (fileInputRef.current) {
                                                            fileInputRef.current.value = '';
                                                        }
                                                    }}
                                                >
                                                    <X className="size-4" />
                                                    Clear selected file
                                                </Button>
                                            </div>
                                        ) : null}
                                        <label className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/10 px-4 py-3">
                                            <Checkbox
                                                checked={form.data.remove_logo}
                                                onCheckedChange={(checked) => form.setData('remove_logo', Boolean(checked))}
                                            />
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium">Remove current logo</div>
                                                <div className="text-xs text-muted-foreground">Use the default Privacy Cure logo until a new tenant logo is uploaded.</div>
                                            </div>
                                        </label>
                                        <InputError message={form.errors.logo} />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button type="button" onClick={submit} disabled={form.processing}>
                                            <Save className="size-4" />
                                            {form.processing ? 'Saving branding...' : 'Save branding'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                form.setData({
                                                    tenant_id: selectedTenant.id,
                                                    primary_color: defaults.primary_color,
                                                    logo: null,
                                                    remove_logo: true,
                                                })
                                            }
                                        >
                                            <ImagePlus className="size-4" />
                                            Reset to default
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <Card className="border-border/70 shadow-none">
                                    <CardHeader>
                                        <CardTitle className="text-base font-medium">Live preview</CardTitle>
                                        <CardDescription>Preview how the shell logo, sidebar, and primary action treatment will look for tenant users.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="rounded-xl border border-border/70 bg-background p-4">
                                            <div className="rounded-lg border p-4" style={{ borderColor: previewBranding.soft_border_color, backgroundColor: previewBranding.soft_color }}>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 min-w-11 items-center justify-center overflow-hidden rounded-lg bg-white/90 p-2 shadow-sm">
                                                        {previewBranding.logo_url ? (
                                                            <img src={previewBranding.logo_url} alt={selectedTenant.name} className="max-h-7 w-auto object-contain" />
                                                        ) : (
                                                            <span className="text-xs font-semibold" style={{ color: previewBranding.primary_color }}>
                                                                {selectedTenant.name.slice(0, 2).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium">{selectedTenant.name}</div>
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
                                                    <div className="mb-4 text-xs uppercase tracking-[0.18em]" style={{ color: previewBranding.primary_foreground }}>
                                                        Sidebar
                                                    </div>
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
                                                    <div className="flex items-center justify-between">
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
                                                This first pass applies tenant branding to the authenticated shell and tenant lifecycle emails. Public marketing pages and exports continue using the platform brand.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
