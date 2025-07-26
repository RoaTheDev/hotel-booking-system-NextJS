import type React from "react";
import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {Providers} from "@/app/providers";
import {LayoutNavWrapper} from "@/components/LayoutNavWrapper";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import AuthValidator from "@/components/AuthValidator";

const inter = Inter({
    subsets: ["latin"],
    weight: [
        "100",
        "200",
        "300",
        "400",
        "500",
        "600",
        "700",
        "800",
        "900",
    ],
    variable: "--font-inter",
});
export const metadata: Metadata = {
    title: "Tranquility Hotel - Find Your Inner Peace",
    description:
        "A serene hotel chain dedicated to providing guests a peaceful escape from the chaos of everyday life.",
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable}>
        <body className={inter.className}>
        <NavigationProgressBar/>
        <Providers>
            <AuthValidator />
            <LayoutNavWrapper>
            {children}
            </LayoutNavWrapper>
        </Providers>
        </body>
        </html>
    );
}
