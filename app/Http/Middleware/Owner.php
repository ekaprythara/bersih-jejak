<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Owner
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $roleName = $user?->role?->name;

        if ($roleName && (strtolower($roleName) === 'owner')) {
            return $next($request);
        }

        // Jika role lain yang memaksa masuk, lempar balik ke dashboard
        return redirect()->route('dashboard');
    }
}
