import MarketingShell from '@/components/marketing-shell';
import { ArrowUpRight, BookOpen, FileCheck2, FileText, GraduationCap, Shield, Sparkles } from 'lucide-react';

const featuredResources = [
    {
        title: 'Cyber and Data Protection Act [Chapter 12:07]',
        description: 'The core Zimbabwe law governing data protection, cyber security, and controller responsibilities.',
        source: 'ICT Ministry PDF',
        href: 'https://ictministry.gov.zw/assets/documents/Cyber-and-Data-Protection-Act-Chapter-1207.pdf',
        icon: Shield,
    },
    {
        title: 'Cyber and Data Protection Act on ZimLII',
        description: 'Browsable legal text for clause-by-clause reading, citation, and policy drafting.',
        source: 'ZimLII',
        href: 'https://zimlii.org/akn/zw/act/2021/5',
        icon: BookOpen,
    },
    {
        title: 'POTRAZ baseline assessment of Zimbabwean enterprises',
        description: 'A regulator-backed baseline study highlighting data protection maturity gaps across Zimbabwean organisations.',
        source: 'POTRAZ',
        href: 'https://www.potraz.gov.zw/wp-content/uploads/2024/04/Cyber-Data-Protection-Baseline-Assessment-of-Zimbabwean-Enterprises-2023.pdf',
        icon: FileCheck2,
    },
];

const platformResources = [
    {
        title: 'Submission evidence checklist',
        description: 'Build evidence packs that match sections, question codes, and reviewer expectations before submission.',
        icon: FileText,
    },
    {
        title: 'Employee privacy training track',
        description: 'Package staff onboarding, assessments, and policy acknowledgments into one repeatable training flow.',
        icon: GraduationCap,
    },
    {
        title: 'Policy rollout starter pack',
        description: 'Publish a policy, assign it by user or department, and track who has opened and acknowledged it.',
        icon: Sparkles,
    },
];

const faqItems = [
    {
        question: 'Are these resources Zimbabwe-specific?',
        answer: 'Yes. The featured legal and regulatory references are framed around Zimbabwe’s Cyber and Data Protection environment, with operational resources designed to help local teams apply those requirements inside the platform.',
    },
    {
        question: 'Can tenant users access these materials after signing in?',
        answer: 'Yes. The authenticated file library and policy modules are designed to carry this further by letting teams keep shared documents, assign policies, and track acknowledgments inside the app.',
    },
    {
        question: 'Will the resources page stay static?',
        answer: 'No. It is structured as a public-facing library page so you can keep expanding it with guides, legal updates, templates, and practical compliance playbooks over time.',
    },
];

