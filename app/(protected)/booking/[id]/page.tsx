'use client'

import {use, useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {useAuthStore} from "@/stores/AuthStore"
import {Card, CardContent} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import Link from "next/link"
import {User} from "lucide-react"
import {BookingForm} from "@/components/users/BookingForm";

interface RoomType {
    id: number;
    name: string;
    basePrice: number;
    maxGuests: number;
    description: string;
}

interface Room {
    id: number;
    roomNumber: string;
    roomType: RoomType;
}

export default function BookingPage({params}: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const {isAuthenticated, isHydrated} = useAuthStore()
    const {id} = use(params)

    const [room, setRoom] = useState<Room | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, isHydrated, router])

    // Fetch room data from API
    useEffect(() => {
        const fetchRoom = async () => {
            if (!id || !isAuthenticated) return

            try {
                setLoading(true)
                setError(null)

                const response = await fetch(`/api/rooms/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Room not found')
                        return
                    }
                    if(response.status === 400){
                        const res = await response.json()
                        setError(res.message)
                    }
                    throw new Error(`Failed to fetch room: ${response.status}`)
                }

                const result = await response.json()

                if (result.success && result.data) {
                    setRoom(result.data)
                } else {
                    setError(result.message || 'Failed to load room data')
                }
            } catch (err) {
                console.error('Error fetching room:', err)
                setError('Failed to load room data. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchRoom()
    }, [id, isAuthenticated])

    if (!isHydrated || loading) {
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

    if (error || !room) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Card className="max-w-md w-full text-center border-red-500/50 bg-slate-800/50">
                    <CardContent className="p-8">
                        <div
                            className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🏠</span>
                        </div>
                        <h2 className="text-xl font-medium text-slate-100 mb-2">Room Not Found</h2>
                        <p className="text-slate-400 mb-6">
                            {error || "The room you're looking for doesn't exist or is no longer available."}
                        </p>
                        <Link href="/rooms">
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