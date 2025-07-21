"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"
import React from "react";

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme()

    const amber = "rgb(251 191 36)"          // amber-400
    const amberLight = "rgb(254 215 170)"    // amber-300
    const slate900 = "rgb(15 23 42)"         // slate-900
    const slate700 = "rgb(71 85 105)"        // slate-700

    const style = {
        "--normal-bg": theme === "dark" ? slate700 : "#fff",
        "--normal-text": theme === "dark" ? amberLight : slate900,
        "--normal-border": theme === "dark" ? amber : slate700,

        "--success-bg": "rgb(22 163 74)",
        "--success-text": "#fff",
        "--error-bg": "rgb(220 38 38)",
        "--error-text": "#fff",

        boxShadow: theme === "dark"
            ? "0 4px 15px rgba(251, 191, 36, 0.3)"
            : "0 4px 15px rgba(0, 0, 0, 0.1)",

        borderRadius: "0.5rem",
        fontWeight: 400,
    } as React.CSSProperties

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            style={style}
            {...props}
        />
    )
}

export { Toaster }
