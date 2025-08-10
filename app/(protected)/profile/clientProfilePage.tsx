'use client'

import {useEffect, useRef, useState} from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {gsap} from "gsap"
import Link from "next/link"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {Calendar, Clock, Edit, LogOut, MapPin, Save, Settings, User, X} from "lucide-react"
import {useAuthStore} from "@/lib/stores/AuthStore"
import {ProfileForm, profileSchema} from "@/lib/types/authTypes"
import {ProfileLoadingSkeleton} from "@/components/skeleton/profileLoadingSkeleton";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {useLogout} from "@/lib/query/authHooks";
import {useCancelBooking, useUserBookings} from "@/lib/query/bookingHooks";
import {format} from "date-fns";


export const ClientProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const route = useRouter();
    const logout = useLogout()
    const [bookingStatus, setBookingStatus] = useState<string>("ALL")
    const [currentPage, setCurrentPage] = useState(1)

    const {data: bookingsData, isLoading: bookingsLoading} = useUserBookings({
        page: currentPage,
        limit: 10,
        status: bookingStatus
    })

    const cancelBooking = useCancelBooking()

    const handleCancelBooking = async (bookingId: number) => {
        if (window.confirm("Are you sure you want to cancel this booking?")) {
            await cancelBooking.mutateAsync(bookingId)
        }
    }
    const {user, isAuthenticated, isHydrated, updateProfile} = useAuthStore()
    const containerRef = useRef<HTMLDivElement>(null)
    const {
        register,
        handleSubmit,
        formState: {errors},
        reset,
    } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            phone: user?.phone || null,
        },
    })

    useEffect(() => {
        const authMessage = sessionStorage.getItem("authMessage");
        if (authMessage) {
            toast.message(authMessage);
            sessionStorage.removeItem("authMessage");
        }
    }, []);

    useEffect(() => {
        if (user) {
            reset({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || null,
            });
        }
    }, [user, reset]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set([".profile-header", ".tabs-content", ".booking-card"], {opacity: 0, y: 30})
            gsap.set(".floating-element", {opacity: 0, scale: 0})

            const tl = gsap.timeline()
            tl.to(".profile-header", {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power3.out",
            })
                .to(
                    ".tabs-content",
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power2.out",
                    },
                    "-=0.6",
                )
                .to(
                    ".floating-element",
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.8,
                        stagger: 0.2,
                        ease: "back.out(1.7)",
                    },
                    "-=0.4",
                )

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

            gsap.fromTo(
                ".booking-card",
                {opacity: 0, y: 20, scale: 0.95},
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "back.out(1.7)",
                    delay: 0.5,
                },
            )

            const inputs = gsap.utils.toArray(".form-input")
            inputs.forEach((inputEl) => {
                const input = inputEl as HTMLElement
                const field = input.querySelector("input")
                const label = input.querySelector("label")

                field?.addEventListener("focus", () => {
                    gsap.to(label, {scale: 0.9, y: -5, color: "#f59e0b", duration: 0.3})
                    gsap.to(input, {scale: 1.02, duration: 0.3})
                })

                field?.addEventListener("blur", () => {
                    if (!field.value) {
                        gsap.to(label, {scale: 1, y: 0, color: "#94a3b8", duration: 0.3})
                    }
                    gsap.to(input, {scale: 1, duration: 0.3})
                })
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])
    const onSignOut = async () => {
        await logout.mutateAsync()
        route.push('/');
    }
    const onSubmit = async (data: ProfileForm) => {
        setIsLoading(true)
        gsap.to(".save-btn", {scale: 0.95, duration: 0.1})

        try {
            await updateProfile(data)
            setIsEditing(false)
            gsap.to(".profile-form", {
                scale: 1.02,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut",
            })
        } catch (error) {
            console.error("Profile update failed:", error)
            const tl = gsap.timeline()
            tl.to(".profile-form", {x: -10, duration: 0.1, ease: "power2.inOut"})
                .to(".profile-form", {x: 10, duration: 0.1, ease: "power2.inOut"})
                .to(".profile-form", {x: -10, duration: 0.1, ease: "power2.inOut"})
                .to(".profile-form", {x: 10, duration: 0.1, ease: "power2.inOut"})
                .to(".profile-form", {x: 0, duration: 0.1, ease: "power2.inOut"})
        } finally {
            setIsLoading(false)
            gsap.to(".save-btn", {scale: 1, duration: 0.2})
        }
    }

    const handleCancel = () => {
        reset()
        setIsEditing(false)
        gsap.to(".profile-form", {
            scale: 0.98,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            case "PENDING":
                return "bg-amber-500/20 text-amber-400 border-amber-500/30"
            case "COMPLETED":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30"
            case "CANCELLED":
                return "bg-red-500/20 text-red-400 border-red-500/30"
            default:
                return "bg-slate-500/20 text-slate-400 border-slate-500/30"
        }
    }

    if (!isHydrated) {
        return <ProfileLoadingSkeleton/>
    }
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
                <div className="fixed inset-0 pointer-events-none">
                    <div
                        className="floating-element floating-1 absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl"></div>
                    <div
                        className="floating-element floating-2 absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl"></div>
                </div>

                <Card
                    className="max-w-md w-full shadow-2xl bg-slate-800/50 backdrop-blur-xl text-center border border-slate-700/50">
                    <CardContent className="p-8">
                        <div
                            className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <User className="h-8 w-8 text-slate-900"/>
                        </div>
                        <h2 className="text-2xl font-light text-slate-100 mb-4">Please Sign In</h2>
                        <p className="text-slate-400 mb-6">
                            You need to be signed in to view your profile and manage your bookings.
                        </p>
                        <Link href="/login">
                            <Button
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 shadow-lg hover:shadow-amber-500/25 transition-all duration-300">
                                Sign In
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="floating-element floating-1 absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl"></div>
                <div
                    className="floating-element floating-2 absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl"></div>
                <div
                    className="floating-element absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
            </div>

            <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-3">
                            <div
                                className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-sm flex items-center justify-center shadow-lg">
                                <div className="w-5 h-5 border-2 border-slate-100 rounded-full"></div>
                            </div>
                            <div>
                                <span className="text-lg font-light text-slate-100 tracking-wide">Tranquility Inn</span>
                                <p className="text-xs text-slate-400 tracking-widest">MOUNTAIN RETREAT</p>
                            </div>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <span className="text-slate-400">Welcome, {user!.firstName || "Jon doe"}</span>
                            <Button
                                onClick={onSignOut}
                                variant="ghost"
                                className="text-slate-300 hover:bg-slate-800 hover:text-red-400 transition-all duration-300"
                            >
                                <LogOut className="h-4 w-4 mr-2"/>
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="profile-header mb-8">
                    <h1 className="text-3xl font-light text-slate-100 mb-2">My Account</h1>
                    <p className="text-slate-400">Manage your profile and view your mountain retreat history</p>
                </div>

                <Tabs defaultValue="profile" className="tabs-content space-y-6">
                    <TabsList
                        className="grid w-full grid-cols-3 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                        <TabsTrigger
                            value="profile"
                            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-slate-900"
                        >
                            <User className="h-4 w-4"/>
                            Profile
                        </TabsTrigger>
                        <TabsTrigger
                            value="bookings"
                            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-slate-900"
                        >
                            <Calendar className="h-4 w-4"/>
                            Bookings
                        </TabsTrigger>
                        <TabsTrigger
                            value="settings"
                            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-slate-900"
                        >
                            <Settings className="h-4 w-4"/>
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <Card className="border-0 shadow-2xl bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-2xl font-light text-slate-100">Profile
                                    Information</CardTitle>
                                {!isEditing ? (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2 border-amber-400/30 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400 bg-transparent transition-all duration-300"
                                    >
                                        <Edit className="h-4 w-4"/>
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleCancel}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent transition-all duration-300"
                                        >
                                            <X className="h-4 w-4"/>
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)} className="profile-form space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="form-input">
                                            <Label className="text-slate-300 mb-2 block font-light">First Name</Label>
                                            <Input
                                                {...register("firstName")}
                                                disabled={!isEditing}
                                                className={
                                                    !isEditing
                                                        ? "bg-slate-700/30 border-slate-600/50 text-slate-300"
                                                        : "bg-slate-700/50 border-slate-600 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-300"
                                                }
                                            />
                                            {errors.firstName &&
                                                <p className="text-sm text-red-400 mt-1">{errors.firstName.message}</p>}
                                        </div>
                                        <div className="form-input">
                                            <Label className="text-slate-300 mb-2 block font-light">Last Name</Label>
                                            <Input
                                                {...register("lastName")}
                                                disabled={!isEditing}
                                                className={
                                                    !isEditing
                                                        ? "bg-slate-700/30 border-slate-600/50 text-slate-300"
                                                        : "bg-slate-700/50 border-slate-600 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-300"
                                                }
                                            />
                                            {errors.lastName &&
                                                <p className="text-sm text-red-400 mt-1">{errors.lastName.message}</p>}
                                        </div>
                                    </div>

                                    <div className="form-input">
                                        <Label className="text-slate-300 mb-2 block font-light">Email Address</Label>
                                        <Input
                                            {...register("email")}
                                            disabled={!isEditing}
                                            className={
                                                !isEditing
                                                    ? "bg-slate-700/30 border-slate-600/50 text-slate-300"
                                                    : "bg-slate-700/50 border-slate-600 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-300"
                                            }
                                        />
                                        {errors.email &&
                                            <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>}
                                    </div>

                                    <div className="form-input">
                                        <Label className="text-slate-300 mb-2 block font-light">Phone Number</Label>
                                        <Input
                                            {...register("phone")}
                                            disabled={!isEditing}
                                            className={
                                                !isEditing
                                                    ? "bg-slate-700/30 border-slate-600/50 text-slate-300"
                                                    : "bg-slate-700/50 border-slate-600 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-300"
                                            }
                                        />
                                        {errors.phone &&
                                            <p className="text-sm text-red-400 mt-1">{errors.phone.message}</p>}
                                    </div>

                                    <div>
                                        <Label className="text-slate-300 mb-2 block font-light">Account Type</Label>
                                        <Badge
                                            variant="secondary"
                                            className="text-sm bg-slate-700/50 text-slate-300 border border-slate-600/50"
                                        >
                                            {user!.role === "ADMIN" ? "Administrator" : "Guest"}
                                        </Badge>
                                    </div>

                                    {isEditing && (
                                        <Button
                                            type="submit"
                                            className="save-btn bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-900 flex items-center gap-2 font-light tracking-wide shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                                            disabled={isLoading}
                                        >
                                            <Save className="h-4 w-4"/>
                                            {isLoading ? "Saving..." : "Save Changes"}
                                        </Button>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="bookings">
                        <Card className="border-0 shadow-2xl bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-2xl font-light text-slate-100">Booking
                                        History</CardTitle>

                                    {/* Status Filter */}
                                    <div className="flex gap-2">
                                        {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => (
                                            <Button
                                                key={status}
                                                variant={bookingStatus === status ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                    setBookingStatus(status)
                                                    setCurrentPage(1)
                                                }}
                                                className={
                                                    bookingStatus === status
                                                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900"
                                                        : "border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent"
                                                }
                                            >
                                                {status}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {bookingsLoading ? (
                                    <div className="text-center py-8">
                                        <div
                                            className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                                        <p className="text-slate-400">Loading your bookings...</p>
                                    </div>
                                ) : !bookingsData?.bookings.length ? (
                                    <div className="text-center py-12">
                                        <div
                                            className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calendar className="h-8 w-8 text-slate-400"/>
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-100 mb-2">No Bookings Found</h3>
                                        <p className="text-slate-400 mb-6">
                                            {bookingStatus === "ALL"
                                                ? "You haven't made any bookings yet."
                                                : `No ${bookingStatus.toLowerCase()} bookings found.`
                                            }
                                        </p>
                                        <Link href="/">
                                            <Button
                                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900">
                                                Browse Rooms
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {bookingsData.bookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="booking-card border border-slate-700/50 rounded-lg p-6 bg-slate-700/20 backdrop-blur-sm hover:bg-slate-700/30 transition-all duration-300"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-medium text-slate-100 mb-1">
                                                            {booking.room.roomType.name}
                                                        </h3>
                                                        <p className="text-slate-400 text-sm">
                                                            Booking #{booking.id} • Room {booking.room.roomNumber}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge className={`${getStatusColor(booking.status)} border`}>
                                                            {booking.status}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-4 gap-4 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-slate-400"/>
                                                        <div>
                                                            <p className="text-xs text-slate-500">Check-in</p>
                                                            <p className="font-medium text-slate-200">
                                                                {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-slate-400"/>
                                                        <div>
                                                            <p className="text-xs text-slate-500">Check-out</p>
                                                            <p className="font-medium text-slate-200">
                                                                {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-slate-400"/>
                                                        <div>
                                                            <p className="text-xs text-slate-500">Guests</p>
                                                            <p className="font-medium text-slate-200">
                                                                {booking.guests} guest{booking.guests !== 1 ? "s" : ""}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-slate-400"/>
                                                        <div>
                                                            <p className="text-xs text-slate-500">Total</p>
                                                            <p className="font-medium text-amber-400">
                                                                ${booking.totalAmount.toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {booking.specialRequests && (
                                                    <div className="mb-4">
                                                        <p className="text-sm text-slate-500 mb-1">Special Requests</p>
                                                        <p className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded">
                                                            {booking.specialRequests}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="mb-4">
                                                    <p className="text-xs text-slate-500">Booked on</p>
                                                    <p className="text-sm text-slate-300">
                                                        {format(new Date(booking.createdAt), 'MMM dd, yyyy \'at\' h:mm a')}
                                                    </p>
                                                </div>

                                                <Separator className="my-4 bg-slate-700/50"/>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex gap-2">
                                                        {(booking.status === "CONFIRMED" || booking.status === "PENDING") && (
                                                            <Button
                                                                onClick={() => handleCancelBooking(booking.id)}
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={cancelBooking.isPending}
                                                                className="border-red-400/30 text-red-400 hover:bg-red-400/10 hover:border-red-400 bg-transparent transition-all duration-300"
                                                            >
                                                                {cancelBooking.isPending ? "Cancelling..." : "Cancel Booking"}
                                                            </Button>
                                                        )}
                                                        <Link href={`/booking/confirmation/${booking.id}`}>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent transition-all duration-300"
                                                            >
                                                                View Details
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Pagination */}
                                        {bookingsData.pagination.totalPages > 1 && (
                                            <div className="flex justify-center items-center gap-4 mt-8">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent"
                                                >
                                                    Previous
                                                </Button>

                                                <span className="text-slate-400">
                                Page {bookingsData.pagination.page} of {bookingsData.pagination.totalPages}
                            </span>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(p => Math.min(bookingsData.pagination.totalPages, p + 1))}
                                                    disabled={currentPage === bookingsData.pagination.totalPages}
                                                    className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent"
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings">
                        <Card className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                            <CardHeader>
                                <CardTitle className="text-2xl font-light text-slate-100">Account Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div
                                        className="flex justify-between items-center p-4 border border-slate-700/50 rounded-lg bg-slate-700/20 hover:bg-slate-700/30 transition-all duration-300">
                                        <div>
                                            <h3 className="font-medium text-slate-100">Change Password</h3>
                                            <p className="text-sm text-slate-400">Update your account password for
                                                security</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-green-400/30 text-green-400 hover:bg-green-400/10 hover:border-green-400 bg-transparent transition-all duration-300"

                                        >
                                            Change
                                        </Button>
                                    </div>

                                    <div
                                        className="flex justify-between items-center p-4 border border-red-500/50 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all duration-300">
                                        <div>
                                            <h3 className="font-medium text-red-400">Delete Account</h3>
                                            <p className="text-sm text-red-300">Permanently delete your account and all
                                                data</p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-500 transition-all duration-300"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )

}