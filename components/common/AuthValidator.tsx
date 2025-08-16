'use client'
import {useEffect} from "react";
import {useAuthStore} from "@/stores/AuthStore";

export default function AuthValidator() {
    const revalidateSession = useAuthStore((state) => state.revalidateSession);
    useEffect(() => {
            revalidateSession();
    }, [revalidateSession]);

    return null;
}