export default function ResourcesPage() {
    return (
        <MarketingShell
            current="resources"
            title="Resources | Privacy Cure Compliance"
            description="Zimbabwe-focused compliance resources, legal references, and operational guides for privacy, evidence, training, and policy workflows."
        >
            <section className="border-b border-[#c3c6d1]/20 bg-[radial-gradient(circle_at_top_left,_rgba(0,218,243,0.16),_transparent_28%),linear-gradient(180deg,#ffffff_0%,#f2f4f6_100%)] px-6 py-20 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(0,218,243,0.16),_transparent_28%),linear-gradient(180deg,#0b2241_0%,#081a33_100%)] lg:px-16 lg:py-28">
                <div className="mx-auto grid w-full max-w-[1440px] gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#00b9ce]/20 bg-[#00daf3]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#004f58] dark:border-[#00daf3]/20 dark:bg-[#00daf3]/10 dark:text-[#9cf0ff]">
                            <Sparkles className="size-3.5" />
                            Zimbabwe resources
                        </div>
                        <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-[#002753] dark:text-white md:text-6xl">
                            Practical compliance resources for Zimbabwe, not just generic privacy theory.
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-8 text-[#434750] dark:text-white/70 md:text-lg">
                            Use this page as the public front door to the regulatory references, operating checklists, and workflow guides
                            that matter to Zimbabwean teams managing training, evidence, submissions, and policy acknowledgment.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#c3c6d1]/25 bg-white p-8 shadow-[0_24px_60px_-36px_rgba(0,39,83,0.3)] dark:border-white/10 dark:bg-white/5">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00b9ce] dark:text-[#9cf0ff]">
                            What this page covers
                        </div>
                        <div className="mt-6 space-y-4">
                            {[
                                'Zimbabwe legal and regulatory references',
                                'Operational checklists for submissions and evidence',
                                'Starter templates for policy and training rollouts',
                                'A public content layer that can grow into a fuller resource library',
                            ].map((item) => (
                                <div key={item} className="flex items-start gap-3 text-sm leading-7 text-[#434750] dark:text-white/70">
                                    <FileCheck2 className="mt-1 size-4 shrink-0 text-[#00b9ce] dark:text-[#00daf3]" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-6 py-16 lg:px-16 lg:py-24">
                <div className="mx-auto w-full max-w-[1440px]">
                    <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00b9ce] dark:text-[#9cf0ff]">
                                Featured reading
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#002753] dark:text-white md:text-5xl">
                                Start with the regulatory source material.
                            </h2>
                        </div>
                        <p className="max-w-xl text-sm leading-7 text-[#434750] dark:text-white/65">
                            These links ground the public resources page in the actual Zimbabwe environment instead of abstract global guidance.
                        </p>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-3">
                        {featuredResources.map((resource) => {
                            const Icon = resource.icon;

                            return (
                                <a
                                    key={resource.title}
                                    href={resource.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group rounded-2xl border border-[#c3c6d1]/25 bg-white p-8 shadow-[0_24px_60px_-36px_rgba(0,39,83,0.28)] transition-transform hover:-translate-y-1 dark:border-white/10 dark:bg-white/5"
                                >
                                    <div className="inline-flex rounded-2xl bg-[#002753] p-3 text-white dark:bg-white/10">
                                        <Icon className="size-5" />
                                    </div>
                                    <div className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00b9ce] dark:text-[#9cf0ff]">
                                        {resource.source}
                                    </div>
                                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#002753] dark:text-white">
                                        {resource.title}
                                    </h3>
                                    <p className="mt-4 text-sm leading-7 text-[#434750] dark:text-white/65">{resource.description}</p>
                                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#002753] dark:text-white">
                                        Open resource
                                        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="border-y border-[#c3c6d1]/20 bg-[#f2f4f6] px-6 py-16 dark:border-white/10 dark:bg-[#0b2241] lg:px-16 lg:py-24">
                <div className="mx-auto w-full max-w-[1440px]">
                    <div className="mb-10">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00b9ce] dark:text-[#9cf0ff]">
                            In-platform guides
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#002753] dark:text-white md:text-5xl">
                            Pair the law with operational playbooks.
                        </h2>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {platformResources.map((resource) => {
                            const Icon = resource.icon;

                            return (
                                <div
                                    key={resource.title}
                                    className="rounded-2xl border border-[#c3c6d1]/25 bg-white p-8 dark:border-white/10 dark:bg-white/5"
                                >
                                    <div className="inline-flex rounded-2xl bg-[#083d77] p-3 text-white dark:bg-white/10">
                                        <Icon className="size-5" />
                                    </div>
                                    <h3 className="mt-6 text-xl font-semibold tracking-tight text-[#002753] dark:text-white">{resource.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-[#434750] dark:text-white/65">{resource.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section id="faq" className="px-6 py-16 lg:px-16 lg:py-24">
                <div className="mx-auto w-full max-w-[1440px]">
                    <div className="mb-10">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00b9ce] dark:text-[#9cf0ff]">
                            FAQ
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#002753] dark:text-white md:text-5xl">
                            Resource strategy, clarified.
                        </h2>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {faqItems.map((item) => (
                            <div
                                key={item.question}
                                className="rounded-2xl border border-[#c3c6d1]/25 bg-white p-6 dark:border-white/10 dark:bg-white/5"
                            >
                                <h3 className="text-lg font-semibold tracking-tight text-[#002753] dark:text-white">{item.question}</h3>
                                <p className="mt-3 text-sm leading-7 text-[#434750] dark:text-white/65">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </MarketingShell>
    );
}
