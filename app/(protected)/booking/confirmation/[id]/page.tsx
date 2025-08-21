'use client'

import React, {use, useEffect, useRef} from "react"
import {gsap} from "gsap"
import Link from "next/link"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {ArrowRight, Calendar, CheckCircle, Clock, Download, Mail, MapPin, Phone, Star, Users} from "lucide-react"
import {useBooking} from "@/hooks/bookingHooks"
import {format} from "date-fns"

export default function BookingConfirmationPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = use(params)
    const containerRef = useRef<HTMLDivElement>(null)
    const {data: booking, isLoading, error} = useBooking(id)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set([".success-animation", ".confirmation-card", ".action-buttons"], {
                opacity: 0,
                y: 50,
                scale: 0.95
            })
            gsap.set(".floating-element", {opacity: 0, scale: 0})
            gsap.set(".check-icon", {scale: 0, rotation: -180})

            const tl = gsap.timeline()

            tl.to(".success-animation", {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1,
                ease: "back.out(1.7)",
            })
                .to(".check-icon", {
                    scale: 1,
                    rotation: 0,
                    duration: 0.8,
                    ease: "back.out(1.7)",
                }, "-=0.5")
                .to(".confirmation-card", {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: "power2.out",
                }, "-=0.4")
                .to(".action-buttons", {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    ease: "power2.out",
                }, "-=0.2")
                .to(".floating-element", {
                    opacity: 1,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "back.out(1.7)",
                }, "-=0.4")

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
    }, [booking])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            case "PENDING":
                return "bg-amber-500/20 text-amber-400 border-amber-500/30"
            default:
                return "bg-slate-500/20 text-slate-400 border-slate-500/30"
        }
    }

    const handlePrint = () => {
        window.print()
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading booking confirmation...</p>
                </div>
            </div>
        )
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Card className="max-w-md w-full text-center border-red-500/50 bg-slate-800/50">
                    <CardContent className="p-8">
                        <div
                            className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">❌</span>
                        </div>
                        <h2 className="text-xl font-medium text-slate-100 mb-2">Booking Not Found</h2>
                        <p className="text-slate-400 mb-6">
                            {`We couldn't find the booking confirmation you're looking for.`}
                        </p>
                        <Link href="/profile">
                            <Button
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900">
                                View My Bookings
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
            {/* Floating background elements */}
            <div className="fixed inset-0 pointer-events-none no-print">
                <div
                    className="floating-element floating-1 absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl"></div>
                <div
                    className="floating-element floating-2 absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl"></div>
                <div
                    className="floating-element absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                {/* Success Header */}
                <div className="success-animation text-center mb-12 no-print">
                    <div
                        className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <CheckCircle className="check-icon h-12 w-12 text-slate-900"/>
                    </div>
                    <h1 className="text-4xl font-light text-slate-100 mb-4">Booking Confirmed!</h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">{`
