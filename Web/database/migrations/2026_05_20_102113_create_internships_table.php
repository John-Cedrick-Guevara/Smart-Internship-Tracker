<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('internships', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('company_name');
            $table->string('company_email');
            $table->string('position');
            $table->string('location');
            $table->string('duration')->nullable();
            $table->string('url')->nullable();

            // Fixed: Changed from string to enum
            $table->enum('status', ['wishlist', 'applied', 'interviewing', 'offer', 'rejected'])->default('wishlist');
            $table->boolean('is_paid')->default(true);

            // Fixed: Added tracking timestamps
            $table->timestamps();
        });


        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('internship_id')->constrained()->cascadeOnDelete();

            $table->string('title');
            $table->text('content')->nullable();
            $table->timestamps();
        });

        Schema::create('timeline_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('internship_id')->constrained()->cascadeOnDelete();

            $table->timestamp('date');
            $table->string('event')->nullable();
            $table->string('reminder')->nullable();
            $table->timestamps();
        });
    }



    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timeline_events');
        Schema::dropIfExists('notes');
        Schema::dropIfExists('internships');
    }
};
