'use client'
import {useEffect} from "react";
import {useAuthStore} from "@/lib/stores/AuthStore";

export default function AuthValidator() {
    const revalidateSession = useAuthStore((state) => state.revalidateSession);
    useEffect(() => {
            revalidateSession();
    }, [revalidateSession]);

    return null;
}