Your mountain retreat reservation has been successfully created.
    We can't wait to welcome you to Tranquility Inn.
    `}</p>
                </div>

                {/* Receipt Section for Printing */}
                <div className="receipt print-only">
                    <Card className="border-0 shadow-lg bg-white text-black">
                        <CardHeader className="text-center">
                            <h2 className="text-2xl font-semibold">Tranquility Inn - Booking Receipt</h2>
                            <p className="text-gray-600">Booking #{booking.id}</p>
                            <Badge className={`${getStatusColor(booking.status)} border mt-2`}>
                                {booking.status}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-gray-700"/>
                                    Room Details
                                </h3>
                                <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <div>
                                            <h4 className="text-lg font-medium">{booking.room.roomType.name}</h4>
                                            <p className="text-gray-600">Room {booking.room.roomNumber}</p>
                                        </div>
                                        <p className="text-lg font-medium text-gray-700">
                                            ${booking.room.roomType.basePrice}/night
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Users className="h-4 w-4"/>
                                        <span>Accommodates up to {booking.guests} guests</span>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-gray-300"/>

                            <div>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-gray-700"/>
                                    Stay Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-gray-100 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="h-4 w-4 text-blue-600"/>
                                            <span className="font-medium">Check-in</span>
                                        </div>
                                        <p className="text-lg font-light">
                                            {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
                                        </p>
                                        <p className="text-gray-600 text-sm">After 3:00 PM</p>
                                    </div>
                                    <div className="bg-gray-100 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="h-4 w-4 text-red-600"/>
                                            <span className="font-medium">Check-out</span>
                                        </div>
                                        <p className="text-lg font-light">
                                            {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                                        </p>
                                        <p className="text-gray-600 text-sm">Before 11:00 AM</p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-gray-300"/>

                            <div>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <Users className="h-5 w-5 text-gray-700"/>
                                    Guest Information
                                </h3>
                                <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Primary Guest</span>
                                        <span>{booking.user.firstName} {booking.user.lastName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email</span>
                                        <span>{booking.user.email}</span>
                                    </div>
                                    {booking.user.phone && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Phone</span>
                                            <span>{booking.user.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Number of Guests</span>
                                        <span>{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>

                            {booking.specialRequests && (
                                <>
                                    <Separator className="bg-gray-300"/>
                                    <div>
                                        <h3 className="text-lg font-medium">Special Requests</h3>
                                        <div className="bg-gray-100 rounded-lg p-4">
                                            <p className="text-gray-600">{booking.specialRequests}</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            <Separator className="bg-gray-300"/>

                            <div>
                                <h3 className="text-lg font-medium">Pricing Breakdown</h3>
                                <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            ${booking.room.roomType.basePrice}/night × {
                                            Math.ceil(
                                                (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
                                                (1000 * 60 * 60 * 24)
                                            )
                                        } nights
                                        </span>
                                        <span>${booking.totalAmount}</span>
                                    </div>
                                    <Separator className="bg-gray-300"/>
                                    <div className="flex justify-between text-lg font-medium">
                                        <span>Total Amount</span>
                                        <span className="text-blue-600">${booking.totalAmount}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Full Page Content */}
                <div className="confirmation-card space-y-8 no-print">
                    <Card className="border-0 shadow-2xl bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                        <CardHeader className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <CardTitle className="text-2xl font-light text-slate-100">
                                    Booking #{booking.id}
                                </CardTitle>
                                <Badge className={`${getStatusColor(booking.status)} border`}>
                                    {booking.status}
                                </Badge>
                            </div>
                            <p className="text-slate-400">
                                Confirmation sent to {booking.user.email}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div>
                                <h3 className="text-lg font-medium text-slate-100 mb-4 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-amber-500"/>
                                    Room Details
                                </h3>
                                <div className="bg-slate-700/30 rounded-lg p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-xl font-medium text-slate-100">{booking.room.roomType.name}</h4>
                                            <p className="text-slate-400">Room {booking.room.roomNumber}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-medium text-amber-400">
                                                ${booking.room.roomType.basePrice}/night
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Users className="h-4 w-4 text-slate-400"/>
                                        <span>Accommodates up to {booking.guests} guests</span>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-slate-700/50"/>

                            <div>
                                <h3 className="text-lg font-medium text-slate-100 mb-4 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-amber-500"/>
                                    Stay Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-slate-700/30 rounded-lg p-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Calendar className="h-5 w-5 text-emerald-400"/>
                                            <span className="font-medium text-slate-100">Check-in</span>
                                        </div>
                                        <p className="text-2xl font-light text-slate-100">
                                            {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
                                        </p>
                                        <p className="text-slate-400 text-sm">After 3:00 PM</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-lg p-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Clock className="h-5 w-5 text-red-400"/>
                                            <span className="font-medium text-slate-100">Check-out</span>
                                        </div>
                                        <p className="text-2xl font-light text-slate-100">
                                            {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                                        </p>
                                        <p className="text-slate-400 text-sm">Before 11:00 AM</p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-slate-700/50"/>

                            <div>
                                <h3 className="text-lg font-medium text-slate-100 mb-4 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-amber-500"/>
                                    Guest Information
                                </h3>
                                <div className="bg-slate-700/30 rounded-lg p-6 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Primary Guest</span>
                                        <span className="text-slate-100">
                                            {booking.user.firstName} {booking.user.lastName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Email</span>
                                        <span className="text-slate-100">{booking.user.email}</span>
                                    </div>
                                    {booking.user.phone && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Phone</span>
                                            <span className="text-slate-100">{booking.user.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Number of Guests</span>
                                        <span className="text-slate-100">
                                            {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {booking.specialRequests && (
                                <div>
                                    <h3 className="text-lg font-medium text-slate-100 mb-4">Special Requests</h3>
                                    <div className="bg-slate-700/30 rounded-lg p-6">
                                        <p className="text-slate-300 leading-relaxed">{booking.specialRequests}</p>
                                    </div>
                                </div>
                            )}

                            <Separator className="bg-slate-700/50"/>

                            <div>
                                <h3 className="text-lg font-medium text-slate-100 mb-4">Pricing Breakdown</h3>
                                <div className="bg-slate-700/30 rounded-lg p-6 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">
                                            ${booking.room.roomType.basePrice}/night × {
                                            Math.ceil(
                                                (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
                                                (1000 * 60 * 60 * 24)
                                            )
                                        } nights
                                        </span>
                                        <span className="text-slate-100">${booking.totalAmount}</span>
                                    </div>
                                    <Separator className="bg-slate-600/50"/>
                                    <div className="flex justify-between text-xl font-medium">
                                        <span className="text-slate-100">Total Amount</span>
                                        <span className="text-amber-400">${booking.totalAmount}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="action-buttons space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={handlePrint}
                                variant="outline"
                                className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent transition-all duration-300"
                            >
                                <Download className="h-4 w-4"/>
                                Print Receipt
                            </Button>

                            <Link href="/profile">
                                <Button
                                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 shadow-lg hover:shadow-amber-500/25 transition-all duration-300">
                                    View All Bookings
                                    <ArrowRight className="h-4 w-4"/>
                                </Button>
                            </Link>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/"
                                className="text-slate-400 hover:text-slate-300 transition-colors duration-300"
                            >
                                Return to Home
                            </Link>
                        </div>
                    </div>

                    <Card
                        className="border-0 shadow-lg bg-gradient-to-br from-slate-800/30 to-slate-700/30 backdrop-blur-xl border-slate-600/30">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-medium text-slate-100 mb-4 flex items-center gap-2">
                                <Star className="h-5 w-5 text-amber-500"/>
                                {`What's`} Next?
</h3>
<div className="space-y-3 text-slate-300">
    <p className="flex items-start gap-3">
        <Mail className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0"/>
        <span className="text-sm">
                                        {`You'll`} receive a confirmation email with detailed check-in instructions within the next few minutes.
                                    </span>
    </p>
    <p className="flex items-start gap-3">
        <Phone className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0"/>
        <span className="text-sm">
                                        Our team will contact you 24 hours before your arrival to confirm your check-in details.
                                    </span>
    </p>
    <p className="flex items-start gap-3">
        <Calendar className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0"/>
        <span className="text-sm">
                                        You can modify or cancel your booking up to 24 hours before check-in from your profile page.
                                    </span>
    </p>
</div>
</CardContent>
</Card>
</div>
</div>

<style jsx>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    .receipt {
                        width: 100%;
                        max-width: 800px;
                        margin: 0 auto;
                        background: white;
                        color: black;
                    }
                    body {
                        background: white !important;
                    }
                }
                .print-only {
                    display: none;
                }
            `}</style>
</div>
)
}
