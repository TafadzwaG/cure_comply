import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PlatformLayout from '@/layouts/platform-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Bell,
    BookOpenCheck,
    Building2,
    CircleHelp,
    FileCheck2,
    FileSearch,
    GraduationCap,
    LayoutDashboard,
    LifeBuoy,
    Mail,
    MessageSquare,
    ScrollText,
    ShieldCheck,
    UserRound,
    Users,
} from 'lucide-react';

interface QuickLink {
    label: string;
    href: string;
    description: string;
}

export default function HelpIndex({ quickLinks }: { quickLinks: QuickLink[] }) {
    return (
        <PlatformLayout>
            <Head title="Help / Support" />

            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Help / Support"
                    description="Find the right workspace, understand what needs action, and get support when something is blocked."
                />

                <Card className="overflow-hidden border-border/70 shadow-none">
                    <CardContent className="bg-primary p-6 text-primary-foreground md:p-8">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-2xl">
                                <Badge className="mb-4 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/10">
                                    Platform support desk
                                </Badge>
                                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Start with your active work queue.</h2>
                                <p className="mt-3 text-sm leading-6 text-primary-foreground/80">
                                    Your shortcuts are scoped to your current role. If a module is missing or blocked, check your profile, notifications, and assigned workspace first.
                                </p>
                            </div>
                            <Button asChild className="w-fit bg-background text-foreground hover:bg-background/90">
                                <Link href={route('notifications.index')}>
                                    <MessageSquare className="size-4" />
                                    Open notifications
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {quickLinks.map((link) => (
                        <Card key={link.href} className="border-border/70 shadow-none">
                            <CardHeader>
                                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <IconForLink label={link.label} />
                                </div>
                                <CardTitle className="text-base font-semibold">{link.label}</CardTitle>
                                <CardDescription>{link.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={link.href}>
                                        Open
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader>
                            <CardTitle>Common questions</CardTitle>
                            <CardDescription>Fast answers for common platform workflows.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <HelpItem
                                title="I cannot see a module or record."
                                description="Most pages are role and permission scoped. Check that your account has the right role, tenant, and assignment before escalating."
                            />
                            <HelpItem
                                title="My work queue looks incomplete."
                                description="Training, tests, evidence, and submissions may require explicit assignment by a company admin or platform admin."
                            />
                            <HelpItem
                                title="A notification or email is missing."
                                description="Open the notifications feed first. If email delivery is delayed, confirm the queue worker is processing the mail queue."
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-border/70 shadow-none">
                        <CardHeader>
                            <CardTitle>Contact support</CardTitle>
                            <CardDescription>Use this when the issue cannot be resolved by your company admin.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4 text-sm">
                            <div className="rounded-lg border border-border bg-muted/20 p-4">
                                <div className="flex items-start gap-3">
                                    <LifeBuoy className="mt-0.5 size-5 text-primary" />
                                    <div>
                                        <p className="font-medium text-foreground">Platform support</p>
                                        <p className="text-muted-foreground">Include your company name, task title, and a short description of the problem.</p>
                                    </div>
                                </div>
                            </div>
                            <Button asChild>
                                <a href="mailto:support@privacycure.com">
                                    <Mail className="size-4" />
                                    Email support
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </PlatformLayout>
    );
}

function HelpItem({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
            <div className="flex items-start gap-3">
                <CircleHelp className="mt-0.5 size-5 text-primary" />
                <div>
                    <p className="font-medium text-foreground">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
            </div>
        </div>
    );
}

function IconForLink({ label }: { label: string }) {
    const lower = label.toLowerCase();

    if (lower.includes('training')) {
        return <GraduationCap className="size-5" />;
    }

    if (lower.includes('dashboard')) {
        return <LayoutDashboard className="size-5" />;
    }

    if (lower.includes('tenant')) {
        return <Building2 className="size-5" />;
    }

    if (lower.includes('employee') || lower.includes('user')) {
        return <Users className="size-5" />;
    }

    if (lower.includes('invitation')) {
        return <Mail className="size-5" />;
    }

    if (lower.includes('report')) {
        return <ScrollText className="size-5" />;
    }

    if (lower.includes('evidence')) {
        return <FileSearch className="size-5" />;
    }

    if (lower.includes('notification')) {
        return <Bell className="size-5" />;
    }

    if (lower.includes('certificate')) {
        return <ShieldCheck className="size-5" />;
    }

    if (lower.includes('assignment')) {
        return <BookOpenCheck className="size-5" />;
    }

    if (lower.includes('submission')) {
        return <FileCheck2 className="size-5" />;
    }

    if (lower.includes('profile')) {
        return <UserRound className="size-5" />;
    }

    return <CircleHelp className="size-5" />;
}
