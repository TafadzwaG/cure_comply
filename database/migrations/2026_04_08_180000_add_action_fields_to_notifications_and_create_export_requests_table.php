<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_notifications', function (Blueprint $table) {
            $table->string('action_url')->nullable()->after('message');
            $table->json('meta')->nullable()->after('action_url');
        });

        Schema::create('export_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->index();
            $table->foreignId('user_id')->index();
            $table->string('source');
            $table->string('format', 20);
            $table->string('status', 20)->default('queued');
            $table->json('filters')->nullable();
            $table->json('payload')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_path')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('export_requests');

        Schema::table('app_notifications', function (Blueprint $table) {
            $table->dropColumn(['action_url', 'meta']);
        });
    }
};
