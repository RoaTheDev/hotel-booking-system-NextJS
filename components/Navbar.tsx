"use client"

import Link from "next/link"
import {Button} from "@/components/ui/button"

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-xl z-50 border-b border-slate-700/50">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <Link href={'/'}>
                        <div className="flex items-center">

                            <div
                                className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-sm flex items-center justify-center mr-4 shadow-lg">
                                <div className="w-6 h-6 border-2 border-slate-100 rounded-full"></div>
                            </div>
                            <div>
                                <h1 className="text-xl font-light text-slate-100 tracking-wide">Tranquility Inn</h1>
                                <p className="text-xs text-slate-400 tracking-widest">MOUNTAIN RETREAT</p>
                            </div>
                        </div>
                    </Link>
                    <div className="hidden md:flex items-center space-x-12">
                        <Link
                            href="/rooms"
                            className="text-slate-300 hover:text-amber-400 text-sm tracking-wide transition-all duration-300 hover:scale-105"
                        >
                            Rooms
                        </Link>
                        <Link
                            href="/amenities"
                            className="text-slate-300 hover:text-amber-400 text-sm tracking-wide transition-all duration-300 hover:scale-105"
                        >
                            Facilities
                        </Link>
                        <Link
                            href="/dining"
                            className="text-slate-300 hover:text-amber-400 text-sm tracking-wide transition-all duration-300 hover:scale-105"
                        >
                            Dining
                        </Link>
                        <Link
                            href="/onsen"
                            className="text-slate-300 hover:text-amber-400 text-sm tracking-wide transition-all duration-300 hover:scale-105"
                        >
                            Onsen
                        </Link>
                        <Link
                            href="/garden"
                            className="text-slate-300 hover:text-amber-400 text-sm tracking-wide transition-all duration-300 hover:scale-105"
                        >
                            Garden
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="/login">
                            <Button
                                variant="ghost"
                                className="text-slate-300 hover:bg-slate-800 hover:text-amber-400 text-sm transition-all duration-300"
                            >
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/rooms">
                            <Button
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 text-sm px-6 shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105">
                                Reserve
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}