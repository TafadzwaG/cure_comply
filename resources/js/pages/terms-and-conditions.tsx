import MarketingShell from '@/components/marketing-shell';
import { ClipboardCheck, Shield, UserRoundCheck, Workflow } from 'lucide-react';

const termsSections = [
    {
        title: 'Use of the platform',
        body: 'Privacy Cure Compliance is provided as a business software platform for training, compliance tracking, evidence workflows, policy acknowledgment, and related administration. Customers and users must use the platform lawfully and within their assigned permissions.',
        icon: Workflow,
    },
    {
        title: 'Account responsibility',
        body: 'Users are responsible for safeguarding their credentials, using the system only in the tenant and role context assigned to them, and not attempting to bypass access controls, impersonation protections, or tenant boundaries.',
        icon: UserRoundCheck,
    },
    {
        title: 'Customer content',
        body: 'Tenants remain responsible for the files, evidence, policies, and operational records they upload or manage in the platform. They must ensure they have the authority to upload, assign, distribute, and retain that content.',
        icon: ClipboardCheck,
    },
    {
        title: 'Security and suspension',
        body: 'The platform may restrict access, suspend accounts, or deactivate tenant workspaces where security, contractual, operational, or compliance reasons require it. That includes abuse prevention, misconfiguration, non-payment, or material misuse of the service.',
        icon: Shield,
    },
];

export default function TermsAndConditionsPage() {
    return (
        <MarketingShell
            current="terms"
            title="Terms and Conditions | Privacy Cure Compliance"
            description="Public terms and conditions governing the use of Privacy Cure Compliance, tenant workspaces, and user accounts."
        >
            <section className="border-b border-[#c3c6d1]/20 bg-[linear-gradient(180deg,#ffffff_0%,#f2f4f6_100%)] px-6 py-20 dark:border-white/10 dark:bg-[linear-gradient(180deg,#0b2241_0%,#081a33_100%)] lg:px-16 lg:py-28">
                <div className="mx-auto w-full max-w-[1440px]">
                    <div className="max-w-4xl">
                        <div className="inline-flex rounded-full border border-[#00b9ce]/20 bg-[#00daf3]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#004f58] dark:text-[#9cf0ff]">
                            Terms and conditions
                        </div>
                        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#002753] dark:text-white md:text-6xl">
                            The operational rules for using the platform, tenant workspaces, and compliance content.
                        </h1>
                        <p className="mt-6 max-w-3xl text-base leading-8 text-[#434750] dark:text-white/70 md:text-lg">
                            These terms set the general operating conditions for Privacy Cure Compliance. They cover account use, tenant responsibilities,
                            platform restrictions, uploaded content, and the boundaries that keep the service secure and auditable.
                        </p>
                        <p className="mt-4 text-sm leading-7 text-[#434750] dark:text-white/60">Last updated: April 24, 2026</p>
                    </div>
                </div>
            </section>

            <section className="px-6 py-16 lg:px-16 lg:py-24">
                <div className="mx-auto grid w-full max-w-[1440px] gap-6 lg:grid-cols-2">
                    {termsSections.map((section) => {
                        const Icon = section.icon;

                        return (
                            <div key={section.title} className="rounded-2xl border border-[#c3c6d1]/25 bg-white p-8 dark:border-white/10 dark:bg-white/5">
                                <div className="inline-flex rounded-2xl bg-[#002753] p-3 text-white dark:bg-white/10">
                                    <Icon className="size-5" />
                                </div>
                                <h2 className="mt-6 text-2xl font-semibold tracking-tight text-[#002753] dark:text-white">{section.title}</h2>
                                <p className="mt-4 text-sm leading-8 text-[#434750] dark:text-white/65">{section.body}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="border-y border-[#c3c6d1]/20 bg-[#f2f4f6] px-6 py-16 dark:border-white/10 dark:bg-[#0b2241] lg:px-16">
                <div className="mx-auto grid w-full max-w-[1440px] gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00b9ce] dark:text-[#9cf0ff]">Practical interpretation</p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#002753] dark:text-white md:text-5xl">
                            The product is built around permissions, auditability, and role boundaries.
                        </h2>
                    </div>
                    <div className="rounded-2xl border border-[#c3c6d1]/25 bg-white p-8 dark:border-white/10 dark:bg-white/5">
                        <p className="text-sm leading-8 text-[#434750] dark:text-white/65">
                            In practical terms, that means users should only act within the tenant, role, and assignment scope the system gives them.
                            Attempts to access other tenant data, manipulate workflow states improperly, or interfere with private downloads and evidence controls
                            are inconsistent with intended use.
                        </p>
                        <p className="mt-4 text-sm leading-8 text-[#434750] dark:text-white/65">
                            These public terms are a product-level baseline. Commercial agreements, onboarding documents, or enterprise schedules may add more
                            specific obligations for billing, support, implementation, and data handling.
                        </p>
                    </div>
                </div>
            </section>
        </MarketingShell>
    );
}
