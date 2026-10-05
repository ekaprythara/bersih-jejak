<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAdminRequest;
use App\Http\Requests\UpdateAdminRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function store(StoreAdminRequest $request)
    {
        User::create(array_merge($request->validated(), [
            'role_id' => 2,                         // Default Role: Admin
            'password' => Hash::make('password'),   // Default Password: 'password'
        ]));

        return redirect()->route('branches.index');
    }

    public function updateStatus(Request $request, User $admin)
    {
        $request->validate([
            'status' => ['required', 'boolean'],
        ]);

        $admin->status = $request->status;
        $admin->save();

        return back()->with('success', 'Status admin berhasil diperbarui.');
    }

    public function update(UpdateAdminRequest $request, User $admin)
    {
        // dd($request->all());
        $admin->update([
            'branch_id' => $request->branch_id,
        ]);

        return redirect()->back();
    }
}
