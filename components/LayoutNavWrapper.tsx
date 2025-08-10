"use client"

import {ReactNode} from "react";
import {Navbar} from "./Navbar"
import {usePathname} from "next/navigation";

export const LayoutNavWrapper = ({children}: { children: ReactNode }) => {
    const pathname = usePathname();
    const HIDE_NAV_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password",'/admin','/profile',''];

    const hideNavbar = HIDE_NAV_ROUTES.includes(pathname) || pathname.startsWith("/booking/")

    return (
        <>
            {!hideNavbar && <Navbar/>}
            {children}
        </>
    );
}
