<?php

namespace Database\Seeders;

use App\Enums\CourseStatus;
use App\Enums\LessonStatus;
use App\Enums\TestQuestionType;
use App\Enums\TestStatus;
use App\Models\Course;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TrainingLibrarySeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->catalogue() as $courseData) {
            $course = Course::query()->updateOrCreate(
                ['slug' => $courseData['slug']],
                [
                    'title' => $courseData['title'],
                    'description' => $courseData['description'],
                    'status' => CourseStatus::Published,
                    'estimated_minutes' => $courseData['estimated_minutes'],
                    'created_by' => null,
                ],
            );

            $this->resetCourseContent($course->id);
            $this->seedModules($course->id, $courseData['modules']);
            $this->seedTest($course->id, $courseData['test']);
        }
    }

    protected function resetCourseContent(int $courseId): void
    {
        $moduleIds = DB::table('course_modules')->where('course_id', $courseId)->pluck('id');
        $testIds = DB::table('tests')->where('course_id', $courseId)->pluck('id');
        $questionIds = DB::table('questions')->whereIn('test_id', $testIds)->pluck('id');

        if ($questionIds->isNotEmpty()) {
            DB::table('question_options')->whereIn('question_id', $questionIds)->delete();
            DB::table('questions')->whereIn('id', $questionIds)->delete();
        }

        if ($testIds->isNotEmpty()) {
            DB::table('tests')->whereIn('id', $testIds)->delete();
        }

        if ($moduleIds->isNotEmpty()) {
            DB::table('lessons')->whereIn('course_module_id', $moduleIds)->delete();
            DB::table('course_modules')->whereIn('id', $moduleIds)->delete();
        }
    }

    protected function seedModules(int $courseId, array $modules): void
    {
        foreach ($modules as $moduleIndex => $moduleData) {
            $moduleId = DB::table('course_modules')->insertGetId([
                'course_id' => $courseId,
                'title' => $moduleData['title'],
                'description' => $moduleData['description'],
                'sort_order' => $moduleIndex + 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($moduleData['lessons'] as $lessonIndex => $lessonTitle) {
                DB::table('lessons')->insert([
                    'course_module_id' => $moduleId,
                    'title' => $lessonTitle,
                    'content_type' => 'text',
                    'content_body' => $lessonTitle.' training content.',
                    'file_path' => null,
                    'video_url' => null,
                    'sort_order' => $lessonIndex + 1,
                    'estimated_minutes' => 8 + $lessonIndex,
                    'status' => LessonStatus::Published->value,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    protected function seedTest(int $courseId, array $testData): void
    {
        $testId = DB::table('tests')->insertGetId([
            'course_id' => $courseId,
            'title' => $testData['title'],
            'description' => $testData['description'],
            'pass_mark' => $testData['pass_mark'],
            'time_limit_minutes' => $testData['time_limit_minutes'],
            'max_attempts' => 2,
            'status' => TestStatus::Published->value,
            'created_by' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($testData['questions'] as $questionIndex => $questionData) {
            $questionId = DB::table('questions')->insertGetId([
                'test_id' => $testId,
                'question_type' => TestQuestionType::SingleChoice->value,
                'question_text' => $questionData['text'],
                'marks' => 1,
                'sort_order' => $questionIndex + 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($questionData['options'] as $optionIndex => $optionData) {
                DB::table('question_options')->insert([
                    'question_id' => $questionId,
                    'option_text' => $optionData[0],
                    'is_correct' => $optionData[1],
                    'sort_order' => $optionIndex + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    protected function catalogue(): array
    {
        return [
            $this->course('Data Protection Fundamentals', 'data-protection-fundamentals', 'Core privacy principles and safe data handling for all staff.', ['Privacy essentials', 'Operational safeguards'], ['What personal data means', 'Lawful and fair handling', 'Minimisation and retention', 'Sharing data safely']),
            $this->course('Cyber Security Awareness for Staff', 'cyber-security-awareness-for-staff', 'Everyday cyber risk awareness, phishing defence, and safe online habits.', ['Threat awareness', 'Safe daily habits'], ['Phishing red flags', 'Social engineering tactics', 'Password and MFA hygiene', 'Secure browsing and downloads']),
            $this->course('Secure Password and Access Management', 'secure-password-and-access-management', 'Credential discipline, least privilege, and account governance.', ['Account security basics', 'Access governance'], ['Strong passphrases', 'Why shared accounts create risk', 'Least privilege in practice', 'Removing stale access promptly']),
            $this->course('Incident Reporting and Escalation', 'incident-reporting-and-escalation', 'Recognising incidents early and escalating them through the correct channels.', ['What counts as an incident', 'Escalation discipline'], ['Security events vs incidents', 'Examples of reportable events', 'Who to notify and when', 'Evidence preservation basics']),
            $this->course('Handling Personal Data Requests', 'handling-personal-data-requests', 'Recognising, routing, and supporting privacy rights requests.', ['Rights request recognition', 'Operational response'], ['Common rights requests', 'Recognising informal requests', 'Escalating requests internally', 'Avoiding over-disclosure']),
            $this->course('Records Retention and Disposal', 'records-retention-and-disposal', 'Keeping records only as long as needed and disposing of them safely.', ['Retention discipline', 'Secure disposal'], ['Why retention schedules matter', 'Retention review points', 'Secure deletion and destruction', 'Documenting disposal actions']),
            $this->course('Email and Communication Security', 'email-and-communication-security', 'Secure messaging, attachment handling, and communication channel discipline.', ['Safe messaging behaviour', 'Protective controls'], ['Suspicious message cues', 'Approved communication tools', 'Verifying recipients', 'Protecting attachments']),
            $this->course('Remote Work and Device Security', 'remote-work-and-device-security', 'Secure remote work, device care, and response to lost assets.', ['Remote work basics', 'Device protection'], ['Safe network use', 'Workspace privacy', 'Screen lock and updates', 'Lost device response']),
            $this->course('Third-Party Risk and Vendor Data Handling', 'third-party-risk-and-vendor-data-handling', 'Managing vendor due diligence, contracts, and data sharing controls.', ['Vendor due diligence', 'Ongoing control'], ['Why due diligence matters', 'Questions for vendors', 'Contractual controls', 'Reviewing vendor access']),
            $this->course('Compliance Evidence and Audit Readiness', 'compliance-evidence-and-audit-readiness', 'Preparing evidence that stands up to internal and external review.', ['Evidence quality', 'Review readiness'], ['Strong evidence characteristics', 'Common evidence gaps', 'Mapping evidence to controls', 'Responding to feedback']),
        ];
    }

    protected function course(string $title, string $slug, string $description, array $moduleTitles, array $lessonTitles): array
    {
        return [
            'title' => $title,
            'slug' => $slug,
            'description' => $description,
            'estimated_minutes' => 40,
            'modules' => [
                [
                    'title' => $moduleTitles[0],
                    'description' => $title.' module one',
                    'lessons' => [$lessonTitles[0], $lessonTitles[1]],
                ],
                [
                    'title' => $moduleTitles[1],
                    'description' => $title.' module two',
                    'lessons' => [$lessonTitles[2], $lessonTitles[3]],
                ],
            ],
            'test' => [
                'title' => $title.' Assessment',
                'description' => 'Knowledge check for '.$title.'.',
                'pass_mark' => 75,
                'time_limit_minutes' => 20,
                'questions' => [
                    $this->question('Which response best reflects '.$title.'?', 'Choose the approved control or behaviour.'),
                    $this->question('What should happen first in '.$title.' scenarios?', 'Follow the defined process before taking shortcuts.'),
                    $this->question('Why does '.$title.' matter to the business?', 'It reduces risk and improves compliance readiness.'),
                ],
            ],
        ];
    }

    protected function question(string $text, string $correctOption): array
    {
        return [
            'text' => $text,
            'options' => [
                [$correctOption, true],
                ['Ignore the control and proceed informally.', false],
                ['Use a personal workaround outside policy.', false],
            ],
        ];
    }
}
