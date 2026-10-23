import { Form, Head } from "@inertiajs/react";
import InputError from "@/components/input-error";
import PasswordInput from "@/components/password-input";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { register } from "@/routes";
import { store } from "@/routes/login";
import { request } from "@/routes/password";
import PasskeyVerify from "@/components/passkey-verify";
import { useEffect, useRef, useState } from "react";

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [isChecked, setIsChecked] = useState(false);
    const [username, setUsername] = useState("");
    const passwordRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const savedUsername = localStorage.getItem("username") ?? "";
        const isRemembered = localStorage.getItem("isRemembered") === "true";

        setUsername(savedUsername);
        setIsChecked(isRemembered);

        if (isRemembered && savedUsername) {
            passwordRef.current?.focus();
        }
    }, []);

    const handleFormSubmit = () => {
        if (isChecked) {
            localStorage.setItem("username", username);
            localStorage.setItem("isRemembered", "true");
        } else {
            localStorage.removeItem("username");
            localStorage.removeItem("isRemembered");
        }
    };

    return (
        <>
            <Head title="Log in" />

            <PasskeyVerify />

            <Form
                {...store.form()}
                resetOnSuccess={["password"]}
                className="flex flex-col gap-6"
                onSubmit={handleFormSubmit}
                onSuccess={() => {
                    if (isChecked) {
                        localStorage.setItem("username", username);
                        localStorage.setItem("isRemembered", "true");
                    } else {
                        localStorage.removeItem("username");
                        localStorage.removeItem("isRemembered");
                    }
                }}
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Nama Pengguna</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    required
                                    tabIndex={1}
                                    autoFocus
                                    autoComplete="username"
                                    placeholder="Nama Pengguna"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot your password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    ref={passwordRef}
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={isChecked}
                                    onCheckedChange={(checked) =>
                                        setIsChecked(checked === true)
                                    }
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Masuk
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: "Log in to your account",
    description: "Enter your email and password below to log in",
};
