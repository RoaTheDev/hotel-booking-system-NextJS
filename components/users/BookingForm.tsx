'use client'

import {useEffect, useRef, useState} from "react"
import {SubmitHandler, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {gsap} from "gsap"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Separator} from "@/components/ui/separator"
import {ArrowLeft, Calendar, Users} from "lucide-react"
import {CreateBookingData, CreateBookingSchema} from "@/types/roomTypes"
import {useCreateBooking} from "@/hooks/bookingHooks"
import {useAuthStore} from "@/stores/AuthStore"
import {Room} from "@/app/api/(domain)/bookings/route";

interface BookingFormProps {
    room: Room & {
        roomType: {
            id: number
            name: string
            basePrice: number
            maxGuests: number
            description?: string
        }
    }
    roomId: string
}

export const BookingForm = ({room, roomId}: BookingFormProps) => {
    const [totalAmount, setTotalAmount] = useState(0)
    const [nights, setNights] = useState(0)
    const router = useRouter()
    const {user} = useAuthStore()
    const createBooking = useCreateBooking()
    const containerRef = useRef<HTMLDivElement>(null)
    const today = new Date().toISOString().split('T')[0]
    const {
        register,
        handleSubmit,
        formState: {errors},
        watch,
    } = useForm<CreateBookingData>({
        resolver: zodResolver(CreateBookingSchema),
        defaultValues: {
            roomId: parseInt(roomId),
            guests: 1,
            specialRequests: "",
            checkIn: today,
            checkOut: today
        },
    })

    const watchedCheckIn = watch("checkIn")
    const watchedCheckOut = watch("checkOut")
    const watchedGuests = watch("guests")

    useEffect(() => {
        if (watchedCheckIn && watchedCheckOut) {
            const checkInDate = new Date(watchedCheckIn)
            const checkOutDate = new Date(watchedCheckOut)
            const timeDiff = checkOutDate.getTime() - checkInDate.getTime()
            const nightCount = Math.ceil(timeDiff / (1000 * 3600 * 24))

            if (nightCount > 0) {
                setNights(nightCount)
                setTotalAmount(room.roomType.basePrice * nightCount)
            } else {
                setNights(0)
                setTotalAmount(0)
            }
        }
    }, [watchedCheckIn, watchedCheckOut, room.roomType.basePrice])

    // GSAP Animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set([".booking-header", ".booking-form", ".room-details"], {opacity: 0, y: 30})
            gsap.set(".floating-element", {opacity: 0, scale: 0})

            const tl = gsap.timeline()
            tl.to(".booking-header", {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out",
            })
                .to(".room-details", {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                }, "-=0.5")
                .to(".booking-form", {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out",
                }, "-=0.4")
                .to(".floating-element", {
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "back.out(1.7)",
                }, "-=0.4")

            // Floating animations
            gsap.to(".floating-1", {
                y: -20,
                rotation: 5,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut",
            })

            gsap.to(".floating-2", {
                y: -15,
                rotation: -3,
                duration: 3.5,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut",
                delay: 1,
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    const onSubmit: SubmitHandler<CreateBookingData> = async (data) => {
        try {
            const booking = await createBooking.mutateAsync(data);
            router.push(`/booking/confirmation/${booking.id}`);
        } catch (error) {
            console.error("Booking submission failed:", error);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
            {/* Floating background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="floating-element floating-1 absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl"></div>
                <div
                    className="floating-element floating-2 absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl"></div>
                <div
                    className="floating-element absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {/* Header */}
                <div className="booking-header mb-8">
                    <Button
                        onClick={() => router.back()}
                        variant="ghost"
                        className="mb-4 text-slate-300 hover:text-slate-100 hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                        Back to Rooms
                    </Button>
                    <div className="flex justify-center items-center flex-row ">
                        <h1 className="text-3xl font-light text-slate-100 mb-2">Complete Your Booking</h1>
                    </div>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Room Details - Left Sidebar */}
                    <div className="lg:col-span-2">
                        <Card
                            className="room-details sticky top-8 border-0 shadow-2xl bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                            <CardHeader>
                                <CardTitle className="text-xl font-light text-slate-100">
                                    {room.roomType.name}
                                </CardTitle>
                                <p className="text-slate-400">Room {room.roomNumber}</p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-300">Base Price per night</span>
                                    <span className="text-2xl font-medium text-amber-400">
                                        ${room.roomType.basePrice}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-slate-400"/>
                                    <span className="text-slate-300">
                                        Up to {room.roomType.maxGuests} guests
                                    </span>
                                </div>

                                {room.roomType.description && (
                                    <div>
                                        <p className="text-sm text-slate-400 mb-2">Description</p>
                                        <p className="text-slate-300 text-sm leading-relaxed">
                                            {room.roomType.description}
                                        </p>
                                    </div>
                                )}

                                <Separator className="bg-slate-700/50"/>

                                {/* Booking Summary */}
                                <div className="space-y-3">
                                    <h3 className="font-medium text-slate-100">Booking Summary</h3>

                                    {nights > 0 && (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-400">
                                                    ${room.roomType.basePrice} x {nights} night{nights !== 1 ? 's' : ''}
                                                </span>
                                                <span className="text-slate-300">
                                                    ${room.roomType.basePrice * nights}
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-400">Guests</span>
                                                <span className="text-slate-300">{watchedGuests || 1}</span>
                                            </div>

                                            <Separator className="bg-slate-700/50"/>

                                            <div className="flex justify-between font-medium">
                                                <span className="text-slate-100">Total Amount</span>
                                                <span className="text-xl text-amber-400">
                                                    ${totalAmount.toFixed(2)}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Booking Form - Main Content */}
                    <div className="lg:col-span-3">
                        <Card
                            className="booking-form border-0 shadow-2xl bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                            <CardHeader>
                                <CardTitle className="text-2xl font-light text-slate-100">
                                    Booking Details
                                </CardTitle>
                                <p className="text-slate-400">Please fill in your booking information</p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    {/* Guest Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-slate-100">Guest Information</h3>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-slate-300 mb-2 block">First Name</Label>
                                                <Input
                                                    value={user?.firstName || ''}
                                                    disabled
                                                    className="bg-slate-700/30 border-slate-600/50 text-slate-300"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-slate-300 mb-2 block">Last Name</Label>
                                                <Input
                                                    value={user?.lastName || ''}
                                                    disabled
                                                    className="bg-slate-700/30 border-slate-600/50 text-slate-300"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-slate-300 mb-2 block">Email</Label>
                                            <Input
                                                value={user?.email || ''}
                                                disabled
                                                className="bg-slate-700/30 border-slate-600/50 text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <Separator className="bg-slate-700/50"/>

                                    {/* Booking Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-slate-100">Stay Details</h3>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-slate-300 mb-2 block flex items-center gap-2">
                                                    <Calendar className="h-4 w-4"/>
                                                    Check-in Date
                                                </Label>

                                                <Input
                                                    type="date"
                                                    min={today}
                                                    {...register("checkIn")}
                                                    className="bg-slate-700/50 border-slate-600 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20"
                                                />
                                                {errors.checkIn && (
                                                    <p className="text-sm text-red-400 mt-1">{errors.checkIn.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label className="text-slate-300 mb-2 block flex items-center gap-2">
                                                    <Calendar className="h-4 w-4"/>
                                                    Check-out Date
                                                </Label>
                                                <Input
                                                    type="date"
                                                    min={watchedCheckIn || today}
                                                    {...register("checkOut")}
                                                    className="bg-slate-700/50 border-slate-600 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20"
                                                />
                                                {errors.checkOut && (
                                                    <p className="text-sm text-red-400 mt-1">{errors.checkOut.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-slate-300 mb-2 block flex items-center gap-2">
                                                <Users className="h-4 w-4"/>
                                                Number of Guests
                                            </Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={room.roomType.maxGuests}
                                                {...register("guests", { valueAsNumber: true })}
                                                className="bg-slate-700/50 border-slate-600 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20"
                                                onKeyDown={(e) => e.preventDefault()} // block typing
                                                onFocus={(e) => e.target.blur()}
                                            />
                                            {errors.guests && (
                                                <p className="text-sm text-red-400 mt-1">{errors.guests.message}</p>
                                            )}
                                            <p className="text-xs text-slate-400 mt-1">
                                                Maximum {room.roomType.maxGuests} guests allowed
                                            </p>
                                        </div>

                                        <div>
                                            <Label className="text-slate-300 mb-2 block">Special Requests
                                                (Optional)</Label>
                                            <Textarea
                                                {...register("specialRequests")}
                                                placeholder="Any special requests or preferences..."
                                                className="bg-slate-700/50 border-slate-600 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 resize-none"
                                                rows={4}
                                            />
                                            {errors.specialRequests && (
                                                <p className="text-sm text-red-400 mt-1">{errors.specialRequests.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <Separator className="bg-slate-700/50"/>

                                    {/* Submit Button */}
                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            disabled={createBooking.isPending || totalAmount <= 0}
                                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-medium text-lg py-6 shadow-lg hover:shadow-amber-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {createBooking.isPending ? (
                                                "Processing Booking..."
                                            ) : (
                                                `Complete Booking - $${totalAmount.toFixed(2)}`
                                            )}
                                        </Button>

                                        <p className="text-xs text-slate-400 text-center mt-3">
                                            By completing this booking, you agree to our terms and conditions.
                                        </p>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}