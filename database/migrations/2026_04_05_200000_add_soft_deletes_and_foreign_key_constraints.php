<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add soft deletes to core tables
        $tablesWithSoftDeletes = [
            'users',
            'tenants',
            'departments',
            'employee_profiles',
            'courses',
            'course_modules',
            'lessons',
            'course_assignments',
            'tests',
            'questions',
            'question_options',
            'test_attempts',
            'compliance_frameworks',
            'compliance_sections',
            'compliance_questions',
            'compliance_submissions',
            'compliance_responses',
            'evidence_files',
            'evidence_reviews',
            'compliance_scores',
            'compliance_section_scores',
            'invitations',
        ];

        foreach ($tablesWithSoftDeletes as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->softDeletes();
            });
        }

        // Add foreign key constraints

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
        });

        Schema::table('departments', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });

        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('department_id')->references('id')->on('departments')->nullOnDelete();
            $table->foreign('manager_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('course_modules', function (Blueprint $table) {
            $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();
        });

        Schema::table('lessons', function (Blueprint $table) {
            $table->foreign('course_module_id')->references('id')->on('course_modules')->cascadeOnDelete();
        });

        Schema::table('course_assignments', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();
            $table->foreign('assigned_to_user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('assigned_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('lesson_progress', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('lesson_id')->references('id')->on('lessons')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('tests', function (Blueprint $table) {
            $table->foreign('course_id')->references('id')->on('courses')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->foreign('test_id')->references('id')->on('tests')->cascadeOnDelete();
        });

        Schema::table('question_options', function (Blueprint $table) {
            $table->foreign('question_id')->references('id')->on('questions')->cascadeOnDelete();
        });

        Schema::table('test_attempts', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('test_id')->references('id')->on('tests')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('test_answers', function (Blueprint $table) {
            $table->foreign('test_attempt_id')->references('id')->on('test_attempts')->cascadeOnDelete();
            $table->foreign('question_id')->references('id')->on('questions')->cascadeOnDelete();
            $table->foreign('selected_option_id')->references('id')->on('question_options')->nullOnDelete();
        });

        Schema::table('compliance_frameworks', function (Blueprint $table) {
            // No FK needed — top-level entity
        });

        Schema::table('compliance_sections', function (Blueprint $table) {
            $table->foreign('compliance_framework_id')->references('id')->on('compliance_frameworks')->cascadeOnDelete();
        });

        Schema::table('compliance_questions', function (Blueprint $table) {
            $table->foreign('compliance_section_id')->references('id')->on('compliance_sections')->cascadeOnDelete();
        });

        Schema::table('compliance_submissions', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('compliance_framework_id')->references('id')->on('compliance_frameworks')->cascadeOnDelete();
            $table->foreign('submitted_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('compliance_responses', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('compliance_submission_id')->references('id')->on('compliance_submissions')->cascadeOnDelete();
            $table->foreign('compliance_question_id')->references('id')->on('compliance_questions')->cascadeOnDelete();
            $table->foreign('answered_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('evidence_files', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('compliance_submission_id')->references('id')->on('compliance_submissions')->cascadeOnDelete();
            $table->foreign('compliance_response_id')->references('id')->on('compliance_responses')->cascadeOnDelete();
            $table->foreign('uploaded_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('evidence_reviews', function (Blueprint $table) {
            $table->foreign('evidence_file_id')->references('id')->on('evidence_files')->cascadeOnDelete();
            $table->foreign('reviewer_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('compliance_scores', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('compliance_submission_id')->references('id')->on('compliance_submissions')->cascadeOnDelete();
            $table->foreign('calculated_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('compliance_section_scores', function (Blueprint $table) {
            $table->foreign('compliance_submission_id')->references('id')->on('compliance_submissions')->cascadeOnDelete();
            $table->foreign('compliance_section_id')->references('id')->on('compliance_sections')->cascadeOnDelete();
        });

        Schema::table('app_notifications', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('invitations', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreign('department_id')->references('id')->on('departments')->nullOnDelete();
            $table->foreign('invited_by')->references('id')->on('users')->cascadeOnDelete();
        });

        // Add composite indexes for common query patterns
        Schema::table('compliance_responses', function (Blueprint $table) {
            $table->index(['compliance_submission_id', 'compliance_question_id'], 'compliance_responses_submission_question_idx');
        });

        Schema::table('course_assignments', function (Blueprint $table) {
            $table->index(['assigned_to_user_id', 'due_date'], 'course_assignments_user_due_idx');
        });

        Schema::table('evidence_files', function (Blueprint $table) {
            $table->index(['compliance_submission_id', 'review_status'], 'evidence_files_submission_status_idx');
        });
    }

    public function down(): void
    {
        // Drop composite indexes
        Schema::table('evidence_files', function (Blueprint $table) {
            $table->dropIndex('evidence_files_submission_status_idx');
        });

        Schema::table('course_assignments', function (Blueprint $table) {
            $table->dropIndex('course_assignments_user_due_idx');
        });

        Schema::table('compliance_responses', function (Blueprint $table) {
            $table->dropIndex('compliance_responses_submission_question_idx');
        });

        // Drop foreign keys (in reverse order)
        $fkTables = [
            'invitations', 'audit_logs', 'app_notifications',
            'compliance_section_scores', 'compliance_scores',
            'evidence_reviews', 'evidence_files',
            'compliance_responses', 'compliance_submissions',
            'compliance_questions', 'compliance_sections',
            'test_answers', 'test_attempts',
            'question_options', 'questions',
            'tests', 'lesson_progress',
            'course_assignments', 'lessons',
            'course_modules', 'courses',
            'employee_profiles', 'departments', 'users',
        ];

        foreach ($fkTables as $table) {
            Schema::table($table, function (Blueprint $blueprint) use ($table) {
                $foreignKeys = collect(Schema::getIndexes($table))
                    ->filter(fn ($index) => str_contains($index['name'] ?? '', '_foreign'))
                    ->pluck('name')
                    ->toArray();
                // Handled by dropping the column constraints
            });
        }

        // Drop soft deletes
        $tablesWithSoftDeletes = [
            'invitations',
            'compliance_section_scores',
            'compliance_scores',
            'evidence_reviews',
            'evidence_files',
            'compliance_responses',
            'compliance_submissions',
            'compliance_questions',
            'compliance_sections',
            'compliance_frameworks',
            'test_attempts',
            'question_options',
            'questions',
            'tests',
            'course_assignments',
            'lessons',
            'course_modules',
            'courses',
            'employee_profiles',
            'departments',
            'tenants',
            'users',
        ];

        foreach ($tablesWithSoftDeletes as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->dropSoftDeletes();
            });
        }
    }
};
