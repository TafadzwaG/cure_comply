<?php

use App\Enums\PolicyAssignmentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('policy_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('library_file_id')->constrained()->cascadeOnDelete();
            $table->foreignId('library_file_version_id')->constrained('library_file_versions')->cascadeOnDelete();
            $table->foreignId('assigned_to_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('source_type');
            $table->foreignId('source_department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->date('due_date');
            $table->string('status')->default(PolicyAssignmentStatus::Pending->value);
            $table->timestamp('first_viewed_at')->nullable();
            $table->timestamp('last_viewed_at')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('last_reminded_at')->nullable();
            $table->unsignedInteger('view_count')->default(0);
            $table->timestamps();

            $table->unique(['library_file_version_id', 'assigned_to_user_id'], 'policy_assignments_version_user_unique');
            $table->index(['tenant_id', 'status', 'due_date']);
            $table->index(['assigned_to_user_id', 'status']);
            $table->index(['library_file_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('policy_assignments');
    }
};
