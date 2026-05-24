<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InterviewQuestion extends Model
{
  use HasFactory;

  protected $fillable = [
    'internship_id',
    'question',
    'category',
    'strategic_tip',
    'talking_points',
    'is_practiced',
    'answer_notes',
    'source',
  ];

  protected $casts = [
    'talking_points' => 'array',
    'is_practiced' => 'boolean',
  ];

  public function internship()
  {
    return $this->belongsTo(Internship::class);
  }
}
