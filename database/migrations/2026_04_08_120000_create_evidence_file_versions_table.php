<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evidence_file_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evidence_file_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('version_number');
            $table->string('file_name');
            $table->string('original_name');
            $table->string('file_path');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->foreignId('uploaded_by')->nullable();
            $table->timestamp('uploaded_at')->nullable();
            $table->string('review_status')->default('pending');
            $table->longText('review_comment')->nullable();
            $table->timestamps();
            $table->unique(['evidence_file_id', 'version_number']);
        });

        Schema::table('evidence_files', function (Blueprint $table) {
            $table->unsignedInteger('current_version')->default(1)->after('review_status');
        });
    }

    public function down(): void
    {
        Schema::table('evidence_files', function (Blueprint $table) {
            $table->dropColumn('current_version');
        });
        Schema::dropIfExists('evidence_file_versions');
    }
};
