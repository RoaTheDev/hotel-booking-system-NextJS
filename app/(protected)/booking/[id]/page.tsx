'use client'

import {use, useEffect} from "react"
import {useRouter} from "next/navigation"
import {useAuthStore} from "@/stores/AuthStore"
import {Card, CardContent} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import Link from "next/link"
import {User} from "lucide-react"
import {BookingForm} from "@/components/users/BookingForm";

const mockRooms = [
    {
        id: 1,
        roomNumber: "101",
        roomType: {
            id: 1,
            name: "Mountain Cherry",
            basePrice: 280,
            maxGuests: 2,
            description: "A serene retreat with panoramic mountain views, featuring traditional Japanese aesthetics and modern amenities. Perfect for a romantic getaway or peaceful solo retreat."
        }
    },
    {
        id: 2,
        roomNumber: "201",
        roomType: {
            id: 2,
            name: "Moon Viewing",
            basePrice: 450,
            maxGuests: 3,
            description: "An elevated sanctuary designed for celestial contemplation, with floor-to-ceiling windows and a private balcony for stargazing. Includes a meditation corner and premium bedding."
        }
    },
    {
        id: 3,
        roomNumber: "301",
        roomType: {
            id: 3,
            name: "Water Mirror",
            basePrice: 520,
            maxGuests: 4,
            description: "Our premium suite featuring a private hot spring bath, spacious living area, and zen garden view. The ultimate luxury mountain retreat experience."
        }
    }
]


export default function BookingPage({params}: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const {isAuthenticated, isHydrated} = useAuthStore()
    const {id} = use(params)
    const room = mockRooms.find(r => r.id === parseInt(id))

    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, isHydrated, router])

    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
                <div className="fixed inset-0 pointer-events-none">
                    <div
                        className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl"></div>
                    <div
                        className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl"></div>
                </div>

                <Card
                    className="max-w-md w-full shadow-2xl bg-slate-800/50 backdrop-blur-xl text-center border border-slate-700/50">
                    <CardContent className="p-8">
                        <div
                            className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <User className="h-8 w-8 text-slate-900"/>
                        </div>
                        <h2 className="text-2xl font-light text-slate-100 mb-4">Sign In Required</h2>
                        <p className="text-slate-400 mb-6">
                            Please sign in to your account to complete your booking reservation.
                        </p>
                        <Link href="/login">
                            <Button
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 shadow-lg hover:shadow-amber-500/25 transition-all duration-300">
                                Sign In to Continue
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!room) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Card className="max-w-md w-full text-center border-red-500/50 bg-slate-800/50">
                    <CardContent className="p-8">
                        <div
                            className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🏠</span>
                        </div>
                        <h2 className="text-xl font-medium text-slate-100 mb-2">Room Not Found</h2>
                        <p className="text-slate-400 mb-6">{`
            The room you're looking for doesn't exist or is no longer available.
        `}</p>
                        <Link href="/public">
                            <Button
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900">
                                Browse Available Rooms
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return <BookingForm room={room} roomId={id}/>
}