<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TimelineEvent extends Model
{
    //
    protected $fillable = [
        'date',
        'event',
        'reminder',
    ];
    public function internship()
    {
        return $this->belongsTo(Internship::class);
    }
}
