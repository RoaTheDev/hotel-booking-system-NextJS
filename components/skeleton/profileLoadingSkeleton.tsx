'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const ProfileLoadingSkeleton = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
            {/* Floating gradient elements matching the profile page */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="floating-element absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl"></div>
                <div className="floating-element absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl"></div>
                <div className="floating-element absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
            </div>

            {/* Navigation bar skeleton */}
            <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-slate-700/50 rounded-sm animate-pulse"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-slate-700/50 rounded animate-pulse"></div>
                                <div className="h-3 w-20 bg-slate-700/50 rounded animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse"></div>
                            <div className="h-8 w-20 bg-slate-700/50 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main content skeleton */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {/* Header skeleton */}
                <div className="mb-8">
                    <div className="h-8 w-48 bg-slate-700/50 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-64 bg-slate-700/50 rounded animate-pulse"></div>
                </div>

                {/* Tabs skeleton */}
                <div className="space-y-6">
                    <div className="grid grid-cols-3 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg">
                        <div className="h-10 bg-slate-700/50 rounded animate-pulse"></div>
                        <div className="h-10 bg-slate-700/50 rounded animate-pulse"></div>
                        <div className="h-10 bg-slate-700/50 rounded animate-pulse"></div>
                    </div>

                    {/* Profile card skeleton */}
                    <Card className="border-0 shadow-2xl bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="h-6 w-40 bg-slate-700/50 rounded animate-pulse"></div>
                            <div className="h-8 w-24 bg-slate-700/50 rounded animate-pulse"></div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse mb-2"></div>
                                    <div className="h-10 w-full bg-slate-700/50 rounded animate-pulse"></div>
                                </div>
                                <div>
                                    <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse mb-2"></div>
                                    <div className="h-10 w-full bg-slate-700/50 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div>
                                <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse mb-2"></div>
                                <div className="h-10 w-full bg-slate-700/50 rounded animate-pulse"></div>
                            </div>
                            <div>
                                <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse mb-2"></div>
                                <div className="h-10 w-full bg-slate-700/50 rounded animate-pulse"></div>
                            </div>
                            <div>
                                <div className="h-4 w-28 bg-slate-700/50 rounded animate-pulse mb-2"></div>
                                <div className="h-6 w-16 bg-slate-700/50 rounded animate-pulse"></div>
                            </div>
                            <div className="h-10 w-32 bg-slate-700/50 rounded animate-pulse"></div>
                        </CardContent>
                    </Card>

                    {/* Bookings card skeleton */}
                    <Card className="border-0 shadow-2xl bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                        <CardHeader>
                            <div className="h-6 w-40 bg-slate-700/50 rounded animate-pulse"></div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="border border-slate-700/50 rounded-lg p-6 bg-slate-700/20 backdrop-blur-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-2">
                                            <div className="h-5 w-32 bg-slate-700/50 rounded animate-pulse"></div>
                                            <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse"></div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-4 w-12 bg-slate-700/50 rounded animate-pulse"></div>
                                            <div className="h-6 w-16 bg-slate-700/50 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                                        <div className="space-y-2">
                                            <div className="h-4 w-16 bg-slate-700/50 rounded animate-pulse"></div>
                                            <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-16 bg-slate-700/50 rounded animate-pulse"></div>
                                            <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-16 bg-slate-700/50 rounded animate-pulse"></div>
                                            <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-16 bg-slate-700/50 rounded animate-pulse"></div>
                                            <div className="h-4 w-20 bg-slate-700/50 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse mb-1"></div>
                                        <div className="h-8 w-full bg-slate-700/50 rounded animate-pulse"></div>
                                    </div>
                                    <Separator className="my-4 bg-slate-700/50" />
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <div className="h-8 w-24 bg-slate-700/50 rounded animate-pulse"></div>
                                            <div className="h-8 w-24 bg-slate-700/50 rounded animate-pulse"></div>
                                        </div>
                                        <div className="h-8 w-20 bg-slate-700/50 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}