import privacyCureLogo from '@/images/privacycure-logo.png';
import { type SharedData } from '@/types';
import { BarChart3, BellRing, BookOpen, Building2, CheckCircle2, ClipboardCheck, CloudUpload, FileSpreadsheet, FileText, FolderCog, Gauge, GraduationCap, LayoutGrid, ShieldCheck, Sparkles, User, UserCog, UserPlus, UsersRound, Waypoints, Workflow } from 'lucide-react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Privacy Cure Compliance | The Architectural Sanctuary for Security">
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
                <style>{`
                    .material-symbols-outlined {
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                    .editorial-shadow {
                        box-shadow: 0 24px 48px -12px rgba(0, 39, 83, 0.06);
                    }
                    .glass-header {
                        background: rgba(247, 249, 251, 0.8);
                        backdrop-filter: blur(20px);
                    }
                    .font-headline {
                        font-family: 'Plus Jakarta Sans', sans-serif;
                    }
                    .font-body, .font-label {
                        font-family: 'Inter', sans-serif;
                    }
                `}</style>
            </Head>

            <div className="scroll-smooth bg-[#f7f9fb] font-body text-[#191c1e] selection:bg-[#9cf0ff] selection:text-[#001f24] dark:bg-[#f7f9fb] dark:text-[#191c1e]">
                <header className="glass-header sticky top-0 z-50 border-b border-[#c3c6d1]/10 px-6 py-4 lg:px-20">
                    <div className="mx-auto flex max-w-[96rem] items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={privacyCureLogo} alt="Privacy Cure Compliance" className="h-10 w-auto" />
                            <h2 className="font-headline text-xl font-bold tracking-tight text-[#002753]">Privacy Cure Compliance</h2>
                        </div>

                        <nav className="hidden items-center gap-10 lg:flex">
                            <a className="text-sm font-semibold text-[#434750] transition-colors hover:text-[#002753]" href="#product">
                                Product
                            </a>
                            <a className="text-sm font-semibold text-[#434750] transition-colors hover:text-[#002753]" href="#solutions">
                                Solutions
                            </a>
                            <a className="text-sm font-semibold text-[#434750] transition-colors hover:text-[#002753]" href="#pricing">
                                Pricing
                            </a>
                            <a className="text-sm font-semibold text-[#434750] transition-colors hover:text-[#002753]" href="#resources">
                                Resources
                            </a>
                        </nav>

                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="hidden text-sm font-bold text-[#002753] lg:block">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href={route('login')} className="hidden text-sm font-bold text-[#002753] lg:block">
                                    Log in
                                </Link>
                            )}

                            <Link
                                href={auth.user ? route('dashboard') : route('register')}
                                className="rounded-full bg-[#083d77] px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                            >
                                {auth.user ? 'Open dashboard' : 'Create tenant workspace'}
                            </Link>
                        </div>
                    </div>
                </header>

                <main>
                    <section className="relative overflow-hidden px-6 py-20 lg:px-20 lg:py-32">
                        <div className="mx-auto max-w-[96rem]">
                            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                                <div className="flex flex-col gap-8">
                                    <span className="w-fit rounded-full bg-[#9cf0ff] px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-[#001f24]">
                                        Modern Security Operations
                                    </span>
                                    <h1 className="font-headline text-5xl font-extrabold leading-[1.1] tracking-tight text-[#002753] lg:text-7xl">
                                        Privacy Cure Compliance helps companies run training and evidence review in one system.
                                    </h1>
                                    <p className="max-w-xl text-lg leading-relaxed text-[#434750]">
                                        Move from fragmented spreadsheets to a structured platform designed for modern security and compliance needs.
                                        Automate evidence collection and verify readiness in real-time.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <Link
                                            href={auth.user ? route('dashboard') : route('register')}
                                            className="rounded-full bg-[#083d77] px-8 py-4 text-base font-bold text-white shadow-xl transition-all hover:bg-[#002753]"
                                        >
                                            {auth.user ? 'Open dashboard' : 'Create tenant workspace'}
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="rounded-full bg-[#e6e8ea] px-8 py-4 text-base font-bold text-[#002753] transition-all hover:bg-[#e0e3e5]"
                                        >
                                            Schedule a demo
                                        </Link>
                                    </div>
                                </div>

                                <div className="editorial-shadow relative rounded-2xl bg-[#f2f4f6] p-8 lg:p-12">
                                    <div className="flex flex-col gap-10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-label text-xs font-bold uppercase tracking-widest text-[#434750]">Live Pulse</p>
                                                <h3 className="font-headline text-3xl font-bold text-[#002753]">Global Health</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-headline text-5xl font-black text-[#00b9ce]">82%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            <MetricBar label="Training Readiness" value="76%" width="76%" fillClass="bg-[#00daf3]" />
                                            <MetricBar label="Evidence Approval" value="68%" width="68%" fillClass="bg-[#083d77]" />
                                            <MetricBar label="Submission Completion" value="91%" width="91%" fillClass="bg-[#00b9ce]" />
                                        </div>
                                    </div>
                                    <div className="absolute -top-20 -right-20 -z-10 h-64 w-64 rounded-full bg-[#d6e3ff] opacity-20 blur-3xl"></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-[#f2f4f6] px-6 py-20 lg:px-20">
                        <div className="mx-auto max-w-[96rem]">
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-8">
                                <StatCard label="Interfaces" value="4" detail="Role-specific dashboards" icon={<LayoutGrid className="size-5" />} />
                                <StatCard label="Capabilities" value="10+" detail="Core system modules" icon={<Building2 className="size-5" />} />
                                <StatCard label="Reporting" value="2" detail="Deep export formats" icon={<FileSpreadsheet className="size-5" />} />
                                <StatCard label="Access" value="1 click" detail="Support control toggle" icon={<ShieldCheck className="size-5" />} />
                            </div>
                        </div>
                    </section>

                    <section className="px-6 py-24 lg:px-20 lg:py-40">
                        <div className="mx-auto max-w-[96rem]">
                            <div className="mb-20 max-w-2xl">
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d6e3ff] text-[#083d77]">
                                    <Waypoints className="size-6" />
                                </div>
                                <h2 className="font-headline text-4xl font-bold tracking-tight text-[#002753]">The Architecture of Trust</h2>
                                <p className="mt-4 text-lg text-[#434750]">
                                    A modular platform designed to scale with your organization's security and privacy maturity.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
                                <PillarCard icon={<Building2 className="size-7" />} iconClass="bg-[#002753] text-white" title="Tenant Workspaces" description="Dedicated environments with isolated data and specific security protocols for every business unit." />
                                <PillarCard icon={<GraduationCap className="size-7" />} iconClass="bg-[#00daf3] text-[#002753]" title="Training Delivery" description="Automated assignment of privacy modules with built-in assessments and certificates." />
                                <PillarCard icon={<ClipboardCheck className="size-7" />} iconClass="bg-[#00b9ce] text-white" title="Compliance Execution" description="Centralized evidence repository with automated review cycles and approval workflows." />
                                <PillarCard icon={<BarChart3 className="size-7" />} iconClass="bg-[#083d77] text-white" title="Executive Reporting" description="High-level transparency for board members with real-time scoring and gap analysis." />
                            </div>
                        </div>
                    </section>

                    <section className="relative overflow-hidden bg-[#002753] px-6 py-24 text-white lg:px-20 lg:py-40">
                        <div className="mx-auto max-w-[96rem]">
                            <div className="mb-20 text-center">
                                <div className="mb-6 flex justify-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00daf3] text-[#002753]">
                                        <Workflow className="size-6" />
                                    </div>
                                </div>
                                <h2 className="font-headline text-4xl font-bold lg:text-5xl">The End-to-End Workflow</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                                <WorkflowCard number="01" icon={<UserPlus className="size-6" />} title="Register" description="Onboard employees and entities into the secure workspace with ease." />
                                <WorkflowCard number="02" icon={<BookOpen className="size-6" />} title="Train" description="Deploy role-specific training modules to ensure organizational alignment." />
                                <WorkflowCard number="03" icon={<CloudUpload className="size-6" />} title="Collect/Review" description="Upload evidence files and initiate stakeholder review protocols." />
                                <WorkflowCard number="04" icon={<FolderCog className="size-6" />} title="Score/Export" description="Generate compliance scores and audit-ready reports in one click." />
                            </div>
                        </div>
                        <div
                            className="pointer-events-none absolute inset-0 -z-10 opacity-10"
                            style={{
                                backgroundImage:
                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBvpC80B1svGhiLu622jsqhz6foVHto3fly9S_bIrUw9e8Uoh4O6bJV5z7BNMvfHn7Wskr7_hIghFGLuWu3vFK1saWugq2mypupOWy-uKzuWbhXEvbNVwRxAzBGewmqtFqbHQBlW9x9H-37nCb-MooKSmdi3quLNcpQm9jarXBsUC7M6Aw89h8W_GFegRXk8mpqaMRCp1gklwUSZYYhMxVWMEdeGi_Ol_WpqaSClIfZHBswq1pXJuXWWh7iO7gcCxwDuu1l9qXrUGU')",
                            }}
                        />
                    </section>

                    <section className="px-6 py-24 lg:px-20 lg:py-40">
                        <div className="mx-auto max-w-[96rem]">
                            <div className="mb-20 grid grid-cols-1 items-end gap-8 lg:grid-cols-2">
                                <div className="flex flex-col gap-6">
                                    <span className="w-fit rounded-full bg-[#e7deff] px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1d1637]">
                                        Personalized Experience
                                    </span>
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d6e3ff] text-[#083d77]">
                                        <Sparkles className="size-6" />
                                    </div>
                                    <h2 className="font-headline text-4xl font-bold text-[#002753]">Dashboard Design System</h2>
                                    <p className="text-lg text-[#434750]">
                                        Every role has its own architectural sanctuary. No clutter, just the data you need to act.
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                                <RoleWorkspaceCard icon={<ShieldCheck className="size-6" />} title="Super Admin" description="Global oversight, workspace creation, and security policy management." points={['Entity Hierarchy', 'Audit Logs']} />
                                <RoleWorkspaceCard icon={<UserCog className="size-6" />} title="Company Admin" description="Training assignments and entity-level compliance tracking." points={['Team Performance', 'Deadline Alerts']} />
                                <RoleWorkspaceCard icon={<UsersRound className="size-6" />} title="Reviewer" description="Verification of evidence files and compliance score calculation." points={['Queue Management', 'Evidence Approval']} />
                                <RoleWorkspaceCard icon={<User className="size-6" />} title="Employee" description="Access to assigned training and simple evidence upload portal." points={['My Certificates', 'Task Inbox']} />
                            </div>
                        </div>
                    </section>

                    <section className="bg-[#f2f4f6] px-6 py-24 lg:px-20 lg:py-40">
                        <div className="mx-auto max-w-[96rem]">
                            <div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
                                <div className="flex flex-col justify-center">
                                    <h2 className="font-headline text-4xl font-bold text-[#002753] lg:text-5xl">Reporting Built for Regulators</h2>
                                    <p className="mt-6 text-lg leading-relaxed text-[#434750]">
                                        Don't just be compliant. Prove it with institutional-grade reports that leave no room for doubt.
                                    </p>
                                    <div className="mt-12 space-y-6">
                                        <ReportItem icon={<FileText className="size-5" />} title="Employee Training Log" description="Detailed history of completions, scores, and timestamped certificates." />
                                        <ReportItem icon={<Gauge className="size-5" />} title="Test Performance Reports" description="Deep dive into knowledge gaps and module efficacy across entities." />
                                        <ReportItem icon={<FileSpreadsheet className="size-5" />} title="Compliance Summary" description="Aggregated global scores suitable for board meetings and stakeholder updates." />
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="editorial-shadow rounded-2xl bg-white p-6">
                                        <img
                                            alt="Analytics Dashboard"
                                            className="rounded-xl border border-[#c3c6d1]/10 shadow-sm"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjmMKzO_nc5jtgWVfCwdLM9B_gpWtFAk-4NUyPEv1_mZ9mElQEBu_hf4VeYpFRPCkPp895dPZOQWLOzIh0d4yqEz3eCAv5dxJfeiJv1NkcUBN8Wj4wxOAASxOsbqxYSvaMWpg3idKRB6a07pQRYPOJ4_XCw0urT7eHPhq061gU8dGDqFujbg_2yF-AlrusoLBaYAqona33trpecJy0l4AAI-aasABxjsCsuH2X6J8qINXytgdMXCyMsHe7BnVyhIXYeR1n7HDQuK8"
                                        />
                                    </div>
                                    <div className="editorial-shadow absolute -bottom-10 -left-10 hidden w-64 rounded-2xl bg-[#002753] p-8 text-white lg:block">
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className="material-symbols-outlined text-[#00daf3]">verified</span>
                                            <span className="text-xs font-bold opacity-60">SYSTEM STATUS</span>
                                        </div>
                                        <p className="text-sm font-medium">
                                            Platform currently tracking 450+ compliance controls across 12 countries.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="px-6 py-24 lg:px-20 lg:py-40">
                        <div className="editorial-shadow relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-[#083d77] p-12 text-center text-white lg:p-24">
                            <div className="relative z-10 flex flex-col items-center gap-8">
                                <h2 className="font-headline text-4xl font-bold lg:text-6xl">Ready to secure your workspace?</h2>
                                <p className="max-w-2xl text-lg text-[#d6e3ff] opacity-90">
                                    Join the architectural sanctuary of modern compliance. Setup takes less than 10 minutes.
                                </p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <Link
                                        href={auth.user ? route('dashboard') : route('register')}
                                        className="rounded-full bg-[#00daf3] px-10 py-5 text-lg font-bold text-[#002753] shadow-xl transition-transform hover:scale-105"
                                    >
                                        {auth.user ? 'Open dashboard' : 'Create tenant workspace'}
                                    </Link>
                                </div>
                            </div>
                            <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-[#00b9ce] opacity-20 blur-3xl"></div>
                        </div>
                    </section>
                </main>

                <footer className="bg-white px-6 py-12 lg:px-20">
                    <div className="mx-auto max-w-[96rem]">
                        <div className="flex flex-col items-center justify-between gap-8 border-t border-[#c3c6d1]/10 pt-12 md:flex-row">
                            <div className="flex items-center gap-3">
                                <img src={privacyCureLogo} alt="Privacy Cure Compliance" className="h-8 w-auto" />
                                <h2 className="font-headline text-lg font-bold text-[#002753]">Privacy Cure Compliance</h2>
                            </div>
                            <div className="flex gap-8">
                                <a className="text-xs font-bold uppercase tracking-widest text-[#434750] transition-colors hover:text-[#002753]" href="#">
                                    Privacy Policy
                                </a>
                                <a className="text-xs font-bold uppercase tracking-widest text-[#434750] transition-colors hover:text-[#002753]" href="#">
                                    Terms of Service
                                </a>
                                <a className="text-xs font-bold uppercase tracking-widest text-[#434750] transition-colors hover:text-[#002753]" href="#">
                                    Support
                                </a>
                            </div>
                            <p className="text-sm text-[#434750]">© 2026 Privacy Cure Compliance. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

function MetricBar({
    label,
    value,
    width,
    fillClass,
}: {
    label: string;
    value: string;
    width: string;
    fillClass: string;
}) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between text-sm font-semibold">
                <span className="text-[#002753]">{label}</span>
                <span className="text-[#434750]">{value}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#e6e8ea]">
                <div className={`h-full rounded-full ${fillClass}`} style={{ width }} />
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    detail,
    icon,
}: {
    label: string;
    value: string;
    detail: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="editorial-shadow rounded-2xl bg-white p-8 transition-transform hover:-translate-y-2">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d6e3ff] text-[#083d77]">
                {icon}
            </div>
            <p className="mb-2 font-label text-xs font-bold uppercase tracking-widest text-[#434750]">{label}</p>
            <h4 className="font-headline text-4xl font-extrabold text-[#002753]">{value}</h4>
            <p className="mt-2 text-sm text-[#434750]">{detail}</p>
        </div>
    );
}

function PillarCard({
    icon,
    iconClass,
    title,
    description,
}: {
    icon: React.ReactNode;
    iconClass: string;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col gap-6">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconClass}`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-[#002753]">{title}</h3>
            <p className="leading-relaxed text-[#434750]">{description}</p>
        </div>
    );
}

function WorkflowCard({
    number,
    icon,
    title,
    description,
}: {
    number: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="group relative rounded-2xl bg-[#083d77] p-10 transition-all hover:bg-[#194781]">
            <span className="font-headline absolute top-8 right-8 text-6xl font-black opacity-10 group-hover:opacity-20">{number}</span>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#00daf3] text-[#002753]">
                {icon}
            </div>
            <h4 className="mb-3 text-xl font-bold">{title}</h4>
            <p className="text-[#d6e3ff] opacity-80">{description}</p>
        </div>
    );
}

function RoleWorkspaceCard({
    icon,
    title,
    description,
    points,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    points: string[];
}) {
    return (
        <div className="group editorial-shadow flex flex-col gap-6 rounded-2xl bg-[#eceef0] p-8 transition-all hover:bg-[#e6e8ea]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#083d77] text-white">
                {icon}
            </div>
            <div>
                <h4 className="text-lg font-bold text-[#002753]">{title}</h4>
                <p className="mt-2 text-sm text-[#434750]">{description}</p>
            </div>
            <hr className="border-[#c3c6d1]/20" />
            <ul className="space-y-3 text-sm font-medium text-[#002753]">
                {points.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                        <CheckCircle2 className="size-4" />
                        {point}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ReportItem({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00b9ce]/10 text-[#00b9ce]">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-[#002753]">{title}</h4>
                <p className="text-sm text-[#434750]">{description}</p>
            </div>
        </div>
    );
}
