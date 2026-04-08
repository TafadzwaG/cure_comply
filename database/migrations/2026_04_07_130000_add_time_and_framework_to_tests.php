<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->foreignId('compliance_framework_id')
                ->nullable()
                ->after('course_id')
                ->constrained('compliance_frameworks')
                ->nullOnDelete();
        });

        Schema::table('test_attempts', function (Blueprint $table) {
            $table->unsignedInteger('time_spent_seconds')->nullable()->after('submitted_at');
        });
    }

    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('compliance_framework_id');
        });

        Schema::table('test_attempts', function (Blueprint $table) {
            $table->dropColumn('time_spent_seconds');
        });
    }
};
