<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->index();
            $table->foreignId('user_id')->unique();
            $table->foreignId('department_id')->nullable()->index();
            $table->string('job_title')->nullable();
            $table->string('branch')->nullable();
            $table->string('employee_number')->nullable();
            $table->string('phone')->nullable();
            $table->string('status')->default('invited');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_profiles');
    }
};
