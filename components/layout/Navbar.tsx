"use client"

import Link from "next/link"
import {Button} from "@/components/ui/button"
import {useEffect, useState} from "react"
import {usePathname} from "next/navigation"
import {Menu, X} from "lucide-react"
import {useAuthStore} from "@/stores/AuthStore";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const pathname = usePathname()
    const {isAuthenticated} = useAuthStore()
    useEffect(() => {
        setIsMenuOpen(false)
    }, [pathname])

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMenuOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const navigationLinks = [
        {href: "/rooms", label: "Rooms"},
        {href: "/amenities", label: "Facilities"},
        {href: "/dining", label: "Dining"},
        {href: "/onsen", label: "Onsen"},
        {href: "/garden", label: "Garden"}
    ]

    const isActivePage = (href: string) => {
        return pathname === href || (href === "/rooms" && pathname.startsWith("/rooms"))
    }

    const getLinkClasses = (href: string) => {
        const baseClasses = "text-sm tracking-wide transition-all duration-300 hover:scale-105"
        const activeClasses = "text-amber-400 font-medium"
        const inactiveClasses = "text-slate-300 hover:text-amber-400"

        return `${baseClasses} ${isActivePage(href) ? activeClasses : inactiveClasses}`
    }

    return (
        <nav className="fixed top-0 w-full  bg-slate-900/80 backdrop-blur-xl z-50 border-b border-slate-700/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between  items-center h-16 sm:h-20">
                    {/* Logo */}
                    <Link href={'/public'} className="flex-shrink-0">
                        <div className="flex items-center">
                            <div
                                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-sm flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-slate-100 rounded-full"></div>
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-light text-slate-100 tracking-wide">Tranquility
                                    Inn</h1>
                                <p className="text-xs text-slate-400 tracking-widest hidden sm:block">MOUNTAIN
                                    RETREAT</p>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
                        {navigationLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={getLinkClasses(link.href)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {!isAuthenticated ? <Link href="/login">
                            <Button
                                variant="ghost"
                                className="text-slate-300 hover:bg-slate-800 hover:text-amber-400 text-sm transition-all duration-300"
                            >
                                Sign In
                            </Button>
                        </Link> : <Link href="/profile">
                            <Button
                                variant="ghost"
                                className="text-slate-300 hover:bg-slate-800 hover:text-amber-400 text-sm transition-all duration-300"
                            >
                                My Account
                            </Button>
                        </Link>}
                        <Link href="/rooms">
                            <Button
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 text-sm px-4 lg:px-6 shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105">
                                Reserve
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-slate-300 hover:text-amber-400 transition-colors duration-300"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
                        <div className="px-4 py-6 space-y-4">
                            {/* Mobile Navigation Links */}
                            {navigationLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`block py-2 text-base ${getLinkClasses(link.href)}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Mobile Auth Buttons */}
                            <div className="pt-4 border-t border-slate-700/50 space-y-3">
                                {!isAuthenticated ? <Link href="/login" className="block">
                                    <Button
                                        variant="ghost"
                                        className="w-full text-slate-300 hover:bg-slate-800 hover:text-amber-400 text-sm transition-all duration-300"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign In
                                    </Button>
                                </Link> : <Link href="/profile" className="block">
                                    <Button
                                        variant="ghost"
                                        className="w-full text-slate-300 hover:bg-slate-800 hover:text-amber-400 text-sm transition-all duration-300"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        My Account
                                    </Button>
                                </Link>}
                                <Link href="/rooms" className="block">
                                    <Button
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 text-sm shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Reserve
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}