import type { ImgHTMLAttributes } from "react";
import logoImg from "../../../public/images/logo/bersih-jejak.jpg";

export default function AppLogoIcon(
    props: ImgHTMLAttributes<HTMLImageElement>,
) {
    return (
        <img
            src={logoImg}
            alt="Bersih Jejak Logo"
            {...props}
            className={`object-contain ${props.className || "w-8 h-8 rounded-lg"}`}
        />
    );
}
