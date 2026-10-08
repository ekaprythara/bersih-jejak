<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Models\Branch;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Services\CloudinaryService;
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

    public function store(StoreExpenseRequest $request, CloudinaryService $cloudinaryService)
    {
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
}
