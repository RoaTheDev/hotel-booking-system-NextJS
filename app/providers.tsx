// app/providers.tsx (or in some shared folder)

"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {Toaster} from "sonner";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster />
        </QueryClientProvider>
    );
}
