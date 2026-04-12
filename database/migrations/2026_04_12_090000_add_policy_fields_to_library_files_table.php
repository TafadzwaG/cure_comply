<?php

use App\Enums\PolicyState;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('library_files', function (Blueprint $table) {
            $table->boolean('is_policy')->default(false)->after('uploaded_by');
            $table->string('policy_state')->default(PolicyState::Draft->value)->after('is_policy');
            $table->unsignedInteger('current_policy_version_number')->nullable()->after('policy_state');
            $table->unsignedBigInteger('current_policy_version_id')->nullable()->after('current_policy_version_number');

            $table->index(['is_policy', 'policy_state']);
            $table->index('current_policy_version_id');
        });
    }

    public function down(): void
    {
        Schema::table('library_files', function (Blueprint $table) {
            $table->dropIndex(['is_policy', 'policy_state']);
            $table->dropIndex(['current_policy_version_id']);
            $table->dropColumn([
                'is_policy',
                'policy_state',
                'current_policy_version_number',
                'current_policy_version_id',
            ]);
        });
    }
};
