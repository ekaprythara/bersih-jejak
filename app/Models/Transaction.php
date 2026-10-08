<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    "customer_id",
    "transaction_date",
    "pickup_date",
    "service_id",
    "transaction_status_id",
    "payment_status_id",
    "payment_method_id",
    "description",
    "before_image_url",
    "before_image_public_id",
    "after_image_url",
    "after_image_public_id",
])]

class Transaction extends Model
{
    /** @use HasFactory<\Database\Factories\TransactionFactory> */
    use HasFactory;

    /**
     * Relasi ke User (Admin yang mencatat transaksi)
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Relasi ke Service (Layanan yang dipilih)
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Relasi ke TransactionStatus (Status proses transaksi)
     */
    public function transactionStatus()
    {
        return $this->belongsTo(TransactionStatus::class);
    }

    /**
     * Relasi ke PaymentStatus (Status pembayaran)
     */
    public function paymentStatus()
    {
        return $this->belongsTo(PaymentStatus::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }
}
