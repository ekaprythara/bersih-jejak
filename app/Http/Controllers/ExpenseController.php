<?php

namespace App\Http\Controllers;

use App\Exports\ExpenseExport;
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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

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

        $branchData = $query->latest('created_at')->get();

        // ==========================================
        // PERHITUNGAN DASHBOARD CARDS STATISTIK (Hanya Angka)
        // ==========================================

        $statsQuery = Expense::query();
        if ($authenticatedUserBranch) {
            $statsQuery->where("branch_id", $authenticatedUserBranch);
        } else if ($branchId && $branchId !== "all") {
            $statsQuery->where("branch_id", $branchId);
        }

        // 1. Total Pengeluaran
        $totalExpenseAmount = (clone $statsQuery)->sum('amount');

        // 2. Pengeluaran Bulan Ini
        $monthlyExpenseAmount = (clone $statsQuery)
            ->whereYear('expense_date', now()->year)
            ->whereMonth('expense_date', now()->month)
            ->sum('amount');

        // 3. Kategori Pengeluaran Dominan
        $topCategoryData = (clone $statsQuery)
            ->select('expense_category_id', DB::raw('SUM(amount) as total'))
            ->groupBy('expense_category_id')
            ->orderByDesc('total')
            ->with('expenseCategory')
            ->first();

        $topCategory = [
            'name' => $topCategoryData?->expenseCategory?->name ?? 'Belum Ada Data',
            'total' => $topCategoryData?->total ?? 0,
        ];

        // 4. Cabang Terboros
        $topBranchData = (clone $statsQuery)
            ->select('branch_id', DB::raw('SUM(amount) as total'))
            ->groupBy('branch_id')
            ->orderByDesc('total')
            ->with('branch')
            ->first();

        $topBranch = [
            'name' => $topBranchData?->branch?->name ?? 'Semua Cabang',
            'total' => $topBranchData?->total ?? 0,
        ];

        return inertia('expense', [
            "expenses" => $branchData,
            "allBranches" => Branch::get(['id', 'name']),
            "branches" => Branch::active()->get(),
            "branchOptions" => Branch::get(['id', 'name', 'status']),
            "expenseCategories" => ExpenseCategory::all(),
            "dashboardCard" => [
                "totalExpense" => $totalExpenseAmount,
                "monthlyExpense" => $monthlyExpenseAmount,
                "topCategory" => $topCategory,
                "topBranch" => $topBranch,
            ],
            "filters" => $request->only([
                'min_date',
                'max_date',
                'branch_id',
                'expense_category_id',
            ])
        ]);
    }

    public function store(StoreExpenseRequest $request)
    {
        // $request->validated() sudah otomatis memvalidasi semua field (termasuk branch_id dari prepareForValidation)
        $validatedData = $request->validated();

        $imageUrl = null;

        // 3. Cek apakah ada file gambar yang di-upload
        if ($request->hasFile('image')) {
            // Menyimpan file ke folder 'storage/app/public/expenses'
            // Method store() mengembalikan path relatif, contoh: "expenses/xxxxxx.jpg"
            $imageUrl = $request->file('image')->store('expenses', 'public');
        }

        // 4. Simpan ke database beserta data gambar dan user_id
        Expense::create(array_merge($validatedData, [
            'user_id' => Auth::id(),
            'image' => $imageUrl,    // Dikosongkan karena tidak pakai Cloudinary lagi
        ]));

        return redirect()->route('expenses.index');
    }

    public function update(UpdateExpenseRequest $request, Expense $expense)
    {
        $this->authorize('update', $expense);

        $validatedData = $request->validated();

        $imagePath = $expense->image; // Pertahankan path lama jika tidak ada file baru

        // Jika user mengupload gambar baru
        if ($request->hasFile('image')) {
            // 1. Hapus gambar lama dari storage lokal jika ada
            if ($expense->image && Storage::disk('public')->exists($expense->image)) {
                Storage::disk('public')->delete($expense->image);
            }

            // 2. Upload gambar baru ke storage lokal
            $imagePath = $request->file('image')->store('expenses', 'public');
        }

        // Update data ke database
        $expense->update(array_merge($validatedData, [
            'image'       => $imagePath,
        ]));

        return redirect()->route('expenses.index')->with('success', 'Pengeluaran berhasil diperbarui.');
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

    public function exportExcel(Request $request)
    {
        $authenticatedUserBranch = Auth::user()->branch_id;
        $branchId = $request->query('branch_id', 'all');
        $expenseCategoryId = $request->input('expense_category_id', "all");
        $minDate = $request->input("min_date", "");
        $maxDate = $request->input("max_date", "");

        $fileName = 'laporan-pengeluaran-' . date('Y-m-d') . '.xlsx';

        return Excel::download(
            new ExpenseExport($branchId, $authenticatedUserBranch, $expenseCategoryId, $minDate, $maxDate),
            $fileName
        );
    }
}
