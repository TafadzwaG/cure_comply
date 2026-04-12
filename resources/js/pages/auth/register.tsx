import InputError from '@/components/input-error';
import { PhoneInput } from '@/components/phone-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import privacyCureLogo from '@/images/privacycure-logo.png';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, LockKeyhole, Rocket } from 'lucide-react';

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

export default function Register() {
    const form = useForm({
        company_name: '',
        registration_number: '',
        industry: industries[0],
        company_size: companySizes[0],
        contact_phone: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('register'));
    };

    return (
        <>
            <Head title="Create Your Company Workspace | Privacy Cure">
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <style>{`
                    body { font-family: 'Inter', sans-serif; }
                    h1, h2, h3, h4, h5 { font-family: 'Plus Jakarta Sans', sans-serif; }
                `}</style>
            </Head>

            <div className="min-h-screen bg-[#f7f9fb] dark:bg-[#0d1117] px-0 py-0 text-[#191c1e] dark:text-[#e5e7eb]">
                <div className="mx-auto w-full max-w-[96rem]">
                    <div className="overflow-hidden rounded-2xl border border-[#c3c6d1]/20 dark:border-[#2d3748]/40 bg-[#f7f9fb] dark:bg-[#111827] shadow-[0_24px_70px_-40px_rgba(0,39,83,0.22)] dark:shadow-[0_24px_70px_-40px_rgba(0,0,0,0.5)]">
                        <div className="flex flex-col items-center justify-between gap-6 border-b border-[#c3c6d1]/15 dark:border-[#2d3748]/25 bg-[#f2f4f6]/70 dark:bg-[#161b2e]/70 px-8 py-6 md:flex-row">
                            <Link href={route('home')} className="flex items-center gap-3">
                                <img src={privacyCureLogo} alt="Privacy Cure" className="h-9 w-auto" />
                                <span className="text-lg font-extrabold tracking-tight text-[#002753] dark:text-[#93b4d8]">Privacy Cure</span>
                            </Link>

                            <div className="flex w-full items-center gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
                                <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#002753]/10 dark:bg-[#7cb3e8]/10 px-3 py-1">
                                    <span className="h-2 w-2 rounded-full bg-[#002753] dark:bg-[#93b4d8]" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#002753] dark:text-[#93b4d8]">1. Identification</span>
                                </div>
                                <div className="h-px w-4 bg-[#c3c6d1]/40 dark:bg-[#2d3748]/60" />
                                <div className="flex shrink-0 items-center gap-2 px-3 py-1">
                                    <span className="h-2 w-2 rounded-full bg-[#c3c6d1] dark:bg-[#4a5568]" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#434750] dark:text-[#9ca3af]">2. Setup</span>
                                </div>
                                <div className="h-px w-4 bg-[#c3c6d1]/40 dark:bg-[#2d3748]/60" />
                                <div className="flex shrink-0 items-center gap-2 px-3 py-1">
                                    <span className="h-2 w-2 rounded-full bg-[#c3c6d1] dark:bg-[#4a5568]" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#434750] dark:text-[#9ca3af]">3. Integration</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            <div className="border-r border-[#c3c6d1]/15 dark:border-[#2d3748]/25 p-8 md:p-12 lg:col-span-8">
                                <header className="mb-12">
                                    <span className="mb-4 inline-flex items-center rounded-full bg-[#00444d] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#00b9ce]">
                                        Workspace setup
                                    </span>
                                    <h1 className="mb-4 text-3xl leading-tight font-bold text-[#002753] dark:text-[#93b4d8] md:text-5xl">
                                        Create Your Company <br />
                                        <span className="text-[#194781] dark:text-[#7cb3e8]">Architectural Sanctuary</span>
                                    </h1>
                                    <p className="max-w-xl text-base leading-relaxed text-[#434750] dark:text-[#9ca3af]">
                                        Establish your organization&apos;s secure compliance perimeter. Privacy Cure adapts to Zimbabwean regulatory
                                        frameworks.
                                    </p>
                                </header>

                                <form onSubmit={submit} noValidate className="space-y-12">
                                    <section className="space-y-8">
                                        <h3 className="flex items-center gap-3 text-xl font-bold text-[#002753] dark:text-[#93b4d8]">
                                            <span className="h-6 w-1.5 rounded-full bg-[#00daf3]" />
                                            Organization Profile
                                        </h3>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <FieldLabel>Company Name</FieldLabel>
                                                <FormInput
                                                    id="company_name"
                                                    name="company_name"
                                                    value={form.data.company_name}
                                                    onChange={(e) => form.setData('company_name', e.target.value)}
                                                    placeholder="e.g. Harare Tech Solutions"
                                                    error={form.errors.company_name}
                                                    required
                                                    autoComplete="organization"
                                                />
                                                <InputError message={form.errors.company_name} />
                                            </div>

                                            <div className="space-y-2">
                                                <FieldLabel>Registration Number</FieldLabel>
                                                <FormInput
                                                    id="registration_number"
                                                    name="registration_number"
                                                    value={form.data.registration_number}
                                                    onChange={(e) => form.setData('registration_number', e.target.value)}
                                                    placeholder="CR-12345/2024"
                                                    error={form.errors.registration_number}
                                                    autoComplete="off"
                                                />
                                                <InputError message={form.errors.registration_number} />
                                            </div>

                                            <div className="space-y-2">
                                                <FieldLabel>Industry</FieldLabel>
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
                                                <InputError message={form.errors.industry} />
                                            </div>

                                            <div className="space-y-2">
                                                <FieldLabel>Company Size</FieldLabel>
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
                                                <InputError message={form.errors.company_size} />
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <FieldLabel>Contact Phone</FieldLabel>
                                                <PhoneInput
                                                    id="contact_phone"
                                                    name="contact_phone"
                                                    value={form.data.contact_phone}
                                                    onChange={(value) => form.setData('contact_phone', value)}
                                                    placeholder="77 123 4567"
                                                    error={form.errors.contact_phone}
                                                    autoComplete="tel"
                                                />
                                                <InputError message={form.errors.contact_phone} />
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-8">
                                        <h3 className="flex items-center gap-3 text-xl font-bold text-[#002753] dark:text-[#93b4d8]">
                                            <span className="h-6 w-1.5 rounded-full bg-[#002753] dark:bg-[#93b4d8]" />
                                            Administrator Identity
                                        </h3>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="space-y-2 md:col-span-2">
                                                <FieldLabel>Admin Full Name</FieldLabel>
                                                <FormInput
                                                    id="name"
                                                    name="name"
                                                    value={form.data.name}
                                                    onChange={(e) => form.setData('name', e.target.value)}
                                                    placeholder="John Doe"
                                                    error={form.errors.name}
                                                    required
                                                    autoComplete="name"
                                                />
                                                <InputError message={form.errors.name} />
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <FieldLabel>Admin Email Address</FieldLabel>
                                                <FormInput
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={form.data.email}
                                                    onChange={(e) => form.setData('email', e.target.value)}
                                                    placeholder="admin@company.zw"
                                                    error={form.errors.email}
                                                    required
                                                    autoComplete="email"
                                                />
                                                <InputError message={form.errors.email} />
                                            </div>

                                            <div className="space-y-2">
                                                <FieldLabel>Password</FieldLabel>
                                                <FormInput
                                                    id="password"
                                                    name="password"
                                                    type="password"
                                                    value={form.data.password}
                                                    onChange={(e) => form.setData('password', e.target.value)}
                                                    placeholder="••••••••"
                                                    error={form.errors.password}
                                                    required
                                                    autoComplete="new-password"
                                                />
                                                <InputError message={form.errors.password} />
                                            </div>

                                            <div className="space-y-2">
                                                <FieldLabel>Confirm Password</FieldLabel>
                                                <FormInput
                                                    id="password_confirmation"
                                                    name="password_confirmation"
                                                    type="password"
                                                    value={form.data.password_confirmation}
                                                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                                    placeholder="••••••••"
                                                    error={form.errors.password_confirmation}
                                                    required
                                                    autoComplete="new-password"
                                                />
                                                <InputError message={form.errors.password_confirmation} />
                                            </div>
                                        </div>
                                    </section>

                                    <div className="flex items-center justify-between border-t border-[#c3c6d1]/15 dark:border-[#2d3748]/25 pt-8">
                                        <Link href={route('home')} className="group flex items-center gap-2 text-sm font-bold text-[#002753] dark:text-[#93b4d8] hover:underline">
                                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                                            Back to Welcome
                                        </Link>

                                        <Button
                                            type="submit"
                                            disabled={form.processing}
                                            className="rounded-full bg-[#002753] px-8 py-6 text-base font-bold text-white shadow-lg shadow-[#002753]/20 hover:bg-[#00444d] hover:text-[#00b9ce]"
                                        >
                                            Initialize Workspace
                                            <Rocket className="size-4" />
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            <div className="space-y-8 bg-[#f2f4f6]/30 dark:bg-[#161b2e]/30 p-8 lg:col-span-4">
                                <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-square">
                                    <img
                                        className="absolute inset-0 h-full w-full object-cover grayscale brightness-50 transition-all duration-700 group-hover:grayscale-0"
                                        alt="Monumental architecture"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaIRuQ4x_OmZ999tMbJ02_ySlS15C1VEAGjAXwKlK0YccxLDHoIwFUEUb1gUSLTELewmTRL074j5nbhUoAjPKvbYLU-1mIAjyp2RzvdaBvEwPFr3XwQGPsvWEslUVDN6961zxFKUym-1MfNa5TcSGFqRtgFCIg0u3uPKeGeNt4e_5CNtMTX2gGm_RUpJ12W0n7gMdWWqO-QG6pwymXlezyIqH3j7OdmJFh41MLiPUrQx6aJbBGgeEurlM-bnvF2lNfwsRHaGiPvHA"
                                    />
                                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#002753]/90 via-[#002753]/40 to-transparent p-6">
                                        <LockKeyhole className="mb-3 size-8 text-[#00daf3]" />
                                        <h4 className="mb-2 text-lg font-bold text-white">Privacy by Design</h4>
                                        <p className="text-xs leading-relaxed text-[#83a9ea]">
                                            Your registration creates a pending tenant workspace with its first company administrator account.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6 rounded-2xl border border-[#c3c6d1]/15 dark:border-[#2d3748]/25 bg-white dark:bg-[#1a202c] p-6">
                                    <h5 className="border-b border-[#c3c6d1]/30 dark:border-[#2d3748]/40 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#002753] dark:text-[#93b4d8]">
                                        Onboarding Milestones
                                    </h5>
                                    <ul className="space-y-5">
                                        <li className="flex items-start gap-3">
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00daf3]">
                                                <Check className="size-3 text-[#002753]" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[#002753] dark:text-[#93b4d8]">Company and admin details</p>
                                                <p className="mt-1 text-[10px] leading-relaxed text-[#434750] dark:text-[#9ca3af]">
                                                    Your company profile and company administrator login are captured in one step.
                                                </p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#083d77] animate-pulse">
                                                <div className="h-1.5 w-1.5 rounded-full bg-[#00daf3]" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[#002753] dark:text-[#93b4d8]">Pending workspace creation</p>
                                                <p className="mt-1 text-[10px] leading-relaxed text-[#434750] dark:text-[#9ca3af]">
                                                    A tenant workspace is created in pending status after you submit this form.
                                                </p>
                                            </div>
                                        </li>
                                        <li className="flex items-start gap-3 opacity-40">
                                            <div className="h-5 w-5 shrink-0 rounded-full border border-[#737781] dark:border-[#4a5568]" />
                                            <div>
                                                <p className="text-xs font-bold text-[#002753] dark:text-[#93b4d8]">Super admin activation</p>
                                                <p className="mt-1 text-[10px] leading-relaxed text-[#434750] dark:text-[#9ca3af]">
                                                    Your workspace becomes active once platform support approves and activates the tenant.
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="mt-8 flex flex-col items-center justify-between gap-6 px-4 md:flex-row">
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#434750] dark:text-[#6b7280]">
                            © 2024 Privacy Cure (Pvt) Ltd. All Rights Reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <a className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#434750] dark:text-[#6b7280] transition-colors hover:text-[#002753] dark:hover:text-[#93b4d8]" href="#">
                                Privacy Policy
                            </a>
                            <a className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#434750] dark:text-[#6b7280] transition-colors hover:text-[#002753] dark:hover:text-[#93b4d8]" href="#">
                                Terms
                            </a>
                            <a className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#434750] dark:text-[#6b7280] transition-colors hover:text-[#002753] dark:hover:text-[#93b4d8]" href="#">
                                Security
                            </a>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
