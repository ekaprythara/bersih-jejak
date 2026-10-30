<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

#[Fillable([
    'name',
    'price',
    'estimated_days',
    'status'
])]

class Service extends Model
{
    /** @use HasFactory<\Database\Factories\ServiceFactory> */
    use HasFactory;

    public function scopeActive(Builder $query)
    {
        $query->where("status", true);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'service_id');
    }
}
