<?php

namespace App\Http\Middleware;

use App\Models\Branch;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Pastikan user sedang login
        if (Auth::check()) {
            $user = Auth::user();

            // 1. Cek status user (mengantisipasi nilai false, 0, atau "0")
            $isUserDisabled = ($user->status == 0);

            // 2. Cek status cabang tempat user bertugas
            $isBranchDisabled = false;
            if ($user->branch_id) {
                $branch = Branch::find($user->branch_id);
                if ($branch && $branch->status == 0) {
                    $isBranchDisabled = true;
                }
            }

            // Jika user ATAU cabangnya nonaktif
            if ($isUserDisabled || $isBranchDisabled) {
                // Lakukan logout total dari guard web
                Auth::guard('web')->logout();

                $request->session()->invalidate();
                $request->session()->regenerateToken();

                // KHUSUS INERTIA & REACT: 
                // Gunakan inertia()->location() agar browser melakukan Hard Reload 
                // mutlak keluar dari SPA kembali ke halaman login.
                if ($request->header('X-Inertia')) {
                    return inertia()->location(route('login'));
                }

                return redirect()->route('login');
            }
        }

        return $next($request);
    }
}
