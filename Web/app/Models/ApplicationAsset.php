<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationAsset extends Model
{
    protected $fillable = [
        'internship_id',
        'label',
        'asset_type',
        'asset_kind',
        'status',
        'url',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function internship()
    {
        return $this->belongsTo(Internship::class);
    }
}
