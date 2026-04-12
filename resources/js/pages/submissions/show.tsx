import InputError from '@/components/input-error';
import { EvidenceReviewDialog } from '@/components/evidence-review-dialog';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import PlatformLayout from '@/layouts/platform-layout';
import { formatLongDateTime } from '@/lib/date';
import { SharedData } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { Building2, CalendarDays, CheckCircle2, ClipboardCheck, Download, FileSearch, FileText, Gauge, MessageSquareText, Paperclip, ShieldCheck, UploadCloud } from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';

interface EvidenceReview {
    id: number;
    review_status: string;
    review_comment?: string | null;
    reviewed_at?: string | null;
    reviewer?: { name?: string | null } | null;
}

interface EvidenceFileItem {
    id: number;
    original_name: string;
    mime_type?: string | null;
    file_size?: number | null;
    uploaded_at?: string | null;
    review_status: string;
    uploader?: { name?: string | null } | null;
    reviews?: EvidenceReview[];
}

interface SubmissionQuestion {
    id: number;
    code?: string | null;
    question_text: string;
    answer_type: 'yes_no_partial' | 'text' | 'score' | 'date';
    weight: number;
    requires_evidence: boolean;
    guidance_text?: string | null;
    sort_order: number;
}

interface SubmissionSection {
    id: number;
    name: string;
    description?: string | null;
    sort_order: number;
    weight: number;
    questions: SubmissionQuestion[];
}

interface ExistingResponse {
    id: number;
    compliance_question_id: number;
    answer_value?: string | null;
    answer_text?: string | null;
    comment_text?: string | null;
    response_score?: number | null;
    status?: string;
    evidence_files?: EvidenceFileItem[];
}

interface SubmissionData {
    id: number;
    title: string;
    reporting_period?: string | null;
    status: string;
    submitted_at?: string | null;
    tenant?: { id: number; name: string } | null;
    framework?: {
        id: number;
        name: string;
        version?: string | null;
        sections: SubmissionSection[];
    } | null;
    responses?: ExistingResponse[];
    score?: {
        overall_score?: number | null;
        rating?: string | null;
        calculated_at?: string | null;
    } | null;
    section_scores?: Array<{
        id: number;
        score: number;
        rating?: string | null;
        section?: { id: number; name: string } | null;
    }>;
}

interface ResponsePayload {
    compliance_question_id: number;
    answer_value: string;
    answer_text: string;
    comment_text: string;
}

