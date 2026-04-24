import { CreateGuidancePanel } from '@/components/create-guidance-panel';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { PhoneInput } from '@/components/phone-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlatformLayout from '@/layouts/platform-layout';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Building2, ClipboardList, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { ReactNode } from 'react';

const industries = [
    'Agriculture',
    'Agribusiness',
    'Animal Health',
    'Apparel & Fashion',
    'Architecture & Planning',
    'Arts & Culture',
    'Automotive',
    'Aviation & Aerospace',
    'Banking',
    'Biotechnology',
    'Building Materials',
    'Business Consulting',
    'Capital Markets',
    'Chemicals',
    'Civic & Social Organization',
    'Civil Engineering',
    'Commercial Real Estate',
    'Computer Hardware',
    'Computer Networking',
    'Construction',
    'Consumer Electronics',
    'Consumer Goods',
    'Consumer Services',
    'Cybersecurity',
    'Data & Analytics',
    'Defense & Space',
    'Design',
    'E-commerce',
    'Education',
    'Electrical & Electronic Manufacturing',
    'Energy',
    'Engineering Services',
    'Entertainment',
    'Environmental Services',
    'Events Services',
    'Facilities Services',
    'Farming',
    'Financial Services',
    'Fintech',
    'Food & Beverage',
    'Food Production',
    'Forestry',
    'Government Administration',
    'Government Relations',
    'Graphic Design',
    'Healthcare',
    'Higher Education',
    'Hospitality',
    'Human Resources',
    'Import & Export',
    'Industrial Automation',
    'Information Services',
    'Information Technology',
    'Insurance',
    'Internet Services',
    'Investment Management',
    'Judiciary',
    'Legal Services',
    'Leisure, Travel & Tourism',
    'Logistics & Supply Chain',
    'Luxury Goods & Jewelry',
    'Machinery',
    'Management Consulting',
    'Manufacturing',
    'Marine & Maritime',
    'Market Research',
    'Marketing & Advertising',
    'Media Production',
    'Medical Devices',
    'Mining & Metals',
    'Motion Pictures & Film',
    'Museums & Institutions',
    'Nanotechnology',
    'Nonprofit Organization Management',
    'Oil & Gas',
    'Outsourcing & Offshoring',
    'Packaging & Containers',
    'Pharmaceuticals',
    'Professional Training & Coaching',
    'Public Policy',
    'Public Relations & Communications',
    'Public Safety',
    'Publishing',
    'Real Estate',
    'Religious Institutions',
    'Renewable Energy',
    'Research',
    'Restaurants',
    'Retail',
    'Security & Investigations',
    'Semiconductors',
    'Software',
    'Sports',
    'Staffing & Recruiting',
    'Telecommunications',
    'Textiles',
    'Transportation',
    'Utilities',
    'Venture Capital & Private Equity',
    'Veterinary',
    'Warehousing',
    'Wholesale',
    'Other',
];

const companySizes = ['1-50 employees', '51-200 employees', '201-500 employees', '500+ employees'];

const statuses = [
    { label: 'Active', value: 'active', description: 'Workspace can be used immediately.' },
    { label: 'Pending', value: 'pending', description: 'Workspace is created but waits for activation.' },
    { label: 'Inactive', value: 'inactive', description: 'Workspace exists but access is paused.' },
    { label: 'Suspended', value: 'suspended', description: 'Restrictive exceptional status.' },
];

export default function TenantCreate() {
    const form = useForm({
        name: '',
        registration_number: '',
        industry: industries[0],
        company_size: companySizes[0],
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        status: 'active',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(route('tenants.store'));
    };

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Create Tenant"
                    description="Create a company workspace directly as a platform administrator. You can activate it immediately or keep it pending for review."
                    icon={Building2}
                >
                    <Button asChild variant="outline" className="bg-white text-[#0F2E52] hover:bg-white/90">
                        <Link href={route('tenants.index')}>
                            <ArrowLeft className="size-4" />
                            Back to tenants
                        </Link>
                    </Button>
                </PageHeader>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader>
                            <CardTitle>Tenant workspace details</CardTitle>
                            <CardDescription>
                                Capture the company profile, primary contact, and starting lifecycle state for this tenant.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Company name" error={form.errors.name}>
                                        <Input
                                            value={form.data.name}
                                            onChange={(event) => form.setData('name', event.target.value)}
                                            placeholder="e.g. Harare Tech Solutions"
                                            autoComplete="organization"
                                        />
                                    </Field>

                                    <Field label="Registration number" error={form.errors.registration_number}>
                                        <Input
                                            value={form.data.registration_number}
                                            onChange={(event) => form.setData('registration_number', event.target.value)}
                                            placeholder="CR-12345/2026"
                                        />
                                    </Field>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Industry" error={form.errors.industry}>
                                        <Select value={form.data.industry} onValueChange={(value) => form.setData('industry', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select industry" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-80">
                                                {industries.map((industry) => (
                                                    <SelectItem key={industry} value={industry}>
                                                        {industry}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    <Field label="Company size" error={form.errors.company_size}>
                                        <Select value={form.data.company_size} onValueChange={(value) => form.setData('company_size', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select company size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {companySizes.map((size) => (
                                                    <SelectItem key={size} value={size}>
                                                        {size}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Primary contact name" error={form.errors.contact_name}>
                                        <Input
                                            value={form.data.contact_name}
                                            onChange={(event) => form.setData('contact_name', event.target.value)}
                                            placeholder="Contact person"
                                            autoComplete="name"
                                        />
                                    </Field>

                                    <Field label="Primary contact email" error={form.errors.contact_email}>
                                        <Input
                                            type="email"
                                            value={form.data.contact_email}
                                            onChange={(event) => form.setData('contact_email', event.target.value)}
                                            placeholder="contact@company.com"
                                            autoComplete="email"
                                        />
                                    </Field>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="Primary contact phone" error={form.errors.contact_phone}>
                                        <PhoneInput
                                            value={form.data.contact_phone}
                                            onChange={(value) => form.setData('contact_phone', value)}
                                            error={form.errors.contact_phone}
                                            placeholder="77 123 4567"
                                            autoComplete="tel"
                                        />
                                    </Field>

                                    <Field label="Initial status" error={form.errors.status}>
                                        <Select value={form.data.status} onValueChange={(value) => form.setData('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statuses.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            {statuses.find((status) => status.value === form.data.status)?.description}
                                        </p>
                                    </Field>
                                </div>

                                <div className="flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                    <Button asChild type="button" variant="outline">
                                        <Link href={route('tenants.index')}>
                                            <ArrowLeft className="size-4" />
                                            Cancel
                                        </Link>
                                    </Button>

                                    <Button type="submit" disabled={form.processing}>
                                        <Sparkles className="size-4" />
                                        Create tenant workspace
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <CreateGuidancePanel
                        title="Creation flow"
                        description="This creates the tenant record only. Add users through invitations after the workspace exists."
                        items={[
                            {
                                title: 'Workspace is created immediately',
                                description: 'The tenant appears on the tenants index and gets a dedicated detail page after save.',
                                icon: Building2,
                            },
                            {
                                title: 'Status controls access',
                                description: 'Choose active for immediate access or pending if the company still needs review.',
                                icon: ShieldCheck,
                            },
                            {
                                title: 'Invite company users next',
                                description: 'Use invitations to add a company admin, reviewers, or employees after the tenant exists.',
                                icon: Users,
                            },
                            {
                                title: 'Audit trail is preserved',
                                description: 'Tenant creation is logged so platform administrators can track workspace changes.',
                                icon: ClipboardList,
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
