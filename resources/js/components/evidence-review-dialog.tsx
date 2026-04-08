import InputError from '@/components/input-error';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatLongDateTime } from '@/lib/date';
import { useForm } from '@inertiajs/react';
import { CheckCheck, Clock3, Download, FileSearch, History, MessageSquareText, Minus, Plus } from 'lucide-react';

interface EvidenceFileVersionData {
    id: number;
    version_number: number;
    original_name: string;
    file_size?: number | null;
    uploaded_at?: string | null;
    review_status: string;
    review_comment?: string | null;
    uploader?: { name?: string | null } | null;
}

interface EvidenceFileReviewData {
    id: number;
    original_name: string;
    review_status: string;
    current_version?: number;
    uploaded_at?: string | null;
    uploader?: { name?: string | null } | null;
    reviews?: Array<{
        id: number;
        review_status: string;
        review_comment?: string | null;
        reviewed_at?: string | null;
        reviewer?: { name?: string | null } | null;
    }>;
    versions?: EvidenceFileVersionData[];
}

type DiffLine = { type: 'add' | 'remove' | 'same'; text: string };

function diffLines(a: string, b: string): DiffLine[] {
    const aLines = (a ?? '').split(/\r?\n/);
    const bLines = (b ?? '').split(/\r?\n/);
    // LCS-based line diff
    const m = aLines.length;
    const n = bLines.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            dp[i][j] = aLines[i] === bLines[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
    }
    const out: DiffLine[] = [];
    let i = 0;
    let j = 0;
    while (i < m && j < n) {
        if (aLines[i] === bLines[j]) {
            out.push({ type: 'same', text: aLines[i] });
            i++;
            j++;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
            out.push({ type: 'remove', text: aLines[i++] });
        } else {
            out.push({ type: 'add', text: bLines[j++] });
        }
    }
    while (i < m) out.push({ type: 'remove', text: aLines[i++] });
    while (j < n) out.push({ type: 'add', text: bLines[j++] });
    return out;
}

function DiffBlock({ previous, current }: { previous: string; current: string }) {
    const lines = diffLines(previous, current);
    return (
        <pre className="mt-2 overflow-x-auto rounded-lg border border-border/70 bg-muted/20 p-3 text-xs leading-relaxed">
            {lines.map((line, idx) => {
                if (line.type === 'add') {
                    return (
                        <div key={idx} className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400">
                            <Plus className="mt-0.5 size-3 shrink-0" />
                            <span>{line.text || '\u00a0'}</span>
                        </div>
                    );
                }
                if (line.type === 'remove') {
                    return (
                        <div key={idx} className="flex items-start gap-2 text-rose-700 dark:text-rose-400">
                            <Minus className="mt-0.5 size-3 shrink-0" />
                            <span>{line.text || '\u00a0'}</span>
                        </div>
                    );
                }
                return (
                    <div key={idx} className="flex items-start gap-2 text-muted-foreground">
                        <span className="mt-0.5 size-3 shrink-0" />
                        <span>{line.text || '\u00a0'}</span>
                    </div>
                );
            })}
        </pre>
    );
}

