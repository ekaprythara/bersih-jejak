<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Models\Branch;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Services\CloudinaryService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
    use AuthorizesRequests;


    public function index(Request $request)
    {
        $authenticatedUserBranch = Auth::user()->branch_id;

        $branchId = $request->input("branch_id", "all");
        $expenseCategoryId = $request->input('expense_category_id', "all");
        $minDate = $request->input("min_date", "");
        $maxDate = $request->input("max_date", "");


        $query = Expense::with(["branch", "user", "expenseCategory"]);

        if ($authenticatedUserBranch) {
            $query->where("branch_id", $authenticatedUserBranch);
        } else if ($branchId && $branchId !== "all") {
            $query->where("branch_id", $branchId);
        }

        if ($minDate && $minDate !== "") {
            $query->where('expense_date', ">=", $minDate);
        }
        if ($maxDate && $maxDate !== "") {
            $query->where('expense_date', "<=", $maxDate);
        }

        if ($expenseCategoryId && $expenseCategoryId !== "all") {
            $query->where('expense_category_id', $expenseCategoryId);
        }

        $branchData = $query->latest('expense_date')->get();

        return inertia('expense', [
            "expenses" => $branchData,
            "allBranches" => Branch::get(['id', 'name']),
            "branches" => Branch::active()->get(),
            "branchOptions" => Branch::get(['id', 'name', 'status']), // Spesific for branch dropdown on UpdateExpenseDialog
            "expenseCategories" => ExpenseCategory::all(),
            "filters" => $request->only([
                'min_date',
                'max_date',
                'branch_id',
                'expense_category_id',
            ])
        ]);
    }

    public function store(StoreExpenseRequest $request, CloudinaryService $cloudinaryService)
    {
        // dd($request->all());
        // dd(Auth::user()->is_owner);
        $imageUrl = null;
        $imagePublicId = null;

        // 3. Cek apakah ada file gambar yang di-upload dari form React
        if ($request->hasFile('image')) {
            $uploadedFile = $cloudinaryService->upload($request->file('image'), 'expenses');

            // Ambil URL aman dan Public ID dari respons Cloudinary
            $imageUrl = $uploadedFile['secure_url'] ?? null;
            $imagePublicId = $uploadedFile['public_id'] ?? null;
        }

        // 4. Simpan ke database beserta data gambar dan user_id
        Expense::create(array_merge(
            $request->validated(),
            [
                'user_id' => Auth::id(),
                'image_url' => $imageUrl,             // Sesuaikan dengan nama kolom di database Anda
                'image_public_id' => $imagePublicId, // Penting untuk fitur hapus nanti
            ]
        ));

        return redirect()->route('expenses.index');
    }

    public function update(UpdateExpenseRequest $request, Expense $expense, CloudinaryService $cloudinaryService)
    {
        $this->authorize('update', $expense);

        $validatedData = $request->validated();

        $imageUrl = $expense->image_url;
        $imagePublicId = $expense->image_public_id;

        // Jika user mengupload gambar baru
        if ($request->hasFile('image')) {
            // Hapus gambar lama di Cloudinary jika ada
            if ($expense->image_public_id) {
                $cloudinaryService->destroy($expense->image_public_id);
            }

            // Upload gambar baru
            $uploadedFile = $cloudinaryService->upload($request->file('image'), 'expenses');
            $imageUrl = $uploadedFile['secure_url'] ?? null;
            $imagePublicId = $uploadedFile['public_id'] ?? null;
        }

        $expense->update(array_merge(
            $validatedData,
            [
                'image_url'       => $imageUrl,
                'image_public_id' => $imagePublicId,
            ]
        ));

        return redirect()->route('expenses.index')
            ->with('success', 'Pengeluaran berhasil diperbarui.');
    }

    public function printPdf(Request $request)
    {
        $authenticatedUserBranch = Auth::user()->branch_id;
        $branchId = $request->query('branch_id'); // Gunakan $request->query() untuk GET
        $expenseCategoryId = $request->input('expense_category_id', "all");
        $minDate = $request->input("min_date", "");
        $maxDate = $request->input("max_date", "");

        $query = Expense::with(['expenseCategory', 'branch', 'user']);

        if ($authenticatedUserBranch) {
            $query->where("branch_id", $authenticatedUserBranch);
        } else if ($branchId && $branchId !== "all") {
            $query->where("branch_id", $branchId);
        }

        if ($minDate && $minDate !== "") {
            $query->where('expense_date', ">=", $minDate);
        }
        if ($maxDate && $maxDate !== "") {
            $query->where('expense_date', "<=", $maxDate);
        }

        if ($expenseCategoryId && $expenseCategoryId !== "all") {
            $query->where('expense_category_id', $expenseCategoryId);
        }

        $expenses = $query->oldest('expense_date')->get();

        $selectedBranch = Branch::find($authenticatedUserBranch);

        $pdf = Pdf::loadView('prints.expense.expense-report', compact('expenses', 'selectedBranch'))
            ->setPaper('a4', 'landscape');

        return $pdf->stream('laporan-pengeluaran.pdf');
    }
}
