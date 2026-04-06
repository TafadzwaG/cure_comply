import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PlatformLayout from '@/layouts/platform-layout';

export default function CourseShow({ course }: { course: any }) {
    return (
        <PlatformLayout>
            <PageHeader title={course.title} description="Module and lesson builder view for the selected course." />
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">Course Outline <StatusBadge value={course.status} /></CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {course.modules?.map((module: any) => (
                            <AccordionItem key={module.id} value={String(module.id)}>
                                <AccordionTrigger>{module.title}</AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-3">
                                    {module.lessons?.map((lesson: any) => (
                                        <div key={lesson.id} className="rounded-2xl border border-border/60 p-4">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium">{lesson.title}</p>
                                                <StatusBadge value={lesson.status} />
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground">{lesson.content_type}</p>
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </PlatformLayout>
    );
}
