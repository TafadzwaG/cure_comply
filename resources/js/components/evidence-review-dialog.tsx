import InputError from '@/components/input-error';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatLongDateTime } from '@/lib/date';
import { useForm } from '@inertiajs/react';
import { CheckCheck, Clock3, FileSearch, MessageSquareText } from 'lucide-react';

interface EvidenceFileReviewData {
    id: number;
    original_name: string;
    review_status: string;
    uploaded_at?: string | null;
    uploader?: { name?: string | null } | null;
    reviews?: Array<{
        id: number;
        review_status: string;
        review_comment?: string | null;
        reviewed_at?: string | null;
        reviewer?: { name?: string | null } | null;
    }>;
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

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={compact ? 'ghost' : 'outline'} size={compact ? 'icon' : 'sm'} className={compact ? '' : 'w-full'}>
                    <FileSearch className="size-4" />
                    {compact ? <span className="sr-only">Review evidence</span> : 'Review evidence'}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
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
                                            <span>{review.review_comment}</span>
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
