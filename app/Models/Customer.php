<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

#[Fillable([
    'name',
    'email',
    'phone_number',
])]

class Customer extends Model
{
    /** @use HasFactory<\Database\Factories\CustomerFactory> */
    use HasFactory;

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'customer_id');
    }

    public function scopeActive(Builder $query)
    {
        $query->where("status", true);
    }
}
