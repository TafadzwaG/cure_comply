<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('last_login_at')->nullable()->after('email_verified_at');
            $table->timestamp('last_password_changed_at')->nullable()->after('last_login_at');
        });

        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->foreignId('manager_id')->nullable()->after('department_id')->index();
            $table->string('employment_type')->nullable()->after('job_title');
            $table->date('start_date')->nullable()->after('employment_type');
            $table->string('risk_level')->nullable()->after('start_date');
            $table->string('alternate_phone')->nullable()->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'manager_id',
                'employment_type',
                'start_date',
                'risk_level',
                'alternate_phone',
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'last_login_at',
                'last_password_changed_at',
            ]);
        });
    }
};
