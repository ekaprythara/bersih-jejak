<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBranchRequest;
use App\Http\Requests\UpdateBranchRequest;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index()
    {
        return inertia('branch', [
            'branches' => Branch::latest()->get(),
            'users' => User::with(['role', 'branch'])
                ->where('role_id', 2)
                ->latest()
                ->get(),
        ]);
    }

    public function store(StoreBranchRequest $request)
    {
        Branch::create($request->validated());

        return redirect()->route('branches.index');
    }

    public function updateStatus(Request $request, Branch $branch)
    {
        // Contoh validasi sederhana jika diperlukan
        $request->validate([
            'status' => ['required', 'boolean'], // atau string status aktif/nonaktif
        ]);

        // Update status berdasarkan request
        $branch->status = $request->status;
        $branch->save();

        // Redirect kembali ke halaman sebelumnya dengan pesan sukses
        return back()->with('success', 'Status cabang berhasil diperbarui.');
    }

    public function update(UpdateBranchRequest $request, Branch $branch)
    {
        $branch->update($request->validated());

        return redirect()->route('branches.index');
    }
}
