import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import PlatformLayout from '@/layouts/platform-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Flame, ListChecks, Thermometer } from 'lucide-react';

interface HeatmapQuestion {
    id: number;
    question_text: string;
    total: number;
    failed: number;
    failure_rate: number;
}

interface HeatmapSection {
    id: number;
    name: string;
    weight: number;
    questions: HeatmapQuestion[];
}

interface Props {
    framework: { id: number; name: string; version?: string | null };
    sections: HeatmapSection[];
}

function heatColor(rate: number, total: number) {
    if (total === 0) return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500' };
    if (rate >= 75) return { bg: 'bg-rose-600 text-white', text: 'text-white' };
    if (rate >= 50) return { bg: 'bg-rose-400 text-white', text: 'text-white' };
    if (rate >= 30) return { bg: 'bg-amber-400 text-amber-950', text: 'text-amber-950' };
    if (rate >= 10) return { bg: 'bg-amber-200 text-amber-900', text: 'text-amber-900' };
    if (rate > 0) return { bg: 'bg-emerald-200 text-emerald-900', text: 'text-emerald-900' };
    return { bg: 'bg-emerald-500 text-white', text: 'text-white' };
}

export default function FrameworkHeatmap({ framework, sections }: Props) {
    const allQuestions = sections.flatMap((s) => s.questions);
    const totalFails = allQuestions.reduce((s, q) => s + q.failed, 0);
    const totalResponses = allQuestions.reduce((s, q) => s + q.total, 0);
    const weakest = [...allQuestions]
        .filter((q) => q.total > 0)
        .sort((a, b) => b.failure_rate - a.failure_rate)
        .slice(0, 5);

    return (
        <PlatformLayout>
            <Head title={`Heatmap · ${framework.name}`} />

            <div className="space-y-6">
                <PageHeader
                    title={`Question failure heatmap`}
                    description={`${framework.name}${framework.version ? ' · v' + framework.version : ''} — identify weak controls across all submissions.`}
                    icon={Thermometer}
                    eyebrow="PrivacyCure Insights"
                >
                    <Button asChild size="sm" className="bg-white text-[#0F2E52] hover:bg-white/90 hover:text-black">
                        <Link href={route('frameworks.show', framework.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to framework
                        </Link>
                    </Button>
                </PageHeader>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-[#14417A]/15 shadow-none">
                        <CardContent className="flex items-start gap-3 p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <ListChecks className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Responses analyzed</p>
                                <p className="text-2xl font-semibold text-[#0F2E52] dark:text-blue-200">{totalResponses}</p>
                                <p className="text-xs text-muted-foreground">Across {allQuestions.length} questions</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-[#14417A]/15 shadow-none">
                        <CardContent className="flex items-start gap-3 p-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-rose-600">
                                <Flame className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total failures</p>
                                <p className="text-2xl font-semibold text-[#0F2E52] dark:text-blue-200">{totalFails}</p>
                                <p className="text-xs text-muted-foreground">
                                    {totalResponses > 0 ? `${Math.round((totalFails / totalResponses) * 100)}% overall failure rate` : 'No data yet'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-[#14417A]/15 shadow-none">
                        <CardContent className="p-5">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Weakest controls</p>
                            {weakest.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No failing responses yet.</p>
                            ) : (
                                <ul className="space-y-1">
                                    {weakest.map((q) => (
                                        <li key={q.id} className="flex items-center justify-between gap-2 text-xs">
                                            <span className="truncate text-[#0F2E52] dark:text-blue-200">{q.question_text}</span>
                                            <Badge variant="outline" className="shrink-0 border-rose-200 bg-rose-50 text-rose-700">
                                                {q.failure_rate}%
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    {sections.map((section) => (
                        <Card key={section.id} className="border-[#14417A]/15 shadow-none">
                            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-semibold text-[#0F2E52] dark:text-blue-200">
                                            {section.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {section.questions.length} questions · weight {section.weight}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {section.questions.map((q) => {
                                        const { bg } = heatColor(q.failure_rate, q.total);
                                        return (
                                            <div
                                                key={q.id}
                                                title={`${q.failed} failed of ${q.total} responses`}
                                                className={`group relative flex min-h-[90px] flex-col justify-between rounded-lg p-3 transition-transform hover:scale-[1.02] ${bg}`}
                                            >
                                                <p className="line-clamp-3 text-xs font-medium">{q.question_text}</p>
                                                <div className="mt-2 flex items-center justify-between text-[10px] font-semibold opacity-90">
                                                    <span>{q.total === 0 ? 'No data' : `${q.failed}/${q.total}`}</span>
                                                    {q.total > 0 && <span>{q.failure_rate}%</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="border-[#14417A]/15 shadow-none">
                    <CardContent className="flex flex-wrap items-center gap-4 p-5 text-xs">
                        <span className="font-medium text-muted-foreground">Legend:</span>
                        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-emerald-500" /> 0% fail</span>
                        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-emerald-200" /> &lt;10%</span>
                        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-amber-200" /> 10–29%</span>
                        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-amber-400" /> 30–49%</span>
                        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-rose-400" /> 50–74%</span>
                        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-rose-600" /> 75%+ fail</span>
                        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-slate-200" /> No data</span>
                    </CardContent>
                </Card>
            </div>
        </PlatformLayout>
    );
}
