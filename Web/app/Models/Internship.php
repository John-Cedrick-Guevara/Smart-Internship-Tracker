<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Internship extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'company_email',
        'position',
        'location',
        'duration',
        'url',
        'status',
        'is_paid',
        'last_activity_at',
        'resume_match_result',
        'resume_match_analyzed_at',
    ];

    protected $casts = [
        'is_paid' => 'boolean',
        'last_activity_at' => 'datetime',
        'resume_match_result' => 'array',
        'resume_match_analyzed_at' => 'datetime',
    ];

    public function notes()
    {
        return $this->hasMany(Note::class);
    }
    
    public function timeline()
    {
        return $this->hasMany(TimelineEvent::class);
    }

    public function interviewQuestions()
    {
        return $this->hasMany(InterviewQuestion::class);
    }

    public function assets()
    {
        return $this->hasMany(ApplicationAsset::class);
    }

    public function markActivity(): void
    {
        $this->forceFill(['last_activity_at' => now()])->saveQuietly();
    }
}
