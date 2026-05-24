import { MarketingChromeStyles, MarketingFooter, MarketingHeader, MarketingThemeToggle, type MarketingCurrent } from '@/components/marketing-chrome';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';

type MarketingShellProps = PropsWithChildren<{
    title: string;
    description: string;
    current: MarketingCurrent;
}>;

export default function MarketingShell({ title, description, current, children }: MarketingShellProps) {
    const page = usePage<SharedData>();
    const currentUrl = page.url.split('#')[0];

    return (
        <>
            <Head title={title}>
                <meta name="description" content={description} />
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=fraunces:300,400,500,600,700|instrument-sans:400,500,600|jetbrains-mono:400,500"
                    rel="stylesheet"
                />
                <style>{`
                    .public-marketing-shell {
                        --public-ink: #002753;
                        --public-mid: #083d77;
                        --public-cyan: #00daf3;
                        --public-paper: #f7f9fb;
                        --public-soft: #f2f4f6;
                        font-family: 'Instrument Sans', Arial, Helvetica, sans-serif;
                        font-feature-settings: 'ss01', 'ss02', 'cv11';
                    }

                    .public-marketing-shell h1,
                    .public-marketing-shell h2,
                    .public-marketing-shell h3,
                    .public-marketing-display {
                        font-family: 'Fraunces', Georgia, serif;
                        font-weight: 400;
                        letter-spacing: 0;
                    }

                    .public-marketing-label,
                    .public-marketing-shell main [class*='uppercase'] {
                        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
                        letter-spacing: 0.16em;
                        text-transform: uppercase;
                    }

                    .public-marketing-shell a[class*='rounded-full'],
                    .public-marketing-shell button[class*='rounded-full'],
                    .public-marketing-shell [role='button'][class*='rounded-full'] {
                        border-radius: 4px !important;
                    }

                    .public-marketing-shell a[class*='bg-[#002753]'],
                    .public-marketing-shell a[class*='bg-primary'],
                    .public-marketing-shell button[class*='bg-primary'],
                    .public-marketing-shell button[class*='bg-[#002753]'] {
                        border-radius: 4px !important;
                        box-shadow: none !important;
                        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
                        font-size: 11px;
                        font-weight: 500;
                        letter-spacing: 0.14em;
                        text-transform: uppercase;
                    }

                    .public-marketing-shell a[class*='border'],
                    .public-marketing-shell button[class*='border'] {
                        border-radius: 4px !important;
                    }

                    .public-marketing-shell a[class*='bg-primary'],
                    .public-marketing-shell button[class*='bg-primary'],
                    .public-marketing-shell a[class*='border'],
                    .public-marketing-shell button[class*='border'] {
                        font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
                        font-size: 11px;
                        font-weight: 500;
                        letter-spacing: 0.12em;
                        text-transform: uppercase;
                    }

                    .public-marketing-shell .rounded-xl,
                    .public-marketing-shell .rounded-2xl {
                        border-radius: 8px !important;
                    }

                    .public-marketing-shell main > section:first-child {
                        position: relative;
                        overflow: hidden;
                        min-height: min(720px, calc(100vh - 84px));
                        display: flex;
                        align-items: center;
                        background:
                            linear-gradient(
                                to right,
                                rgba(247, 249, 251, 0.98) 0%,
                                rgba(247, 249, 251, 0.92) 42%,
                                rgba(247, 249, 251, 0.62) 72%,
                                rgba(247, 249, 251, 0.5) 100%
                            ),
                            url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1800&q=80&auto=format&fit=crop')
                                right center / cover no-repeat;
                    }

                    .dark .public-marketing-shell main > section:first-child {
                        background:
                            linear-gradient(
                                to right,
                                rgba(8, 26, 51, 0.98) 0%,
                                rgba(8, 26, 51, 0.94) 42%,
                                rgba(8, 26, 51, 0.72) 72%,
                                rgba(8, 26, 51, 0.66) 100%
                            ),
                            url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1800&q=80&auto=format&fit=crop')
                                right center / cover no-repeat;
                    }

                    .public-marketing-shell main > section:first-child::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        pointer-events: none;
                        background-image:
                            linear-gradient(to right, rgba(0, 218, 243, 0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 39, 83, 0.08) 1px, transparent 1px);
                        background-size: 54px 54px;
                        opacity: 0.55;
                    }

                    .public-marketing-shell main > section:first-child > div {
                        position: relative;
                        z-index: 1;
                    }

                    .public-marketing-shell main > section:first-child h1 {
                        font-size: clamp(2.9rem, 7vw, 6.75rem);
                        line-height: 0.94;
                        font-weight: 300;
                        max-width: 980px;
                    }

                    .public-marketing-shell main > section:first-child p {
                        max-width: 640px;
                    }

                    .public-marketing-shell main > section:not(:first-child) {
                        position: relative;
                    }

                    .public-marketing-shell main > section:nth-child(even) {
                        background-color: rgba(242, 244, 246, 0.72);
                    }

                    .dark .public-marketing-shell main > section:nth-child(even) {
                        background-color: rgba(11, 34, 65, 0.72);
                    }

                    .public-marketing-shell .border {
                        border-color: rgba(195, 198, 209, 0.42) !important;
                    }

                    .dark .public-marketing-shell .border {
                        border-color: rgba(255, 255, 255, 0.12) !important;
                    }

                    .public-marketing-shell [class*='shadow-'] {
                        box-shadow: none !important;
                    }

                    .public-marketing-shell [class*='rounded-full'][class*='uppercase'] {
                        border-radius: 4px !important;
                    }

                    .public-marketing-shell [class*='text-5xl'],
                    .public-marketing-shell [class*='text-6xl'] {
                        line-height: 0.98;
                    }

                    .public-marketing-shell main > section h2 {
                        font-weight: 300;
                        line-height: 1;
                    }

                    .public-marketing-shell main > section h3 {
                        font-weight: 400;
                    }

                    .public-marketing-shell::before {
                        content: '';
                        position: fixed;
                        inset: 0;
                        z-index: 0;
                        pointer-events: none;
                        background-image:
                            radial-gradient(rgba(0, 39, 83, 0.06) 1px, transparent 1px),
                            radial-gradient(rgba(0, 218, 243, 0.08) 1px, transparent 1px);
                        background-position: 0 0, 2px 3px;
                        background-size: 4px 4px, 11px 11px;
                        opacity: 0.28;
                    }

                    .public-marketing-shell::after {
                        content: '';
                        position: fixed;
                        inset: 0;
                        z-index: 0;
                        pointer-events: none;
                        background-image:
                            linear-gradient(to right, rgba(0, 218, 243, 0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 39, 83, 0.06) 1px, transparent 1px);
                        background-size: 56px 56px;
                        mask-image: linear-gradient(to bottom, black, transparent 70%);
                        opacity: 0.45;
                    }

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

            <MarketingChromeStyles />

            <div className="public-marketing-shell wc-root relative min-h-screen bg-[#f7f9fb] text-[#191c1e] dark:bg-[#081a33] dark:text-white">
                <MarketingHeader current={current} />

                <main key={currentUrl} className="marketing-page-enter relative z-10">
                    {children}
                </main>

                <MarketingFooter />
                <MarketingThemeToggle />
            </div>
        </>
    );
}
