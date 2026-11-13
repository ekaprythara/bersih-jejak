import { Link } from "@inertiajs/react";
import type { PropsWithChildren } from "react";
import AppLogoIcon from "@/components/app-logo-icon";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { home } from "@/routes";

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{ name?: string; title?: string; description?: string }>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex flex-col gap-6 w-full max-w-md">
                <Card className="rounded-xl relative pt-6">
                    {/* Pembungkus agar logo berada di tengah atas card */}
                    <div className="flex justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full overflow-hidden shadow-sm">
                            <AppLogoIcon className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <CardHeader className="px-10 pt-4 pb-0 text-center">
                        <CardTitle className="text-xl">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-10 py-8">{children}</CardContent>
                </Card>
            </div>
        </div>
    );
}
