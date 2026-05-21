<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Internship extends Model
{
    //
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
    ];

    public function notes()
    {
        return $this->hasMany(Note::class);
    }
    
    public function timeline()
    {
        return $this->hasMany(TimelineEvent::class);
    }
}
