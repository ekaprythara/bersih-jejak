<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index()
    {
        return inertia("transaction", [
            "transactions" => Transaction::with(["customer", "service", "transactionStatus", "paymentStatus", "paymentMethod"])->get(),
            "customers" => Customer::get(['id', 'name'])
        ]);
    }
}
