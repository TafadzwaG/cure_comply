<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('library_files', function (Blueprint $table) {
            $table->foreign('current_policy_version_id')
                ->references('id')
                ->on('library_file_versions')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('library_files', function (Blueprint $table) {
            $table->dropForeign(['current_policy_version_id']);
        });
    }
};
