import InputError from '@/components/input-error';
import { PhoneInput } from '@/components/phone-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import privacyCureLogo from '@/images/privacycure-logo.png';
import privacyCureLogoWhite from '@/images/privacycure-logo-white.png';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, LoaderCircle, ShieldCheck } from 'lucide-react';

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

    const onboardingSteps = [
        { num: '01', label: 'Company profile', state: 'active' as const },
        { num: '02', label: 'Administrator', state: 'active' as const },
        { num: '03', label: 'Activation', state: 'pending' as const },
    ];

    const milestones = [
        {
            title: 'Company and admin details',
            copy: 'Your company profile and administrator login are captured in one step.',
            done: true,
        },
        {
            title: 'Pending workspace creation',
            copy: 'A tenant workspace is created in pending status after you submit this form.',
            done: false,
            current: true,
        },
        {
            title: 'Super admin activation',
            copy: 'Your workspace becomes active once platform support approves the tenant.',
            done: false,
        },
    ];

    return (
        <>
            <Head title="Create Your Company Workspace | Privacy Cure">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:300,400,500,600,700|instrument-sans:400,500,600|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
                <style>{`
                    .register-page {
                        --reg-paper: #f5f7fb;
                        --reg-paper-2: #eaf0f9;
                        --reg-ink: #1a2540;
                        --reg-muted: #5a6478;
                        --reg-navy: #0e2a5e;
                        --reg-accent: #1f4694;
                        --reg-cyan: #00daf3;
                        --reg-scroll-track: rgba(14, 42, 94, 0.08);
                        --reg-scroll-thumb: rgba(31, 70, 148, 0.32);
                        --reg-scroll-thumb-hover: rgba(31, 70, 148, 0.5);
                        min-height: 100vh;
                        background: var(--reg-paper);
                        color: var(--reg-ink);
                        font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
                        scrollbar-width: thin;
                        scrollbar-color: var(--reg-scroll-thumb) var(--reg-scroll-track);
                    }
                    .dark .register-page {
                        --reg-paper: #0b1220;
                        --reg-paper-2: #111827;
                        --reg-ink: #f5f7fb;
                        --reg-muted: #9ca3af;
                        --reg-scroll-track: rgba(168, 193, 237, 0.1);
                        --reg-scroll-thumb: rgba(168, 193, 237, 0.34);
                        --reg-scroll-thumb-hover: rgba(0, 218, 243, 0.48);
                    }
                    .register-page::-webkit-scrollbar {
                        width: 4px;
                    }
                    .register-page::-webkit-scrollbar-track {
                        background: var(--reg-scroll-track);
                    }
                    .register-page::-webkit-scrollbar-thumb {
                        background: var(--reg-scroll-thumb);
                        border-radius: 999px;
                        border: 1px solid var(--reg-paper);
                    }
                    .register-page::-webkit-scrollbar-thumb:hover {
                        background: var(--reg-scroll-thumb-hover);
                    }
                    .register-scrollbar {
                        scrollbar-width: thin;
                        scrollbar-color: var(--reg-scroll-thumb) var(--reg-scroll-track);
                    }
                    .register-scrollbar-x::-webkit-scrollbar {
                        height: 3px;
                    }
                    .register-scrollbar-y::-webkit-scrollbar {
                        width: 4px;
                    }
                    .register-scrollbar::-webkit-scrollbar-track {
                        background: var(--reg-scroll-track);
                        border-radius: 999px;
                    }
                    .register-scrollbar::-webkit-scrollbar-thumb {
                        background: var(--reg-scroll-thumb);
                        border-radius: 999px;
                    }
                    .register-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: var(--reg-scroll-thumb-hover);
                    }
                    .register-select-content {
                        --reg-scroll-track: rgba(14, 42, 94, 0.08);
                        --reg-scroll-thumb: rgba(31, 70, 148, 0.32);
                        --reg-scroll-thumb-hover: rgba(31, 70, 148, 0.5);
                    }
                    .register-select-content [data-radix-select-viewport] {
                        scrollbar-width: thin;
                        scrollbar-color: var(--reg-scroll-thumb) var(--reg-scroll-track);
                    }
                    .register-select-content [data-radix-select-viewport]::-webkit-scrollbar {
                        width: 4px;
                    }
                    .register-select-content [data-radix-select-viewport]::-webkit-scrollbar-track {
                        background: var(--reg-scroll-track);
                        border-radius: 999px;
                    }
                    .register-select-content [data-radix-select-viewport]::-webkit-scrollbar-thumb {
                        background: var(--reg-scroll-thumb);
                        border-radius: 999px;
                    }
                    .register-select-content [data-radix-select-viewport]::-webkit-scrollbar-thumb:hover {
                        background: var(--reg-scroll-thumb-hover);
                    }
                    .dark .register-select-content {
                        --reg-scroll-track: rgba(168, 193, 237, 0.1);
                        --reg-scroll-thumb: rgba(168, 193, 237, 0.34);
                        --reg-scroll-thumb-hover: rgba(0, 218, 243, 0.48);
                    }
                    .register-page h1,
                    .register-page h2,
                    .register-page h3 {
                        font-family: 'Fraunces', Georgia, serif;
                        letter-spacing: -0.01em;
                    }
                    .register-topbar {
                        position: sticky;
                        top: 0;
                        z-index: 40;
                        border-bottom: 1px solid rgba(14, 42, 94, 0.08);
                        background: rgba(245, 247, 251, 0.92);
                        backdrop-filter: blur(16px);
                    }
                    .dark .register-topbar {
                        border-bottom-color: rgba(168, 193, 237, 0.1);
                        background: rgba(11, 18, 32, 0.92);
                    }
                    .register-topbar-inner {
                        max-width: 1280px;
                        margin: 0 auto;
                        padding: 0 28px;
                        height: 68px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 20px;
                    }
                    @media (min-width: 1024px) {
                        .register-topbar-inner { padding: 0 56px; }
                    }
                    .register-steps {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        overflow-x: auto;
                        padding-bottom: 4px;
                        -webkit-overflow-scrolling: touch;
                    }
                    .register-step {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 6px 12px;
                        border-radius: 999px;
                        border: 1px solid transparent;
                        white-space: nowrap;
                        font-family: 'JetBrains Mono', ui-monospace, monospace;
                        font-size: 10px;
                        letter-spacing: 0.14em;
                        text-transform: uppercase;
                    }
                    .register-step.is-active {
                        border-color: rgba(0, 218, 243, 0.35);
                        background: rgba(31, 70, 148, 0.08);
                        color: var(--reg-accent);
                    }
                    .dark .register-step.is-active { color: #a8c1ed; }
                    .register-step.is-pending {
                        color: var(--reg-muted);
                        opacity: 0.75;
                    }
                    .register-step-num {
                        font-family: 'Fraunces', Georgia, serif;
                        font-size: 11px;
                        font-style: italic;
                        opacity: 0.85;
                    }
                    .register-step-sep {
                        width: 16px;
                        height: 1px;
                        background: rgba(14, 42, 94, 0.14);
                        flex-shrink: 0;
                    }
                    .register-shell {
                        max-width: 1280px;
                        margin: 0 auto;
                        padding: 48px 28px 64px;
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }
                    @media (min-width: 1024px) {
                        .register-shell {
                            padding: 56px 56px 80px;
                            grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
                            gap: 56px;
                            align-items: start;
                        }
                    }
                    .register-eyebrow {
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                        font-family: 'JetBrains Mono', ui-monospace, monospace;
                        font-size: 10px;
                        letter-spacing: 0.22em;
                        text-transform: uppercase;
                        color: var(--reg-muted);
                    }
                    .register-eyebrow-dash {
                        width: 28px;
                        height: 1px;
                        background: var(--reg-cyan);
                    }
                    .register-title {
                        margin-top: 16px;
                        font-size: clamp(2rem, 4vw, 3rem);
                        font-weight: 400;
                        line-height: 1.08;
                        color: var(--reg-ink);
                    }
                    .register-title em {
                        font-style: italic;
                        color: var(--reg-accent);
                    }
                    .dark .register-title em { color: var(--reg-cyan); }
                    .register-lede {
                        margin-top: 14px;
                        max-width: 36rem;
                        font-size: 0.9375rem;
                        line-height: 1.75;
                        color: var(--reg-muted);
                    }
                    .register-section {
                        margin-top: 40px;
                        padding-top: 32px;
                        border-top: 1px solid rgba(14, 42, 94, 0.1);
                    }
                    .dark .register-section { border-top-color: rgba(168, 193, 237, 0.12); }
                    .register-section-title {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        font-size: 1.25rem;
                        font-weight: 400;
                        color: var(--reg-ink);
                    }
                    .register-section-mark {
                        width: 6px;
                        height: 24px;
                        border-radius: 999px;
                        background: var(--reg-cyan);
                        flex-shrink: 0;
                    }
                    .register-section-mark.is-navy { background: var(--reg-accent); }
                    .register-form-actions {
                        display: flex;
                        flex-wrap: wrap;
                        align-items: center;
                        justify-content: space-between;
                        gap: 16px;
                        margin-top: 40px;
                        padding-top: 28px;
                        border-top: 1px solid rgba(14, 42, 94, 0.1);
                    }
                    .dark .register-form-actions { border-top-color: rgba(168, 193, 237, 0.12); }
                    .register-back-link {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        font-family: 'JetBrains Mono', ui-monospace, monospace;
                        font-size: 10px;
                        letter-spacing: 0.14em;
                        text-transform: uppercase;
                        color: var(--reg-accent);
                        text-decoration: none;
                        transition: color 0.2s;
                    }
                    .dark .register-back-link { color: #a8c1ed; }
                    .register-back-link:hover { color: var(--reg-cyan); }
                    .register-submit {
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                        padding: 14px 26px;
                        border-radius: 999px;
                        border: none;
                        background: var(--reg-accent);
                        color: #fff;
                        font-family: 'JetBrains Mono', ui-monospace, monospace;
                        font-size: 11px;
                        letter-spacing: 0.12em;
                        text-transform: uppercase;
                        cursor: pointer;
                        transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
                        box-shadow: 0 1px 0 rgba(14,42,94,0.2), 0 16px 32px -14px rgba(31,70,148,0.55);
                    }
                    .register-submit:hover:not(:disabled) {
                        background: var(--reg-navy);
                        transform: translateY(-1px);
                    }
                    .register-submit:disabled { opacity: 0.65; cursor: not-allowed; }
                    .register-aside {
                        position: relative;
                        isolation: isolate;
                        overflow: hidden;
                        border-radius: 20px;
                        border: 1px solid rgba(14, 42, 94, 0.1);
                        background: #071428;
                        min-height: 420px;
                    }
                    .dark .register-aside { border-color: rgba(168, 193, 237, 0.12); }
                    .register-aside-backdrop {
                        position: absolute;
                        inset: 0;
                        pointer-events: none;
                    }
                    .register-aside-photo {
                        position: absolute;
                        inset: 0;
                        background-image: url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format&fit=crop');
                        background-size: cover;
                        background-position: center;
                        opacity: 0.32;
                        transform: scale(1.04);
                    }
                    .register-aside-overlay {
                        position: absolute;
                        inset: 0;
                        background:
                            radial-gradient(ellipse 80% 50% at 0% 0%, rgba(0, 218, 243, 0.18), transparent 55%),
                            linear-gradient(180deg, rgba(7, 20, 40, 0.55) 0%, rgba(14, 42, 94, 0.92) 100%);
                    }
                    .register-aside-grain {
                        position: absolute;
                        inset: 0;
                        opacity: 0.4;
                        background-image:
                            radial-gradient(rgba(168, 193, 237, 0.07) 1px, transparent 1px),
                            radial-gradient(rgba(0, 218, 243, 0.05) 1px, transparent 1px);
                        background-size: 4px 4px, 11px 11px;
                    }
                    .register-aside-content {
                        position: relative;
                        z-index: 1;
                        padding: 28px;
                        display: flex;
                        flex-direction: column;
                        gap: 24px;
                        height: 100%;
                    }
                    .register-aside-kicker {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        font-family: 'JetBrains Mono', ui-monospace, monospace;
                        font-size: 10px;
                        letter-spacing: 0.2em;
                        text-transform: uppercase;
                        color: rgba(168, 193, 237, 0.85);
                    }
                    .register-aside-headline {
                        font-family: 'Fraunces', Georgia, serif;
                        font-size: 1.5rem;
                        font-weight: 400;
                        line-height: 1.2;
                        color: #f5f7fb;
                    }
                    .register-aside-headline em {
                        font-style: italic;
                        color: var(--reg-cyan);
                    }
                    .register-aside-copy {
                        font-size: 0.875rem;
                        line-height: 1.7;
                        color: rgba(245, 247, 251, 0.72);
                    }
                    .register-milestones {
                        margin-top: auto;
                        padding: 20px;
                        border-radius: 16px;
                        border: 1px solid rgba(168, 193, 237, 0.14);
                        background: rgba(255, 255, 255, 0.04);
                        backdrop-filter: blur(8px);
                    }
                    .register-milestones-title {
                        padding-bottom: 12px;
                        margin-bottom: 16px;
                        border-bottom: 1px solid rgba(168, 193, 237, 0.14);
                        font-family: 'JetBrains Mono', ui-monospace, monospace;
                        font-size: 10px;
                        letter-spacing: 0.18em;
                        text-transform: uppercase;
                        color: var(--reg-cyan);
                    }
                    .register-milestone {
                        display: flex;
                        gap: 12px;
                        align-items: flex-start;
                    }
                    .register-milestone + .register-milestone { margin-top: 18px; }
                    .register-milestone.is-muted { opacity: 0.45; }
                    .register-milestone-dot {
                        width: 20px;
                        height: 20px;
                        border-radius: 999px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                        background: rgba(0, 218, 243, 0.18);
                        color: var(--reg-cyan);
                    }
                    .register-milestone-dot.is-current {
                        background: rgba(31, 70, 148, 0.55);
                        border: 1px solid rgba(0, 218, 243, 0.35);
                    }
                    .register-milestone-dot.is-empty {
                        background: transparent;
                        border: 1px solid rgba(168, 193, 237, 0.35);
                    }
                    .register-milestone-label {
                        font-family: 'JetBrains Mono', ui-monospace, monospace;
                        font-size: 10px;
                        letter-spacing: 0.12em;
                        text-transform: uppercase;
                        color: #f5f7fb;
                    }
                    .register-milestone-copy {
                        margin-top: 4px;
                        font-size: 0.75rem;
                        line-height: 1.55;
                        color: rgba(245, 247, 251, 0.65);
                    }
                    .register-footer {
                        max-width: 1280px;
                        margin: 0 auto;
                        padding: 0 28px 32px;
                        display: flex;
                        flex-wrap: wrap;
                        align-items: center;
                        justify-content: space-between;
                        gap: 16px;
                    }
                    @media (min-width: 1024px) {
                        .register-footer { padding: 0 56px 40px; }
                    }
                    .register-footer-copy,
                    .register-footer-link {
                        font-family: 'JetBrains Mono', ui-monospace, monospace;
                        font-size: 10px;
                        letter-spacing: 0.16em;
                        text-transform: uppercase;
                        color: var(--reg-muted);
                    }
                    .register-footer-link {
                        text-decoration: none;
                        transition: color 0.2s;
                    }
                    .register-footer-link:hover { color: var(--reg-accent); }
                    .register-footer-links { display: flex; gap: 20px; }
                    .register-login-hint {
                        margin-top: 20px;
                        font-size: 0.875rem;
                        color: var(--reg-muted);
                    }
                    .register-login-hint a {
                        color: var(--reg-accent);
                        font-weight: 500;
                        text-decoration: underline;
                        text-underline-offset: 3px;
                    }
                    .dark .register-login-hint a { color: #a8c1ed; }
                `}</style>
            </Head>

            <div className="register-page">
                <header className="register-topbar">
                    <div className="register-topbar-inner">
                        <Link href={route('home')} className="inline-flex items-center">
                            <img src={privacyCureLogo} alt="Privacy Cure Compliance" className="h-10 w-auto dark:hidden" />
                            <img src={privacyCureLogoWhite} alt="Privacy Cure Compliance" className="hidden h-10 w-auto dark:block" />
                        </Link>

                        <nav className="register-steps register-scrollbar register-scrollbar-x" aria-label="Onboarding progress">
                            {onboardingSteps.map((step, i) => (
                                <span key={step.num} className="contents">
                                    {i > 0 ? <span className="register-step-sep" aria-hidden="true" /> : null}
                                    <span className={`register-step ${step.state === 'active' ? 'is-active' : 'is-pending'}`}>
                                        <span className="register-step-num">{step.num}</span>
                                        {step.label}
                                    </span>
                                </span>
                            ))}
                        </nav>
                    </div>
                </header>

                <div className="register-shell">
                    <div>
                        <div className="register-eyebrow">
                            <span className="register-eyebrow-dash" aria-hidden="true" />
                            Workspace onboarding
                        </div>
                        <h1 className="register-title">
                            Create your company <em>workspace</em>.
                        </h1>
                        <p className="register-lede">
                            Establish your organisation&apos;s compliance perimeter in one step. Privacy Cure adapts to Zimbabwean regulatory frameworks
                            and keeps evidence review-ready from day one.
                        </p>

                        <form onSubmit={submit} noValidate>
                            <section className="register-section">
                                <h2 className="register-section-title">
                                    <span className="register-section-mark" aria-hidden="true" />
                                    Organization profile
                                </h2>

                                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
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
                                            <SelectContent className="register-select-content max-h-80">
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
                                            <SelectContent className="register-select-content">
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

                            <section className="register-section">
                                <h2 className="register-section-title">
                                    <span className="register-section-mark is-navy" aria-hidden="true" />
                                    Administrator identity
                                </h2>

                                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
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

                            <div className="register-form-actions">
                                <Link href={route('home')} className="register-back-link">
                                    <ArrowLeft className="size-4" />
                                    Back to home
                                </Link>

                                <button type="submit" disabled={form.processing} className="register-submit">
                                    {form.processing ? (
                                        <>
                                            Creating workspace
                                            <LoaderCircle className="size-4 animate-spin" />
                                        </>
                                    ) : (
                                        <>
                                            Initialize workspace
                                            <ArrowRight className="size-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <p className="register-login-hint">
                            Already have an account?{' '}
                            <Link href={route('login')}>Log in</Link>
                        </p>
                    </div>

                    <aside className="register-aside">
                        <div className="register-aside-backdrop" aria-hidden="true">
                            <div className="register-aside-photo" />
                            <div className="register-aside-overlay" />
                            <div className="register-aside-grain" />
                        </div>

                        <div className="register-aside-content">
                            <div>
                                <div className="register-aside-kicker">
                                    <ShieldCheck size={14} strokeWidth={1.75} />
                                    Privacy by design
                                </div>
                                <h2 className="register-aside-headline">
                                    Compliance, <em>measured</em> with care.
                                </h2>
                                <p className="register-aside-copy">
                                    Your registration creates a pending tenant workspace with its first company administrator account — evidence-ready
                                    from the first artefact onward.
                                </p>
                            </div>

                            <div className="register-milestones">
                                <div className="register-milestones-title">Onboarding milestones</div>
                                <ul>
                                    {milestones.map((item) => (
                                        <li
                                            key={item.title}
                                            className={`register-milestone ${!item.done && !item.current ? 'is-muted' : ''}`}
                                        >
                                            <span
                                                className={`register-milestone-dot ${
                                                    item.done ? '' : item.current ? 'is-current' : 'is-empty'
                                                }`}
                                            >
                                                {item.done ? <Check size={11} strokeWidth={2.5} /> : null}
                                            </span>
                                            <div>
                                                <div className="register-milestone-label">{item.title}</div>
                                                <p className="register-milestone-copy">{item.copy}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>

                <footer className="register-footer">
                    <p className="register-footer-copy">&copy; 2026 Privacy Cure Compliance. All rights reserved.</p>
                    <div className="register-footer-links">
                        <Link href={route('privacy-policy')} className="register-footer-link">
                            Privacy policy
                        </Link>
                        <Link href={route('terms-and-conditions')} className="register-footer-link">
                            Terms
                        </Link>
                        <Link href={route('login')} className="register-footer-link">
                            Log in
                        </Link>
                    </div>
                </footer>
            </div>
        </>
    );
}
