import privacyCureLogo from '@/images/privacycure-logo.png';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, LogIn } from 'lucide-react';
import type { PropsWithChildren } from 'react';

type MarketingShellProps = PropsWithChildren<{
    title: string;
    description: string;
    current: 'home' | 'pricing' | 'resources' | 'privacy' | 'terms';
}>;

const navItems = [
    { label: 'Product', href: `${route('home')}#product`, key: 'product', type: 'anchor' as const },
    { label: 'Solutions', href: `${route('home')}#solutions`, key: 'solutions', type: 'anchor' as const },
    { label: 'Pricing', href: route('pricing'), key: 'pricing', type: 'route' as const },
    { label: 'Resources', href: route('resources'), key: 'resources', type: 'route' as const },
];

export default function MarketingShell({ title, description, current, children }: MarketingShellProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const currentUrl = page.url.split('#')[0];

    return (
        <>
            <Head title={title}>
                <meta name="description" content={description} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
                <style>{`
                    @keyframes marketingPageEnter {
                        from {
                            opacity: 0;
                            transform: translateY(18px);
                            filter: blur(8px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                            filter: blur(0);
                        }
                    }

                    .marketing-page-enter {
                        animation: marketingPageEnter 420ms cubic-bezier(0.16, 1, 0.3, 1);
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .marketing-page-enter {
                            animation: none;
                        }
                    }
                `}</style>
            </Head>

            <div
                className="min-h-screen bg-[#f7f9fb] text-[#191c1e] dark:bg-[#081a33] dark:text-white"
                style={{ fontFamily: "'Rubik', Arial, Helvetica, sans-serif" }}
            >
                <header className="sticky top-0 z-40 border-b border-[#c3c6d1]/30 bg-[#f7f9fb]/90 backdrop-blur dark:border-white/10 dark:bg-[#081a33]/90">
                    <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-16">
                        <Link href={route('home')} className="flex items-center gap-3 text-[#002753] transition-opacity hover:opacity-90 dark:text-white">
                            <img src={privacyCureLogo} alt="Privacy Cure Compliance" className="h-11 w-auto" />
                            <span className="hidden text-sm font-semibold tracking-tight md:inline">Privacy Cure Compliance</span>
                        </Link>

                        <nav className="order-3 flex w-full flex-wrap items-center gap-5 text-sm md:order-2 md:w-auto md:justify-center md:gap-8">
                            {navItems.map((item) => {
                                const isActive =
                                    (item.key === 'pricing' && current === 'pricing') ||
                                    (item.key === 'resources' && current === 'resources') ||
                                    (item.key === 'product' && current === 'home') ||
                                    (item.key === 'solutions' && current === 'home');

                                const className = `transition-colors ${
                                    isActive
                                        ? 'font-semibold text-[#002753] dark:text-white'
                                        : 'font-medium text-[#434750] hover:text-[#002753] dark:text-white/70 dark:hover:text-white'
                                }`;

                                if (item.type === 'route') {
                                    return (
                                        <Link key={item.label} href={item.href} className={className}>
                                            {item.label}
                                        </Link>
                                    );
                                }

                                return (
                                    <a key={item.label} href={item.href} className={className}>
                                        {item.label}
                                    </a>
                                );
                            })}
                        </nav>

                        <div className="order-2 flex items-center gap-3 md:order-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#083d77]/15 px-4 py-2 text-sm font-medium text-[#002753] transition-colors hover:border-[#083d77]/25 hover:bg-[#083d77]/5 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#083d77]/15 px-4 py-2 text-sm font-medium text-[#002753] transition-colors hover:border-[#083d77]/25 hover:bg-[#083d77]/5 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
                                >
                                    <LogIn className="size-4" />
                                    <span className="hidden sm:inline">Log in</span>
                                </Link>
                            )}

                            <Link
                                href={auth.user ? route('dashboard') : route('register')}
                                className="inline-flex items-center gap-2 rounded-full bg-[#002753] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-[#083d77]"
                            >
                                {auth.user ? 'Open workspace' : 'Create workspace'}
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>
                </header>

                <main key={currentUrl} className="marketing-page-enter">
                    {children}
                </main>

                <footer className="border-t border-[#c3c6d1]/20 bg-white py-10 dark:border-white/10 dark:bg-[#061427]">
                    <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-6 px-6 lg:px-16">
                        <Link href={route('home')} className="flex items-center gap-3 text-[#002753] dark:text-white">
                            <img src={privacyCureLogo} alt="Privacy Cure Compliance" className="h-8 w-auto" />
                            <span className="text-sm font-semibold tracking-tight">Privacy Cure Compliance</span>
                        </Link>

                        <div className="flex flex-wrap items-center gap-5 text-xs font-medium uppercase tracking-[0.14em] text-[#434750] dark:text-white/70">
                            <Link href={route('privacy-policy')} className="transition-colors hover:text-[#002753] dark:hover:text-white">
                                Privacy Policy
                            </Link>
                            <Link href={route('terms-and-conditions')} className="transition-colors hover:text-[#002753] dark:hover:text-white">
                                Terms & Conditions
                            </Link>
                            <Link href={route('pricing')} className="transition-colors hover:text-[#002753] dark:hover:text-white">
                                Pricing
                            </Link>
                            <Link href={route('resources')} className="transition-colors hover:text-[#002753] dark:hover:text-white">
                                Resources
                            </Link>
                            <a href={`${route('resources')}#faq`} className="transition-colors hover:text-[#002753] dark:hover:text-white">
                                FAQ
                            </a>
                        </div>

                        <p className="text-sm text-[#434750] dark:text-white/60">© 2026 Privacy Cure Compliance. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