function formatBytes(bytes?: number | null) {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function EvidenceReviewDialog({
    evidenceFile,
    compact = false,
}: {
    evidenceFile: EvidenceFileReviewData;
    compact?: boolean;
}) {
    const form = useForm({
        review_status: evidenceFile.review_status ?? 'pending',
        review_comment: '',
    });

    const versions = (evidenceFile.versions ?? []).slice().sort((a, b) => b.version_number - a.version_number);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={compact ? 'ghost' : 'outline'} size={compact ? 'icon' : 'sm'} className={compact ? '' : 'w-full'}>
                    <FileSearch className="size-4" />
                    {compact ? <span className="sr-only">Review evidence</span> : 'Review evidence'}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Evidence review</DialogTitle>
                    <DialogDescription>Approve, reject, or keep this file pending. Reviews update the evidence status and trigger rescoring.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="rounded-xl border border-border/70 bg-muted/15 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="font-medium">{evidenceFile.original_name}</p>
                                <p className="text-sm text-muted-foreground">
                                    Uploaded by {evidenceFile.uploader?.name ?? 'Unknown'} · {formatLongDateTime(evidenceFile.uploaded_at)}
                                    {evidenceFile.current_version ? <> · v{evidenceFile.current_version}</> : null}
                                </p>
                            </div>
                            <StatusBadge value={evidenceFile.review_status} />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label id="review-status-label" className="text-sm font-medium">Decision</label>
                            <Select value={form.data.review_status} onValueChange={(value) => form.setData('review_status', value)}>
                                <SelectTrigger aria-labelledby="review-status-label" aria-invalid={!!form.errors.review_status} aria-describedby={form.errors.review_status ? 'review-status-error' : undefined}>
                                    <SelectValue placeholder="Select review status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError id="review-status-error" message={form.errors.review_status} />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="review-comment" className="text-sm font-medium">Reviewer comment</label>
                            <Textarea
                                id="review-comment"
                                value={form.data.review_comment}
                                onChange={(event) => form.setData('review_comment', event.target.value)}
                                placeholder="Explain why the evidence was approved, rejected, or left pending."
                                aria-invalid={!!form.errors.review_comment}
                                aria-describedby={form.errors.review_comment ? 'review-comment-error' : undefined}
                            />
                            <InputError id="review-comment-error" message={form.errors.review_comment} />
                        </div>
                    </div>

                    {versions.length > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <History className="size-4 text-[#14417A]" />
                                <p className="text-sm font-medium">Version history</p>
                                <span className="rounded-full bg-[#14417A]/10 px-2 py-0.5 text-xs font-medium text-[#0F2E52]">
                                    {versions.length} {versions.length === 1 ? 'version' : 'versions'}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {versions.map((version, idx) => {
                                    const previous = versions[idx + 1];
                                    return (
                                        <div key={version.id} className="rounded-xl border border-border/70 bg-background p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        v{version.version_number} · {version.original_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Uploaded by {version.uploader?.name ?? 'Unknown'} · {formatLongDateTime(version.uploaded_at)}
                                                        {version.file_size ? <> · {formatBytes(version.file_size)}</> : null}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge value={version.review_status} />
                                                    <Button asChild variant="ghost" size="icon">
                                                        <a href={route('evidence.versions.download', [evidenceFile.id, version.id])}>
                                                            <Download className="size-4" />
                                                            <span className="sr-only">Download version {version.version_number}</span>
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                            {version.review_comment ? (
                                                <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                                                    <MessageSquareText className="mt-0.5 size-4" />
                                                    <span className="whitespace-pre-wrap">{version.review_comment}</span>
                                                </div>
                                            ) : null}
                                            {previous && (previous.review_comment || version.review_comment) ? (
                                                <div className="mt-3">
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Diff vs v{previous.version_number}
                                                    </p>
                                                    <DiffBlock
                                                        previous={previous.review_comment ?? ''}
                                                        current={version.review_comment ?? ''}
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}

                    <div className="space-y-3">
                        <p className="text-sm font-medium">Review history</p>
                        {(evidenceFile.reviews ?? []).length > 0 ? (
                            evidenceFile.reviews?.map((review) => (
                                <div key={review.id} className="rounded-xl border border-border/70 bg-background p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-medium">{review.reviewer?.name ?? 'Reviewer'}</p>
                                            <p className="text-sm text-muted-foreground">{formatLongDateTime(review.reviewed_at)}</p>
                                        </div>
                                        <StatusBadge value={review.review_status} />
                                    </div>
                                    {review.review_comment ? (
                                        <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                                            <MessageSquareText className="mt-0.5 size-4" />
                                            <span className="whitespace-pre-wrap">{review.review_comment}</span>
                                        </div>
                                    ) : null}
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-border/70 bg-muted/10 p-4 text-sm text-muted-foreground">
                                No review history yet. The first reviewer action will appear here.
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => form.post(route('evidence.reviews.store', evidenceFile.id, false))}
                        disabled={form.processing}
                    >
                        {form.data.review_status === 'approved' ? <CheckCheck className="size-4" /> : <Clock3 className="size-4" />}
                        Save review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
