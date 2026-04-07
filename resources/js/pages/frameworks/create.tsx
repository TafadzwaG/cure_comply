import { CreateGuidancePanel } from '@/components/create-guidance-panel';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import PlatformLayout from '@/layouts/platform-layout';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookCopy, Boxes, Plus, ShieldCheck, TextSearch } from 'lucide-react';
import { toast } from 'sonner';

export default function FrameworksCreate() {
    const form = useForm({ name: '', version: '1.0', description: '', status: 'draft' });

    const submit = () => {
        form.post(route('frameworks.store'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Framework created successfully.'),
            onError: () => toast.error('Please fix the errors and try again.'),
        });
    };

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Add New Framework"
                    description="Create a compliance framework that will later hold sections, scored questions, and guidance."
                />

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-border/70 shadow-none">
                        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-[#14417A]/[0.06] to-transparent">
                            <CardTitle className="flex items-center gap-2 text-[#0F2E52] dark:text-blue-200">
                                <ShieldCheck className="h-4 w-4" />
                                Framework details
                            </CardTitle>
                            <CardDescription>
                                Provide a clear name, version, and summary so the framework is easy to identify later.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5 p-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Framework name</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="e.g. GDPR 2024"
                                    />
                                    <InputError message={form.errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="version">Version</Label>
                                    <Input
                                        id="version"
                                        value={form.data.version}
                                        onChange={(e) => form.setData('version', e.target.value)}
                                        placeholder="1.0"
                                    />
                                    <InputError message={form.errors.version} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Explain the intent and scope of this framework"
                                    className="min-h-[140px]"
                                />
                                <InputError message={form.errors.description} />
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={form.data.status}
                                    onValueChange={(value) => form.setData('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.status} />
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <Button
                                    onClick={submit}
                                    disabled={form.processing}
                                    className="bg-[#14417A] text-white hover:bg-[#0F2E52]"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {form.processing ? 'Creating…' : 'Create Framework'}
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href={route('frameworks.index')}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Frameworks
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <CreateGuidancePanel
                        title="What happens next"
                        description="The framework becomes the parent structure for sections and response scoring."
                        items={[
                            { title: 'Framework shell is stored', description: 'The framework is added to the builder library and becomes selectable later.', icon: BookCopy },
                            { title: 'Sections come next', description: 'You can use the framework detail view to organize controls into weighted sections.', icon: Boxes },
                            { title: 'Question bank is attached later', description: 'Compliance questions and answer types are added after the framework exists.', icon: TextSearch },
                            { title: 'Publishing stays deliberate', description: 'Keeping the framework as draft avoids accidental use in submissions.', icon: ShieldCheck },
                        ]}
                    />
                </div>
            </div>
        </PlatformLayout>
    );
}
