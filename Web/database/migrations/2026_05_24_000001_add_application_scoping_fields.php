<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('internships', function (Blueprint $table) {
            $table->timestamp('last_activity_at')->nullable()->after('is_paid');
            $table->json('resume_match_result')->nullable()->after('last_activity_at');
            $table->timestamp('resume_match_analyzed_at')->nullable()->after('resume_match_result');
        });

        Schema::table('interview_questions', function (Blueprint $table) {
            $table->foreignId('internship_id')
                ->nullable()
                ->after('id')
                ->constrained()
                ->nullOnDelete();
            $table->string('category')->default('General')->after('question');
            $table->text('strategic_tip')->nullable()->after('category');
            $table->json('talking_points')->nullable()->after('strategic_tip');
            $table->boolean('is_practiced')->default(false)->after('talking_points');
            $table->text('answer_notes')->nullable()->after('is_practiced');
        });

        Schema::create('application_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('internship_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->string('asset_type')->default('custom');
            $table->string('asset_kind')->default('link');
            $table->string('status')->default('not_added');
            $table->text('url')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_path')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_assets');

        Schema::table('interview_questions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('internship_id');
            $table->dropColumn([
                'category',
                'strategic_tip',
                'talking_points',
                'is_practiced',
                'answer_notes',
            ]);
        });

        Schema::table('internships', function (Blueprint $table) {
            $table->dropColumn([
                'last_activity_at',
                'resume_match_result',
                'resume_match_analyzed_at',
            ]);
        });
    }
};
