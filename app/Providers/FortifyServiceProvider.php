<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Illuminate\Support\Facades\Hash; // <-- 1. Jangan lupa import Hash
use Laravel\Fortify\Fortify;
use Illuminate\Validation\ValidationException; // <-- 2. Jangan lupa import ValidationException

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Fortify::authenticateUsing(function (Request $request) {
            // Ambil field login (bisa email atau username tergantung konfigurasi Fortify)
            $loginField = $request->input(Fortify::username());

            // Cari user berdasarkan username ATAU email
            $user = User::where('username', $loginField)
                ->orWhere('email', $loginField)
                ->first();

            // 1. Cek apakah user ada dan passwordnya cocok
            if ($user && Hash::check($request->password, $user->password)) {

                // 2. Cek status user (0 atau false)
                $isUserDisabled = ($user->status == 0);

                // 3. Cek status cabang tempat user bertugas
                $isBranchDisabled = false;
                if ($user->branch_id) {
                    $branch = \App\Models\Branch::find($user->branch_id);
                    if ($branch && $branch->status == 0) {
                        $isBranchDisabled = true;
                    }
                }

                // Jika user ATAU cabangnya nonaktif, gagalkan login dan munculkan pesan error
                if ($isUserDisabled || $isBranchDisabled) {
                    throw ValidationException::withMessages([
                        Fortify::username() => 'Akun Anda atau cabang tempat Anda bertugas telah dinonaktifkan.',
                    ]);
                }

                // Jika aktif, izinkan masuk
                return $user;
            }
        });

        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn(Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn(Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]));

        Fortify::requestPasswordResetLinkView(fn(Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn(Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn() => Inertia::render('auth/register', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]));

        Fortify::twoFactorChallengeView(fn() => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn() => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())) . '|' . $request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('passkeys', function (Request $request) {
            return Limit::perMinute(10)->by(
                ($request->input('credential.id') ?: $request->session()->getId()) . '|' . $request->ip(),
            );
        });
    }
}
