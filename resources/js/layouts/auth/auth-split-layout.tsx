import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import privacyCureLogo from '@/images/privacycure-logo.png';
import privacyCureLogoWhite from '@/images/privacycure-logo-white.png';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    const { name } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,#160f30_0%,#221551_48%,#083D77_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(43,253,207,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(103,73,241,0.2),transparent_34%)]" />
                <Link href={route('home')} className="relative z-20 flex items-center text-lg font-medium">
                    <img src={privacyCureLogoWhite} alt="Privacy Cure Compliance" className="h-12 w-auto" />
                </Link>
                <div className="relative z-20 mt-auto space-y-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200/80">{name}</p>
                    <div className="space-y-3">
                        <p className="text-3xl font-semibold leading-tight">Trusted ally in data protection, privacy training, and regulatory compliance.</p>
                        <p className="max-w-md text-sm leading-7 text-slate-200/85">
                            Bring employee awareness, evidence review, assessments, and compliance scoring into a single platform shaped by PrivacyCure branding.
                        </p>
                    </div>
                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center">
                        <img src={privacyCureLogo} alt="Privacy Cure Compliance" className="h-14 w-auto" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#083D77]">Privacy Cure Compliance</p>
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-muted-foreground text-sm text-balance">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
