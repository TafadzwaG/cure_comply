<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('compliance_submission_assignments')) {
            Schema::create('compliance_submission_assignments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->index();
                $table->foreignId('compliance_submission_id');
                $table->foreignId('assigned_to_user_id');
                $table->foreignId('assigned_by')->nullable();
                $table->timestamp('assigned_at')->nullable();
                $table->timestamps();

                $table->unique(['compliance_submission_id', 'assigned_to_user_id'], 'submission_assignments_unique_user');
                $table->index(['assigned_to_user_id', 'tenant_id'], 'submission_assignments_user_tenant_idx');
            });
        }

        Schema::table('compliance_submission_assignments', function (Blueprint $table) {
            $table->foreign('compliance_submission_id', 'sub_assignments_submission_fk')
                ->references('id')
                ->on('compliance_submissions')
                ->cascadeOnDelete();
            $table->foreign('assigned_to_user_id', 'sub_assignments_user_fk')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
            $table->foreign('assigned_by', 'sub_assignments_assigner_fk')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compliance_submission_assignments');
    }
};
