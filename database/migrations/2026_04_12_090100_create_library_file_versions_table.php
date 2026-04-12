<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_file_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('library_file_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('version_number');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->string('original_name');
            $table->string('file_path');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('file_size')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();

            $table->unique(['library_file_id', 'version_number']);
            $table->index(['library_file_id', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_file_versions');
    }
};
