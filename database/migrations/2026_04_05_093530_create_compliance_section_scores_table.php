<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compliance_section_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compliance_submission_id')->index();
            $table->foreignId('compliance_section_id')->index();
            $table->decimal('score', 8, 2);
            $table->string('rating');
            $table->timestamp('calculated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compliance_section_scores');
    }
};
