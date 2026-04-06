<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compliance_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compliance_section_id')->index();
            $table->string('code')->nullable();
            $table->longText('question_text');
            $table->string('answer_type');
            $table->decimal('weight', 8, 2)->default(1);
            $table->boolean('requires_evidence')->default(false);
            $table->text('guidance_text')->nullable();
            $table->unsignedInteger('sort_order')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compliance_questions');
    }
};
