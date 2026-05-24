<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('public_training_acknowledgements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->index();
            $table->foreignId('tenant_id')->index();
            $table->string('full_name');
            $table->timestamp('acknowledged_at')->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('public_training_acknowledgements');
    }
};
