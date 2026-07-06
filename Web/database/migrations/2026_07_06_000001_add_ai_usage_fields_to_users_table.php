<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedTinyInteger('ai_resume_match_uses')->default(0)->after('remember_token');
            $table->unsignedTinyInteger('ai_ocr_uses')->default(0)->after('ai_resume_match_uses');
            $table->timestamp('ai_resume_match_used_at')->nullable()->after('ai_ocr_uses');
            $table->timestamp('ai_ocr_used_at')->nullable()->after('ai_resume_match_used_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'ai_resume_match_uses',
                'ai_ocr_uses',
                'ai_resume_match_used_at',
                'ai_ocr_used_at',
            ]);
        });
    }
};
