import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PlatformLayout from '@/layouts/platform-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Award, ExternalLink, Printer, ShieldCheck } from 'lucide-react';

interface Certificate {
    id: number;
    type: 'course' | 'test';
    title: string;
    description?: string | null;
    recipient: string;
    tenant?: string | null;
    issued_at?: string | null;
    score?: number | null;
    certificate_number: string;
    detail?: string | null;
    source_url: string;
}

export default function CertificateShow({ certificate }: { certificate: Certificate }) {
    return (
        <PlatformLayout>
            <Head title={`${certificate.title} Certificate`} />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <Button asChild variant="outline">
                        <Link href={route('certificates.index')}>
                            <ArrowLeft className="size-4" />
                            Back to certificates
                        </Link>
                    </Button>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href={certificate.source_url}>
                                <ExternalLink className="size-4" />
                                View source
                            </Link>
                        </Button>
                        <Button onClick={() => window.print()}>
                            <Printer className="size-4" />
                            Print certificate
                        </Button>
                    </div>
                </div>

                <Card className="overflow-hidden border-border/70 shadow-none print:border-0 print:shadow-none">
                    <CardContent className="p-0">
                        <div className="relative min-h-[720px] overflow-hidden bg-background p-8 md:p-14 print:min-h-screen">
                            <div className="absolute inset-x-0 top-0 h-2 bg-primary" />
                            <div className="absolute -right-28 -top-28 size-72 rounded-full bg-primary/10" />
                            <div className="absolute -bottom-32 -left-32 size-80 rounded-full bg-muted" />

                            <div className="relative flex min-h-[620px] flex-col justify-between rounded-2xl border border-border bg-card p-8 text-card-foreground md:p-12">
                                <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                            <ShieldCheck className="size-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Privacy Cure Compliance</p>
                                            <p className="text-xs text-muted-foreground">Verified learning record</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="w-fit">
                                        {certificate.certificate_number}
                                    </Badge>
                                </header>

                                <main className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
                                    <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Award className="size-10" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Certificate of completion</p>
                                        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                                            {certificate.recipient}
                                        </h1>
                                    </div>
                                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                                        has successfully completed the {certificate.type === 'course' ? 'course' : 'assessment'}:
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-4xl">{certificate.title}</h2>
                                        {certificate.description ? (
                                            <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground">{certificate.description}</p>
                                        ) : null}
                                    </div>

                                    <div className="grid w-full max-w-2xl gap-3 rounded-xl border border-border bg-muted/20 p-5 sm:grid-cols-3">
                                        <CertificateMetric label="Issued" value={formatDate(certificate.issued_at)} />
                                        <CertificateMetric label="Score" value={certificate.score !== null && certificate.score !== undefined ? `${certificate.score}%` : 'Earned'} />
                                        <CertificateMetric label="Workspace" value={certificate.tenant ?? 'Privacy Cure'} />
                                    </div>
                                </main>

                                <footer className="flex flex-col gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                                    <p>{certificate.detail ?? 'This certificate is generated from the learner activity record.'}</p>
                                    <p>Issued {formatDate(certificate.issued_at)}</p>
                                </footer>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PlatformLayout>
    );
}

function CertificateMetric({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
        </div>
    );
}

function formatDate(value?: string | null) {
    if (!value) {
        return 'N/A';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}
