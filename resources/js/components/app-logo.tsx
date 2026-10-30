import { usePage } from "@inertiajs/react";

import AppLogoIcon from "@/components/app-logo-icon";
import logo from "../../../public/images/logo/bersih-jejak.jpg";

export default function AppLogo() {
    const { name, auth } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <img src={logo} className="rounded-md" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
                {auth.user.branch ? (
                    <span className="text-xs text-neutral-500">
                        {`Cabang ${auth.user.branch.name}`}
                    </span>
                ) : null}
            </div>
        </>
    );
}
