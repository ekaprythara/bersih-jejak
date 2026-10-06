<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExpenseRequest;
use App\Models\Branch;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
    public function index()
    {
        return inertia('expense', [
            "expenses" => Expense::with(["branch", "user", "expenseCategory"])->get(),
            "branches" => Branch::all(),
            "expenseCategories" => ExpenseCategory::all()
        ]);
    }

    public function store(StoreExpenseRequest $request)
    {
        Expense::create(array_merge(
            $request->validated(),
            ['user_id' => Auth::id()]
        ));

        return redirect()->route('expenses.index')
            ->with('success', 'Pengeluaran berhasil ditambahkan.');
    }
}
