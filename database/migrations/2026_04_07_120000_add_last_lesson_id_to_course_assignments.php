<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_assignments', function (Blueprint $table) {
            $table->foreignId('last_lesson_id')
                ->nullable()
                ->after('status')
                ->constrained('lessons')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('course_assignments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('last_lesson_id');
        });
    }
};
