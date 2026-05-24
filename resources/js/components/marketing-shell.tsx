import { MarketingChromeStyles, MarketingFooter, MarketingHeader, MarketingThemeToggle, StudioHeroBackgroundStyles, type MarketingCurrent } from '@/components/marketing-chrome';
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
                        --public-paper: #f5f7fb;
                        --public-soft: #eaf0f9;
                        font-family: 'Instrument Sans', Arial, Helvetica, sans-serif;
                        font-feature-settings: 'ss01', 'ss02', 'cv11';
                        background: var(--public-paper);
                    }

                    .dark .public-marketing-shell {
                        background: #0b1220;
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

                    .public-marketing-shell .marketing-hero-section h1,
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
                            radial-gradient(rgba(14, 42, 94, 0.05) 1px, transparent 1px),
                            radial-gradient(rgba(31, 70, 148, 0.04) 1px, transparent 1px);
                        background-position: 0 0, 3px 4px;
                        background-size: 4px 4px, 11px 11px;
                        opacity: 0.35;
                    }

                    .dark .public-marketing-shell::before {
                        opacity: 0.22;
                        background-image:
                            radial-gradient(rgba(168, 193, 237, 0.06) 1px, transparent 1px),
                            radial-gradient(rgba(168, 193, 237, 0.04) 1px, transparent 1px);
                    }

                    .public-marketing-shell::after {
                        content: '';
                        position: fixed;
                        inset: 0;
                        z-index: 0;
                        pointer-events: none;
                        background-image:
                            linear-gradient(to right, rgba(0, 218, 243, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 39, 83, 0.04) 1px, transparent 1px);
                        background-size: 56px 56px;
                        mask-image: linear-gradient(to bottom, black, transparent 72%);
                        opacity: 0.28;
                    }

                    .dark .public-marketing-shell::after {
                        opacity: 0.18;
                        background-image:
                            linear-gradient(to right, rgba(168, 193, 237, 0.06) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(168, 193, 237, 0.04) 1px, transparent 1px);
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

            <StudioHeroBackgroundStyles />
            <MarketingChromeStyles />

            <div className="public-marketing-shell wc-root relative min-h-screen text-[#191c1e] dark:text-white">
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
