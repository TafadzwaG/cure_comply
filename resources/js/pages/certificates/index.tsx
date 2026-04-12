import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlatformLayout from '@/layouts/platform-layout';
import { Head, Link } from '@inertiajs/react';
import { Award, BookOpenCheck, CalendarDays, ExternalLink, FileBadge2, GraduationCap, Printer, Trophy } from 'lucide-react';

interface CertificateItem {
    id: number;
    title: string;
    description?: string | null;
    issued_at?: string | null;
    score?: number | null;
    detail?: string | null;
    source_url: string;
    certificate_url: string;
    completed_lessons?: number;
    total_lessons?: number;
    estimated_minutes?: number | null;
    attempt_number?: number;
}

interface CertificateStats {
    total: number;
    courses: number;
    tests: number;
    latestIssuedAt?: string | null;
}

export default function CertificatesIndex({
    stats,
    courseCertificates,
    testCertificates,
}: {
    stats: CertificateStats;
    courseCertificates: CertificateItem[];
    testCertificates: CertificateItem[];
}) {
    return (
        <PlatformLayout>
            <Head title="Certificates" />

            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Certificates"
                    description="Your completed course and assessment records, ready for review or printing."
                />

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard title="Certificates earned" value={stats.total} detail="Total verified achievements" icon={Award} />
                    <SummaryCard title="Course certificates" value={stats.courses} detail="Completed learning paths" icon={GraduationCap} />
                    <SummaryCard title="Assessment certificates" value={stats.tests} detail="Passed tests and assessments" icon={FileBadge2} />
                    <SummaryCard title="Latest issued" value={formatDate(stats.latestIssuedAt)} detail="Most recent certificate date" icon={CalendarDays} />
                </section>

                <Card className="border-border/70 shadow-none">
                    <CardHeader>
                        <CardTitle>Certificate library</CardTitle>
                        <CardDescription>
                            Certificates are generated from completed course assignments and passed test attempts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="courses" className="flex flex-col gap-4">
                            <TabsList className="w-fit">
                                <TabsTrigger value="courses">Courses</TabsTrigger>
                                <TabsTrigger value="tests">Tests</TabsTrigger>
                            </TabsList>

                            <TabsContent value="courses" className="mt-0">
                                <CertificateGrid
                                    items={courseCertificates}
                                    emptyTitle="No course certificates yet"
                                    emptyDescription="Complete every published lesson in a course to unlock its certificate."
                                    typeLabel="Course"
                                />
                            </TabsContent>

                            <TabsContent value="tests" className="mt-0">
                                <CertificateGrid
                                    items={testCertificates}
                                    emptyTitle="No test certificates yet"
                                    emptyDescription="Passed tests will appear here with printable certificate records."
                                    typeLabel="Assessment"
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </PlatformLayout>
    );
}

function SummaryCard({ title, value, detail, icon: Icon }: { title: string; value: string | number; detail: string; icon: typeof Award }) {
    return (
        <Card className="border-border/70 shadow-none">
            <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="truncate text-2xl font-semibold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{detail}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function CertificateGrid({
    items,
    emptyTitle,
    emptyDescription,
    typeLabel,
}: {
    items: CertificateItem[];
    emptyTitle: string;
    emptyDescription: string;
    typeLabel: string;
}) {
    if (items.length === 0) {
        return <EmptyState icon={Trophy} title={emptyTitle} description={emptyDescription} action={{ label: 'Open courses', href: route('courses.index') }} />;
    }

    return (
        <div className="grid gap-4 xl:grid-cols-2">
            {items.map((item) => (
                <Card key={`${typeLabel}-${item.id}`} className="border-border/70 shadow-none">
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">{typeLabel}</Badge>
                                <Badge variant="outline">Issued {formatDate(item.issued_at)}</Badge>
                            </div>
                            <CardTitle className="line-clamp-2 text-base font-semibold">{item.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{item.description ?? item.detail}</CardDescription>
                        </div>
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Award className="size-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="grid gap-3 rounded-lg border border-border/70 bg-muted/20 p-4 sm:grid-cols-3">
                            <Metric label="Score" value={item.score !== null && item.score !== undefined ? `${item.score}%` : 'Earned'} />
                            <Metric label={typeLabel === 'Course' ? 'Lessons' : 'Attempt'} value={typeLabel === 'Course' ? `${item.completed_lessons ?? 0}/${item.total_lessons ?? 0}` : `#${item.attempt_number ?? 1}`} />
                            <Metric label="Duration" value={item.estimated_minutes ? `${item.estimated_minutes}m` : 'N/A'} />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button asChild>
                                <Link href={item.certificate_url}>
                                    <Printer className="size-4" />
                                    Open certificate
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={item.source_url}>
                                    <ExternalLink className="size-4" />
                                    View source
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground">{value}</p>
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
        month: 'short',
        year: 'numeric',
    }).format(date);
}
