import MarketingShell from '@/components/marketing-shell';
import { Database, Eye, LockKeyhole, ShieldCheck } from 'lucide-react';

const sections = [
    {
        title: 'Information we collect',
        body: 'We collect account details, tenant configuration data, invitation and profile data, training records, assessment responses, policy acknowledgments, uploaded evidence, and the operational logs needed to secure and audit the platform.',
        icon: Database,
    },
    {
        title: 'How we use information',
        body: 'We use platform data to provide training, compliance workflows, reporting, notifications, tenant administration, file delivery, policy acknowledgment tracking, and security operations such as monitoring, audit trails, and abuse prevention.',
        icon: Eye,
    },
    {
        title: 'Security and retention',
        body: 'We protect account and tenant data through role-based access controls, authenticated downloads, audit logging, and private storage patterns used across the application. Retention depends on contractual and operational needs, including the need to preserve auditability.',
        icon: LockKeyhole,
    },
    {
        title: 'Your controls',
        body: 'Authenticated users can review and update their own profile information where the product exposes those controls. Tenant administrators and platform administrators can also manage operational data within the permission boundaries of the workspace.',
        icon: ShieldCheck,
    },
];

export default function PrivacyPolicyPage() {
    return (
        <MarketingShell
            current="privacy"
            title="Privacy Policy | Privacy Cure Compliance"
            description="Privacy Cure Compliance public privacy policy for the software platform, tenant workspaces, notifications, and compliance workflows."
        >
            <section className="border-b border-[#c3c6d1]/20 bg-[linear-gradient(180deg,#ffffff_0%,#f2f4f6_100%)] px-6 py-20 dark:border-white/10 dark:bg-[linear-gradient(180deg,#0b2241_0%,#081a33_100%)] lg:px-16 lg:py-28">
                <div className="mx-auto w-full max-w-[1440px]">
                    <div className="max-w-4xl">
                        <div className="inline-flex rounded-full border border-[#00b9ce]/20 bg-[#00daf3]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#004f58] dark:text-[#9cf0ff]">
                            Privacy policy
                        </div>
                        <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#002753] dark:text-white md:text-6xl">
                            How Privacy Cure handles account, tenant, workflow, and compliance data.
                        </h1>
                        <p className="mt-6 max-w-3xl text-base leading-8 text-[#434750] dark:text-white/70 md:text-lg">
                            This page explains the broad platform-level privacy position for Privacy Cure Compliance. It covers the software,
                            authenticated workspaces, notifications, training records, submissions, evidence files, and policy workflows that run inside the system.
                        </p>
                        <p className="mt-4 text-sm leading-7 text-[#434750] dark:text-white/60">Last updated: April 24, 2026</p>
                    </div>
                </div>
            </section>

            <section className="px-6 py-16 lg:px-16 lg:py-24">
                <div className="mx-auto grid w-full max-w-[1440px] gap-6 lg:grid-cols-2">
                    {sections.map((section) => {
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
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00b9ce] dark:text-[#9cf0ff]">Platform notes</p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#002753] dark:text-white md:text-5xl">
                            Tenant data, auditability, and Zimbabwe compliance context.
                        </h2>
                    </div>
                    <div className="rounded-2xl border border-[#c3c6d1]/25 bg-white p-8 dark:border-white/10 dark:bg-white/5">
                        <p className="text-sm leading-8 text-[#434750] dark:text-white/65">
                            Privacy Cure is built for regulated operational workflows. That means the product deliberately stores enough history to prove who
                            did what, when they did it, and what changed. Audit logs, notification trails, submission states, evidence reviews, and policy acknowledgments
                            are part of the core compliance record rather than optional metadata.
                        </p>
                        <p className="mt-4 text-sm leading-8 text-[#434750] dark:text-white/65">
                            Where a tenant operates in Zimbabwe, platform usage may also intersect with obligations under the Cyber and Data Protection Act [Chapter 12:07],
                            internal company policies, and sector-specific regulatory expectations.
                        </p>
                    </div>
                </div>
            </section>
        </MarketingShell>
    );
}
