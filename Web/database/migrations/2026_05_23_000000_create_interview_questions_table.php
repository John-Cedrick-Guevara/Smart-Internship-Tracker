<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up()
  {
    Schema::create('interview_questions', function (Blueprint $table) {
      $table->id();
      $table->text('question');
      $table->string('company_name')->nullable();
      $table->string('position')->nullable();
      $table->string('source')->nullable();
      $table->timestamps();
    });
  }

  public function down()
  {
    Schema::dropIfExists('interview_questions');
  }
};
