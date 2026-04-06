<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compliance_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->index();
            $table->foreignId('compliance_submission_id')->index();
            $table->foreignId('compliance_question_id')->index();
            $table->string('answer_value')->nullable();
            $table->longText('answer_text')->nullable();
            $table->longText('comment_text')->nullable();
            $table->decimal('response_score', 8, 2)->nullable();
            $table->string('status')->default('draft');
            $table->foreignId('answered_by')->nullable()->index();
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compliance_responses');
    }
};
