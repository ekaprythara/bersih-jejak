import { usePage } from "@inertiajs/react";
import React from "react";

export const useAuth = () => {
    const { auth } = usePage().props;

    return {
        user: auth.user,
        isOwner: auth.user?.is_owner ?? false,
        isAdmin: auth.user?.is_admin ?? false,
    };
};
