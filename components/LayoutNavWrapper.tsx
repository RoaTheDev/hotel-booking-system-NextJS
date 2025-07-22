"use client"

import {ReactNode} from "react";
import {Navbar} from "./Navbar"
import {usePathname} from "next/navigation";

export const LayoutNavWrapper = ({children}: { children: ReactNode }) => {
    const pathname = usePathname();
    const HIDE_NAV_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

    const hideNavbar = HIDE_NAV_ROUTES.includes(pathname);

    return (
        <>
            {!hideNavbar && <Navbar/>}
            {children}
        </>
    );
}
