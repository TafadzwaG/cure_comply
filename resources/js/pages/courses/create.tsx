import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PlatformLayout from '@/layouts/platform-layout';
import { Link, useForm } from '@inertiajs/react';
import { BookOpen, Clock3, Layers3, Plus, ShieldCheck } from 'lucide-react';

export default function CoursesCreate() {
    const form = useForm({
        title: '',
        description: '',
        estimated_minutes: 45,
        status: 'draft',
    });

    const guidanceItems = [
        {
            title: 'Course shell is created',
            description:
                'A reusable training asset is stored and becomes available in the course library.',
            icon: BookOpen,
        },
        {
            title: 'Duration informs planning',
            description:
                'Estimated minutes help admins schedule assignments and progress expectations.',
            icon: Clock3,
        },
        {
            title: 'Modules can be added later',
            description:
                'The course detail page remains the place for module and lesson builder work.',
            icon: Layers3,
        },
        {
            title: 'Publishing stays controlled',
            description:
                'The initial draft state keeps unfinished content out of active assignment flows.',
            icon: ShieldCheck,
        },
    ];

    return (
        <PlatformLayout>
            <div className="space-y-6">
                <Card className="rounded-md border-border/60 shadow-none">
                    <CardContent className="rounded-md bg-gradient-to-r from-[#0F2E52] via-[#123867] to-[#14417A] p-6 text-white">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-2xl space-y-2">
                                <div className="inline-flex items-center rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-white">
                                    PrivacyCure Course Builder
                                </div>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Add a new training course
                                </h1>
                                <p className="text-sm text-white/80">
                                    Create a new privacy, compliance, or cyber awareness course.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-md border-white/20 bg-white/10 text-white hover:bg-white/15"
                                >
                                    <Link href={route('courses.index')}>Back to Courses</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="rounded-md border-border/60 shadow-none">
                        <CardHeader className="border-b border-border/60">
                            <CardTitle className="text-base font-medium">Course Details</CardTitle>
                            <CardDescription>
                                Set the title, summary, and estimated duration for this training course.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5 p-6">
                            <div className="space-y-2">
                                <label htmlFor="title" className="text-sm font-medium">
                                    Course title
                                </label>
                                <Input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    placeholder="e.g. POPIA Awareness Essentials"
                                    className="rounded-md border-border/60"
                                />
                                {form.errors.title ? (
                                    <p className="text-sm text-destructive">{form.errors.title}</p>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium">
                                    Course overview
                                </label>
                                <Textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    placeholder="Summarize the purpose, audience, and learning outcome for this course."
                                    className="min-h-[140px] rounded-md border-border/60"
                                />
                                {form.errors.description ? (
                                    <p className="text-sm text-destructive">{form.errors.description}</p>
                                ) : null}
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="estimated_minutes" className="text-sm font-medium">
                                        Estimated duration
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="estimated_minutes"
                                            type="number"
                                            min={1}
                                            value={form.data.estimated_minutes}
                                            onChange={(e) =>
                                                form.setData('estimated_minutes', Number(e.target.value))
                                            }
                                            placeholder="45"
                                            className="rounded-md border-border/60 pr-14"
                                        />
                                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                                            mins
                                        </span>
                                    </div>
                                    {form.errors.estimated_minutes ? (
                                        <p className="text-sm text-destructive">
                                            {form.errors.estimated_minutes}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <span className="text-sm font-medium">Initial status</span>
                                    <div className="flex h-10 items-center rounded-md border border-border/60 bg-muted/20 px-3 text-sm font-medium">
                                        Draft
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        New courses start as draft until content is complete.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-md border border-border/60 bg-muted/20 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#14417A]/10 bg-[#14417A]/5">
                                        <BookOpen className="h-4 w-4 text-[#14417A]" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Quick note</p>
                                        <p className="text-sm text-muted-foreground">
                                            After creating the course, you can add modules, lessons, and linked tests
                                            from the course detail page.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button
                                    type="button"
                                    disabled={form.processing}
                                    onClick={() => form.post(route('courses.store'))}
                                    className="rounded-md bg-[#14417A] text-white hover:bg-[#0F2E52]"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {form.processing ? 'Creating...' : 'Create Course'}
                                </Button>

                                <Button asChild variant="outline" className="rounded-md border-border/60">
                                    <Link href={route('courses.index')}>Cancel</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="rounded-md border-border/60 shadow-none">
                            <CardHeader className="border-b border-border/60">
                                <CardTitle className="text-base font-medium">What happens next</CardTitle>
                                <CardDescription>
                                    The course becomes the parent structure for modules, lessons, and linked tests.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3 p-6">
                                {guidanceItems.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <div
                                            key={item.title}
                                            className="flex items-start gap-3 rounded-md border border-border/60 p-4"
                                        >
                                            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#14417A]/10 bg-[#14417A]/5">
                                                <Icon className="h-4 w-4 text-[#14417A]" />
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{item.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        <Card className="rounded-md border-border/60 shadow-none">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#14417A]/10 bg-[#14417A]/5">
                                        <ShieldCheck className="h-4 w-4 text-[#14417A]" />
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Recommended workflow</p>
                                        <p className="text-sm text-muted-foreground">
                                            Create the course first, then build modules and lessons, and only publish
                                            once tests and content are ready.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PlatformLayout>
    );
}