export default function SubmissionShow({
    submission,
    meta,
}: {
    submission: SubmissionData;
    meta: {
        completionPercentage: number;
        answeredCount: number;
        totalQuestions: number;
    };
}) {
    const { auth } = usePage<SharedData>().props;
    const permissions = auth.permissions ?? [];
    const canUploadEvidence = permissions.includes('upload evidence');
    const canReviewEvidence = permissions.includes('review evidence');
    const canManageSubmissions = permissions.includes('manage compliance submissions');

    const sections = submission.framework?.sections ?? [];
    const existingResponses = new Map((submission.responses ?? []).map((response) => [response.compliance_question_id, response]));
    const initialResponses = sections.flatMap((section) =>
        section.questions.map((question) => {
            const response = existingResponses.get(question.id);

            return {
                compliance_question_id: question.id,
                answer_value: response?.answer_value ?? '',
                answer_text: response?.answer_text ?? '',
                comment_text: response?.comment_text ?? '',
            };
        }),
    );

    const form = useForm<{ responses: ResponsePayload[] }>({
        responses: initialResponses,
    });

    const responsesByQuestionId = new Map(form.data.responses.map((response) => [response.compliance_question_id, response]));
    const answeredCount = form.data.responses.filter((response) => filledResponse(response)).length;
    const completionPercentage = meta.totalQuestions > 0 ? Math.round((answeredCount / meta.totalQuestions) * 100) : 0;
    const latestScore = submission.score?.overall_score ?? null;
    const defaultTab = sections[0] ? `section-${sections[0].id}` : 'review';

    const updateResponse = (questionId: number, patch: Partial<ResponsePayload>) => {
        form.setData(
            'responses',
            form.data.responses.map((response) =>
                response.compliance_question_id === questionId
                    ? {
                          ...response,
                          ...patch,
                      }
                    : response,
            ),
        );
    };

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader
                    title={submission.title}
                    description={`Submission for ${submission.tenant?.name ?? 'Platform'} · Work section by section, capture evidence-backed answers, and submit when complete.`}
                >
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="border-[#14417A]/20 bg-[#14417A]/5 text-[#14417A] dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                        >
                            <Building2 className="mr-1.5 h-3.5 w-3.5" />
                            {submission.tenant?.name ?? 'Platform'}
                        </Badge>
                        <StatusBadge value={submission.status} />
                    </div>
                </PageHeader>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard title="Completion" value={`${completionPercentage}%`} detail={`${answeredCount} of ${meta.totalQuestions} questions answered`} icon={ClipboardCheck} />
                    <MetricCard title="Framework" value={submission.framework?.name ?? 'Unassigned'} detail={submission.framework?.version ? `Version ${submission.framework.version}` : 'Framework version not set'} icon={ShieldCheck} />
                    <MetricCard title="Current score" value={latestScore !== null ? `${Math.round(latestScore)}%` : 'Pending'} detail={submission.score?.rating ?? 'Not scored yet'} icon={Gauge} />
                    <MetricCard title="Reporting period" value={submission.reporting_period ?? 'Not set'} detail={submission.submitted_at ? `Submitted ${formatLongDateTime(submission.submitted_at)}` : 'Still in draft'} icon={CalendarDays} />
                </section>

                <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader className="space-y-4">
                            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <CardTitle>Section answer flow</CardTitle>
                                    <CardDescription>Each section tracks progress independently so company admins can move through the assessment in a controlled sequence.</CardDescription>
                                </div>
                                <Badge variant="outline" className="rounded-full px-3 py-1 uppercase tracking-[0.18em]">
                                    Draft workspace
                                </Badge>
                            </div>
                            <Progress value={completionPercentage} className="h-2 bg-muted/45" />
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue={defaultTab} className="space-y-4">
                                <TabsList className="w-full flex-wrap justify-start">
                                    {sections.map((section) => {
                                        const count = section.questions.filter((question) => filledResponse(responsesByQuestionId.get(question.id))).length;

                                        return (
                                            <TabsTrigger key={section.id} value={`section-${section.id}`}>
                                                {section.name}
                                                <span className="ml-2 text-xs text-muted-foreground">{count}/{section.questions.length}</span>
                                            </TabsTrigger>
                                        );
                                    })}
                                    <TabsTrigger value="review">
                                        Review
                                    </TabsTrigger>
                                </TabsList>

                                {sections.map((section) => (
                                    <TabsContent key={section.id} value={`section-${section.id}`} className="space-y-4">
                                        <Card className="border-border/70 bg-muted/15 shadow-none">
                                            <CardHeader>
                                                <CardTitle>{section.name}</CardTitle>
                                                <CardDescription>{section.description || 'Answer the controls below and add comments where business context is needed.'}</CardDescription>
                                            </CardHeader>
                                        </Card>

                                        {section.questions.map((question) => {
                                            const response = responsesByQuestionId.get(question.id) ?? emptyResponse(question.id);
                                            const existingResponse = existingResponses.get(question.id);
                                            const evidenceFiles = existingResponse?.evidence_files ?? [];

                                            return (
                                                <Card key={question.id} className="border-border/70 shadow-none">
                                                    <CardHeader>
                                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                            <div className="space-y-2">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    {question.code ? <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">{question.code}</Badge> : null}
                                                                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">{question.answer_type.replaceAll('_', ' ')}</Badge>
                                                                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">Weight {question.weight}</Badge>
                                                                </div>
                                                                <CardTitle className="text-base leading-7">{question.question_text}</CardTitle>
                                                                {question.guidance_text ? <CardDescription className="leading-6">{question.guidance_text}</CardDescription> : null}
                                                            </div>
                                                            <div className="space-y-2 text-xs text-muted-foreground">
                                                                <div className="flex items-center gap-2">
                                                                    <CheckCircle2 className="size-4" />
                                                                    {question.requires_evidence ? 'Evidence required' : 'Evidence optional'}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Paperclip className="size-4" />
                                                                    {evidenceFiles.length} uploaded evidence file{evidenceFiles.length === 1 ? '' : 's'}
                                                                </div>
                                                                {existingResponse?.response_score !== null && existingResponse?.response_score !== undefined ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <Gauge className="size-4" />
                                                                        Response score {Math.round(existingResponse.response_score)}%
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="space-y-5">
                                                        <AnswerField question={question} response={response} onChange={(patch) => updateResponse(question.id, patch)} />

                                                        <div className="space-y-2">
                                                            <Label>Context / comments</Label>
                                                            <Textarea value={response.comment_text} onChange={(event) => updateResponse(question.id, { comment_text: event.target.value })} placeholder="Add implementation notes, caveats, or reviewer context." />
                                                        </div>

                                                        <EvidencePanel
                                                            submissionId={submission.id}
                                                            questionId={question.id}
                                                            responseId={existingResponse?.id}
                                                            evidenceFiles={evidenceFiles}
                                                            requiresEvidence={question.requires_evidence}
                                                            canUploadEvidence={canUploadEvidence}
                                                            canReviewEvidence={canReviewEvidence}
                                                        />
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </TabsContent>
                                ))}

                                <TabsContent value="review" className="space-y-4">
                                    <Card className="border-border/70 shadow-none">
                                        <CardHeader>
                                            <CardTitle>Review before submit</CardTitle>
                                            <CardDescription>Check completion, latest score state, and section standing before moving the submission out of draft.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                <ReviewStat label="Answered controls" value={`${answeredCount}/${meta.totalQuestions}`} />
                                                <ReviewStat label="Completion" value={`${completionPercentage}%`} />
                                                <ReviewStat label="Latest rating" value={submission.score?.rating ?? 'Pending'} />
                                            </div>

                                            <div className="space-y-3">
                                                {(submission.section_scores ?? []).length > 0 ? (
                                                    submission.section_scores?.map((score) => (
                                                        <div key={score.id} className="rounded-xl border border-border/70 bg-muted/20 p-4">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div>
                                                                    <p className="font-medium">{score.section?.name ?? 'Section'}</p>
                                                                    <p className="text-sm text-muted-foreground">{score.rating ?? 'Pending rating'}</p>
                                                                </div>
                                                                <div className="text-lg font-semibold">{Math.round(score.score)}%</div>
                                                            </div>
                                                            <Progress value={score.score} className="mt-3 h-2 bg-muted/45" />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 p-5 text-sm text-muted-foreground">
                                                        Section scores will appear here after the first scoring pass.
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="border-border/70 bg-muted/20 shadow-none">
                            <CardHeader>
                                <CardTitle>Workflow actions</CardTitle>
                                <CardDescription>Save progress throughout the cycle, then submit for review and scoring when ready.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full" onClick={() => form.post(route('submissions.responses.store', submission.id, false))}>
                                    <MessageSquareText className="size-4" />
                                    Save draft responses
                                </Button>
                                {canManageSubmissions && (
                                    <>
                                        <Button variant="outline" className="w-full" onClick={() => router.post(route('submissions.submit', submission.id, false))}>
                                            <ShieldCheck className="size-4" />
                                            Submit for review
                                        </Button>
                                        <Button variant="outline" className="w-full" onClick={() => router.post(route('submissions.recalculate', submission.id, false))}>
                                            <Gauge className="size-4" />
                                            Recalculate score
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-border/70 shadow-none">
                            <CardHeader>
                                <CardTitle>Submission guidance</CardTitle>
                                <CardDescription>Use the answer type intentionally so the scoring engine and reviewers get usable evidence.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <GuidanceRow icon={ClipboardCheck} title="Yes / no / partial controls" description="Use these for policy or control maturity questions that should directly affect the compliance score." />
                                <GuidanceRow icon={FileText} title="Text controls" description="Use narrative answers when the framework expects explanation instead of a fixed scoreable choice." />
                                <GuidanceRow icon={Gauge} title="Score controls" description="Provide a numeric value only when the question explicitly expects a measurable score." />
                                <GuidanceRow icon={CalendarDays} title="Date controls" description="Capture dates for policy review cycles, audits, or regulatory milestones." />
                                <GuidanceRow icon={Paperclip} title="Evidence handling" description="Upload supporting files after a response exists. Reviewers can approve, reject, or keep evidence pending, and scoring will react accordingly." />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PlatformLayout>
    );
}

function EvidencePanel({
    submissionId,
    questionId,
    responseId,
    evidenceFiles,
    requiresEvidence,
    canUploadEvidence,
    canReviewEvidence,
}: {
    submissionId: number;
    questionId: number;
    responseId?: number;
    evidenceFiles: EvidenceFileItem[];
    requiresEvidence: boolean;
    canUploadEvidence: boolean;
    canReviewEvidence: boolean;
}) {
    const uploadForm = useForm<{ file: File | null }>({ file: null });
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const selectedFile = uploadForm.data.file;

    const setUploadFile = (file?: File | null) => {
        uploadForm.setData('file', file ?? null);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        setUploadFile(event.dataTransfer.files?.[0] ?? null);
    };

    const handleUpload = () => {
        if (!selectedFile) {
            return;
        }

        uploadForm.post(route('submissions.questions.evidence.store', { complianceSubmission: submissionId, complianceQuestion: questionId }, false), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                uploadForm.reset();

                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    return (
        <Card className="border-dashed border-border/70 shadow-none">
            <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <CardTitle className="text-base">Evidence files</CardTitle>
                        <CardDescription>
                            {requiresEvidence ? 'This control requires supporting evidence.' : 'Supporting evidence is optional for this control.'}
                        </CardDescription>
                    </div>
                    {requiresEvidence ? <Badge variant="outline">Required</Badge> : null}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {canUploadEvidence ? (
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label>Upload evidence</Label>
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => fileInputRef.current?.click()}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        fileInputRef.current?.click();
                                    }
                                }}
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition ${
                                    isDragging
                                        ? 'border-[#14417A] bg-[#14417A]/10'
                                        : 'border-[#14417A]/25 bg-[#14417A]/[0.03] hover:border-[#14417A] hover:bg-[#14417A]/10'
                                }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="sr-only"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
                                    onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
                                />
                                <div className="mb-3 rounded-xl bg-[#14417A]/10 p-3 text-[#14417A]">
                                    <UploadCloud className="size-6" />
                                </div>
                                <p className="text-sm font-medium text-[#0F2E52] dark:text-blue-200">
                                    {selectedFile ? selectedFile.name : 'Drop evidence here or click to browse'}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    PDF, Word, Excel, CSV, PNG, or JPG. Maximum file size is 20MB.
                                </p>
                                {selectedFile ? (
                                    <p className="mt-2 text-xs font-medium text-[#14417A]">
                                        Selected file: {formatFileSize(selectedFile.size)}
                                    </p>
                                ) : null}
                            </div>
                            <InputError message={uploadForm.errors.file} />
                            <p className="text-xs text-muted-foreground">
                                Uploading here automatically creates the draft response record if it does not exist yet.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={handleUpload}
                                disabled={uploadForm.processing || !selectedFile}
                            >
                                <UploadCloud className="size-4" />
                                {uploadForm.processing ? 'Uploading...' : responseId ? 'Upload evidence' : 'Create response and upload'}
                            </Button>
                            {selectedFile ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        uploadForm.reset();

                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                >
                                    Clear file
                                </Button>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                <div className="space-y-3">
                    {evidenceFiles.length > 0 ? (
                        evidenceFiles.map((file) => (
                            <div key={file.id} className="rounded-xl border border-border/70 bg-background p-4">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="space-y-1">
                                        <p className="font-medium">{file.original_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {file.uploader?.name ?? 'Unknown'} · {formatLongDateTime(file.uploaded_at)} · {formatFileSize(file.file_size)}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <StatusBadge value={file.review_status} />
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={route('evidence.download', file.id, false)}>
                                                <Download className="size-4" />
                                                Download
                                            </a>
                                        </Button>
                                        {canReviewEvidence ? <EvidenceReviewDialog evidenceFile={file} /> : null}
                                    </div>
                                </div>
                                {file.reviews?.[0]?.review_comment ? (
                                    <div className="mt-3 rounded-lg border border-border/70 bg-muted/15 p-3 text-sm text-muted-foreground">
                                        Latest reviewer comment: {file.reviews[0].review_comment}
                                    </div>
                                ) : null}
                            </div>
                        ))
                    ) : (
                        <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 p-4 text-sm text-muted-foreground">
                            No evidence files uploaded for this response yet.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function AnswerField({ question, response, onChange }: { question: SubmissionQuestion; response: ResponsePayload; onChange: (patch: Partial<ResponsePayload>) => void }) {
    if (question.answer_type === 'yes_no_partial') {
        return (
            <div className="space-y-3">
                <Label>Answer</Label>
                <RadioGroup value={response.answer_value} onValueChange={(value) => onChange({ answer_value: value })} className="grid gap-3 md:grid-cols-3">
                    {[
                        { value: 'yes', label: 'Yes' },
                        { value: 'partial', label: 'Partial' },
                        { value: 'no', label: 'No' },
                    ].map((option) => (
                        <label key={option.value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-4">
                            <RadioGroupItem value={option.value} className="mt-1" />
                            <div>
                                <p className="font-medium">{option.label}</p>
                                <p className="text-sm text-muted-foreground">Select the best maturity signal for this control.</p>
                            </div>
                        </label>
                    ))}
                </RadioGroup>
            </div>
        );
    }

    if (question.answer_type === 'text') {
        return <div className="space-y-2"><Label>Answer</Label><Textarea value={response.answer_text} onChange={(event) => onChange({ answer_text: event.target.value })} placeholder="Write the narrative response for this control." /></div>;
    }

    if (question.answer_type === 'score') {
        return <div className="space-y-2"><Label>Numeric score</Label><Input type="number" min="0" step="0.01" value={response.answer_value} onChange={(event) => onChange({ answer_value: event.target.value })} placeholder="Enter score" /></div>;
    }

    return <div className="space-y-2"><Label>Date answer</Label><Input type="date" value={response.answer_value} onChange={(event) => onChange({ answer_value: event.target.value })} /></div>;
}

function MetricCard({ title, value, detail, icon: Icon }: { title: string; value: string; detail: string; icon: typeof ClipboardCheck }) {
    return (
        <Card className="border-border/70 shadow-none">
            <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
                    <p className="text-2xl font-semibold tracking-tight">{value}</p>
                    <p className="text-sm text-muted-foreground">{detail}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/35 p-2.5"><Icon className="size-4" /></div>
            </CardContent>
        </Card>
    );
}

function ReviewStat({ label, value }: { label: string; value: string }) {
    return <div className="rounded-xl border border-border/70 bg-muted/15 p-4"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p></div>;
}

function GuidanceRow({ icon: Icon, title, description }: { icon: typeof ClipboardCheck; title: string; description: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="rounded-lg border border-border/70 bg-muted/25 p-2"><Icon className="size-4" /></div>
            <div className="space-y-1">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

function emptyResponse(questionId: number): ResponsePayload {
    return { compliance_question_id: questionId, answer_value: '', answer_text: '', comment_text: '' };
}

function filledResponse(response: ResponsePayload | undefined) {
    return Boolean(response?.answer_value || response?.answer_text);
}

function formatFileSize(size?: number | null) {
    if (!size) {
        return 'Unknown size';
    }

    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
