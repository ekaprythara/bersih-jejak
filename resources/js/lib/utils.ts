import type { InertiaLinkProps } from "@inertiajs/react";
import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps["href"]>): string {
    return typeof url === "string" ? url : url.url;
}

export const formatRupiah = (number: number | string): string => {
    const numericValue = typeof number === "string" ? Number(number) : number;

    if (isNaN(numericValue)) return "Rp. 0";

    // Format angka standar (hasilnya misal: "Rp 200.000")
    const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numericValue);

    // Menyisipkan titik setelah "Rp" -> "Rp."
    return formatted.replace("Rp", "Rp.");
};
