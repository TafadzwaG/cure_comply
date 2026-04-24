import MarketingShell from '@/components/marketing-shell';
import { BadgeCheck, Building2, CheckCircle2, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';

const plans = [
    {
        name: 'Starter',
        price: '$59',
        annual: '$590/year',
        audience: 'Up to 15 users',
        badge: 'Zimbabwe-ready',
        summary: 'For small teams replacing spreadsheets with one structured compliance workspace.',
        features: [
            '1 tenant workspace',
            'Training, tests, and submissions',
            'Evidence uploads and review trail',
            'Core dashboards and exports',
            'Email support',
        ],
    },
    {
        name: 'Growth',
        price: '$169',
        annual: '$1,690/year',
        audience: 'Up to 75 users',
        badge: 'Most practical',
        summary: 'For growing Zimbabwean companies that need operational oversight, reminders, and audit readiness.',
        features: [
            'Everything in Starter',
            'Advanced role dashboards',
            'Policy acknowledgments and reminders',
            'Branded tenant workspace',
            'Priority support and onboarding help',
        ],
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        annual: 'Multi-site pricing',
        audience: '75+ users or multi-entity groups',
        badge: 'Scale',
        summary: 'For regulators, groups, and large operations that need custom controls, onboarding, and support.',
        features: [
            'Everything in Growth',
            'Custom onboarding and migration',
            'Multi-tenant rollout support',
            'Dedicated account management',
            'Commercial SLA options',
        ],
    },
];

const benchmarks = [
    {
        title: 'ERP baseline',
        value: '$29 to $59/mo',
        description: 'Small-business cloud ERP pricing currently published for Zimbabwe.',
    },
    {
        title: 'Payroll/compliance baseline',
        value: '$50 to $200/mo',
        description: 'Zimbabwe payroll and compliance automation pricing for SMEs.',
    },
    {
        title: 'Per-user software reference',
        value: '$13.60/user/mo',
        description: 'A current Zimbabwe per-user enterprise SaaS reference point.',
    },
];

const faqItems = [
    {
        question: 'What currency do you bill in?',
        answer: 'The public pricing is framed in USD because that remains the clearest benchmark for Zimbabwean business software procurement and budgeting.',
    },
    {
        question: 'Can we start small and upgrade later?',
        answer: 'Yes. The plans are designed so a tenant can start with a smaller user band, then move into Growth or Enterprise as staff, frameworks, and reporting requirements expand.',
    },
    {
        question: 'Do you charge separately for submissions, tests, and training?',
        answer: 'No. The platform packages the core compliance workflow together. The main pricing variable is workspace scale and support depth rather than nickel-and-diming each module.',
    },
];

export default function PricingPage() {
    return (
        <MarketingShell
            current="pricing"
            title="Pricing | Privacy Cure Compliance"
            description="Zimbabwe-benchmarked pricing for training, compliance workflows, evidence review, and role-based workspaces."
        >
            <section className="border-b border-[#c3c6d1]/20 bg-[radial-gradient(circle_at_top_right,_rgba(0,218,243,0.15),_transparent_30%),linear-gradient(180deg,#ffffff_0%,#f2f4f6_100%)] px-6 py-20 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_right,_rgba(0,218,243,0.15),_transparent_30%),linear-gradient(180deg,#0b2241_0%,#081a33_100%)] lg:px-16 lg:py-28">
                <div className="mx-auto grid w-full max-w-[1440px] gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#00b9ce]/20 bg-[#00daf3]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#004f58] dark:border-[#00daf3]/20 dark:bg-[#00daf3]/10 dark:text-[#9cf0ff]">
                            <Sparkles className="size-3.5" />
                            Zimbabwe pricing
                        </div>
                        <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-[#002753] dark:text-white md:text-6xl">
                            Pricing built for the Zimbabwean market, without splitting the core compliance workflow into add-ons.
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-8 text-[#434750] dark:text-white/70 md:text-lg">
                            The plan structure is benchmarked against current Zimbabwe cloud software pricing and packaged around how
                            local teams actually buy software: predictable USD billing, clear user bands, and a practical path from one
                            company workspace to a larger operational rollout.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                        {benchmarks.map((benchmark) => (
                            <div
                                key={benchmark.title}
                                className="rounded-2xl border border-[#c3c6d1]/25 bg-white/90 p-6 shadow-[0_20px_50px_-30px_rgba(0,39,83,0.3)] dark:border-white/10 dark:bg-white/5"
                            >
                                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00b9ce] dark:text-[#9cf0ff]">
                                    {benchmark.title}
                                </div>
                                <div className="mt-3 text-3xl font-semibold tracking-tight text-[#002753] dark:text-white">{benchmark.value}</div>
                                <p className="mt-3 text-sm leading-7 text-[#434750] dark:text-white/65">{benchmark.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-6 py-16 lg:px-16 lg:py-24">
                <div className="mx-auto w-full max-w-[1440px]">
                    <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00b9ce] dark:text-[#9cf0ff]">
                                Public plans
                            </p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#002753] dark:text-white md:text-5xl">
                                Clear tiers. USD billing. Two months free on annual.
                            </h2>
                        </div>
                        <p className="max-w-xl text-sm leading-7 text-[#434750] dark:text-white/65">
                            These plans are positioned against local ERP, payroll, and compliance tooling already priced in Zimbabwe.
                            If your rollout spans multiple entities or needs custom approval workflows, Enterprise is the right route.
                        </p>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-3">
                        {plans.map((plan, index) => (
                            <div
                                key={plan.name}
                                className={`rounded-2xl border p-8 shadow-[0_24px_60px_-36px_rgba(0,39,83,0.3)] ${
                                    index === 1
                                        ? 'border-[#083d77]/20 bg-[#002753] text-white'
                                        : 'border-[#c3c6d1]/25 bg-white text-[#191c1e] dark:border-white/10 dark:bg-white/5 dark:text-white'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-inherit/80">
                                        {index === 0 && <ShieldCheck className="size-3.5" />}
                                        {index === 1 && <UsersRound className="size-3.5" />}
                                        {index === 2 && <Building2 className="size-3.5" />}
                                        {plan.badge}
                                    </div>
                                    {index === 1 && (
                                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9cf0ff]">
                                            <BadgeCheck className="size-3.5" />
                                            Recommended
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-2xl font-semibold tracking-tight">{plan.name}</h3>
                                    <div className="mt-4 flex items-end gap-2">
                                        <span className="text-5xl font-semibold tracking-[-0.04em]">{plan.price}</span>
                                        {plan.price !== 'Custom' && <span className="pb-2 text-sm font-medium opacity-70">/month</span>}
                                    </div>
                                    <p className="mt-2 text-sm font-medium opacity-70">{plan.annual}</p>
                                    <p className="mt-4 text-sm font-medium opacity-80">{plan.audience}</p>
                                    <p className="mt-4 text-sm leading-7 opacity-80">{plan.summary}</p>
                                </div>

                                <div className="mt-8 space-y-3">
                                    {plan.features.map((feature) => (
                                        <div key={feature} className="flex items-start gap-3 text-sm leading-6">
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#00b9ce] dark:text-[#00daf3]" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <a
                                    href={plan.name === 'Enterprise' ? route('resources') : route('register')}
                                    className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.01] ${
                                        index === 1
                                            ? 'bg-[#00daf3] text-[#002753]'
                                            : 'bg-[#002753] text-white dark:bg-white dark:text-[#002753]'
                                    }`}
                                >
                                    {plan.name === 'Enterprise' ? 'View rollout options' : 'Start with this plan'}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-y border-[#c3c6d1]/20 bg-[#f2f4f6] px-6 py-16 dark:border-white/10 dark:bg-[#0b2241] lg:px-16">
                <div className="mx-auto grid w-full max-w-[1440px] gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00b9ce] dark:text-[#9cf0ff]">
                            Packaging logic
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#002753] dark:text-white md:text-5xl">
                            Why these numbers fit the market.
                        </h2>
                    </div>
                    <div className="rounded-2xl border border-[#c3c6d1]/25 bg-white p-8 dark:border-white/10 dark:bg-white/5">
                        <p className="text-base leading-8 text-[#434750] dark:text-white/70">
                            Small Zimbabwe business software plans commonly start around the lower double digits per month, while
                            payroll and more compliance-heavy systems quickly move into the $50 to $200 range once the team size and
                            workflows grow. Privacy Cure is positioned above basic record-keeping tools and below heavy consulting-led
                            enterprise programmes, which is why the public tiers focus on workspace value rather than raw per-feature billing.
                        </p>
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
                            Commercial questions, answered directly.
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
