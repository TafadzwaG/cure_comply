import { CreateGuidancePanel } from '@/components/create-guidance-panel';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlatformLayout from '@/layouts/platform-layout';
import { Tenant } from '@/types';
import { useForm } from '@inertiajs/react';
import { Building2, ClipboardList, ShieldCheck, Users } from 'lucide-react';
import { ReactNode } from 'react';

export default function TenantEdit({ tenant }: { tenant: Tenant }) {
    const form = useForm({
        name: tenant.name ?? '',
        registration_number: tenant.registration_number ?? '',
        industry: tenant.industry ?? '',
        company_size: tenant.company_size ?? '',
        contact_name: tenant.contact_name ?? '',
        contact_email: tenant.contact_email ?? '',
        contact_phone: tenant.contact_phone ?? '',
        status: tenant.status ?? 'active',
    });

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader title={`Edit ${tenant.name}`} description="Update tenant profile information, contact data, and workspace lifecycle status." />
                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader>
                            <CardTitle>Tenant Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Company name" error={form.errors.name}>
                                    <Input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} />
                                </Field>
                                <Field label="Registration number" error={form.errors.registration_number}>
                                    <Input
                                        value={form.data.registration_number}
                                        onChange={(event) => form.setData('registration_number', event.target.value)}
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Industry" error={form.errors.industry}>
                                    <Input value={form.data.industry} onChange={(event) => form.setData('industry', event.target.value)} />
                                </Field>
                                <Field label="Company size" error={form.errors.company_size}>
                                    <Input value={form.data.company_size} onChange={(event) => form.setData('company_size', event.target.value)} />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Contact name" error={form.errors.contact_name}>
                                    <Input value={form.data.contact_name} onChange={(event) => form.setData('contact_name', event.target.value)} />
                                </Field>
                                <Field label="Contact email" error={form.errors.contact_email}>
                                    <Input type="email" value={form.data.contact_email} onChange={(event) => form.setData('contact_email', event.target.value)} />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Contact phone" error={form.errors.contact_phone}>
                                    <Input value={form.data.contact_phone} onChange={(event) => form.setData('contact_phone', event.target.value)} />
                                </Field>
                                <Field label="Status" error={form.errors.status}>
                                    <Select value={form.data.status} onValueChange={(value) => form.setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </div>

                            <Button onClick={() => form.patch(route('tenants.update', tenant.id))}>Save Tenant Changes</Button>
                        </CardContent>
                    </Card>

                    <CreateGuidancePanel
                        title="What happens next"
                        description="Tenant updates affect visibility, support workflows, and the company’s operational posture."
                        items={[
                            {
                                title: 'Company profile is refreshed',
                                description: 'The tenants index and tenant detail views immediately reflect the updated metadata.',
                                icon: Building2,
                            },
                            {
                                title: 'Lifecycle status is enforced',
                                description: 'Suspended or inactive tenants can be distinguished clearly from active workspaces.',
                                icon: ShieldCheck,
                            },
                            {
                                title: 'Support context improves',
                                description: 'Updated contact and registration fields give support teams better context during escalations.',
                                icon: ClipboardList,
                            },
                            {
                                title: 'Workspace records stay linked',
                                description: 'Users, departments, and submissions remain attached to the same tenant while metadata changes.',
                                icon: Users,
                            },
                        ]}
                    />
                </div>
            </div>
        </PlatformLayout>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
