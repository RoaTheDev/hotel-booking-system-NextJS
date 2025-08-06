'use client'

import React, {useState} from "react"
import {Calendar, DollarSign, Edit, Home, Plus, Search, Trash2, User, Users} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Textarea} from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import axios from "axios"
import {z} from "zod"
import {BookingWithDetails} from "@/lib/types/roomTypes"
import {toast} from "sonner"
import {BookingStatusUpdateType} from "@/app/api/(domain)/bookings/[id]/route"
import {BookingStatus} from "@/app/generated/prisma"

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    state = {hasError: false}

    static getDerivedStateFromError() {
        return {hasError: true}
    }

    render() {
        if (this.state.hasError) {
            return <div className="text-red-400 p-4">Error rendering modal content</div>
        }
        return this.props.children
    }
}

const BookingCreateSchema = z.object({
    userId: z.number().int().positive(),
    roomId: z.number().int().positive(),
    checkIn: z.string().refine(val => !isNaN(Date.parse(val)), {message: "Invalid check-in date"}),
    checkOut: z.string().refine(val => !isNaN(Date.parse(val)), {message: "Invalid check-out date"}),
    guests: z.number().int().positive(),
    specialRequests: z.string().optional(),
})


interface Room {
    id: number
    roomNumber: string
    roomType: {
        id: number
        name: string
        basePrice: number
    }
}

interface User {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string | null
}

interface BookingFormData {
    userId: number | null
    roomId: number | null
    checkIn: Date | null
    checkOut: Date | null
    guests: number
    specialRequests: string
}

interface BookingsResponse {
    bookings: BookingWithDetails[]
    pagination: {
        page: number
        limit: number
        totalCount: number
        totalPages: number
    }
    users: User[]
    rooms: Room[]
}

export function BookingManagement() {
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null)
    const [formData, setFormData] = useState<BookingFormData>({
        userId: null,
        roomId: null,
        checkIn: null,
        checkOut: null,
        guests: 1,
        specialRequests: "",
    })
    const [statusUpdateData, setStatusUpdateData] = useState<BookingStatusUpdateType>({
        status: BookingStatus.PENDING,
        reason: "",
        checkInTime: "",
        checkOutTime: "",
    })

    const queryClient = useQueryClient()

    // Fetch bookings
    const {data: bookingsData, isLoading: bookingsLoading, error: bookingsError} = useQuery<BookingsResponse>({
        queryKey: ['bookings', currentPage, statusFilter, searchTerm, startDate, endDate],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
            })
            if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter)
            if (searchTerm) params.append('search', searchTerm)
            if (startDate) params.append('checkIn', startDate.toISOString())
            if (endDate) params.append('checkOut', endDate.toISOString())
            const response = await axios.get(`/api/bookings?${params}`)
            return response.data.data
        },
        retry: 2,
    })

    const createBookingMutation = useMutation({
        mutationFn: async (data: z.infer<typeof BookingCreateSchema>) => {
            console.log("Submitting booking data:", data)
            const response = await axios.post('/api/bookings/secure', data)
            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['bookings']})
            setIsCreateModalOpen(false)
            resetForm()
            toast.success("Booking created successfully")
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create booking")
        },
    })

    const updateStatusMutation = useMutation({
        mutationFn: async ({id, data}: { id: number, data: BookingStatusUpdateType }) => {
            console.log("Updating booking status for ID:", id, "with data:", data)
            const response = await axios.patch(`/api/bookings/${id}`, data)
            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['bookings']})
            setIsStatusModalOpen(false)
            setSelectedBooking(null)
            toast.success("Booking status updated successfully")
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update booking status")
        },
    })

    const cancelBookingMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await axios.delete(`/api/bookings/${id}`)
            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['bookings']})
            toast.success("Booking cancelled successfully")
        },
        onError: (error) => {
            toast.error(error.message || "Failed to cancel booking")
        },
    })

    const resetForm = () => {
        setFormData({
            userId: null,
            roomId: null,
            checkIn: null,
            checkOut: null,
            guests: 1,
            specialRequests: "",
        })
    }

    const handleCreateBooking = () => {
        console.log("Form data before submission:", formData)
        try {
            const userId = formData.userId || 1
            const bookingData = BookingCreateSchema.parse({
                userId,
                roomId: formData.roomId!,
                checkIn: formData.checkIn!.toISOString(),
                checkOut: formData.checkOut!.toISOString(),
                guests: formData.guests,
                specialRequests: formData.specialRequests || undefined,
            })
            createBookingMutation.mutate(bookingData)
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("Validation errors:", error.errors)
                toast.error(error.errors[0].message)
            } else {
                console.error("Unexpected error:", error)
                toast.error("An unexpected error occurred")
            }
        }
    }

    const handleStatusUpdate = () => {
        if (!selectedBooking) {
            console.error("No booking selected for status update")
            return
        }
        try {
            const updateData = {
                status: statusUpdateData.status,
                reason: statusUpdateData.reason || undefined,
                ...(statusUpdateData.status === "CONFIRMED" && statusUpdateData.checkInTime
                    ? {checkInTime: new Date(statusUpdateData.checkInTime).toISOString()}
                    : {}),
                ...(statusUpdateData.status === "COMPLETED" && statusUpdateData.checkOutTime
                    ? {checkOutTime: new Date(statusUpdateData.checkOutTime).toISOString()}
                    : {}),
            }
            console.log("Submitting status update data:", updateData)
            updateStatusMutation.mutate({id: selectedBooking.id, data: updateData})
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("Status update validation errors:", error.errors)
                toast.error(error.errors[0].message)
            } else {
                console.error("Unexpected error:", error)
                toast.error("An unexpected error occurred")
            }
        }
    }

    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case "confirmed":
                return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            case "pending":
                return "bg-amber-500/20 text-amber-400 border-amber-500/30"
            case "cancelled":
                return "bg-red-500/20 text-red-400 border-red-500/30"
            case "completed":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30"
            default:
                return "bg-slate-500/20 text-slate-400 border-slate-500/30"
        }
    }

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const filteredBookings = bookingsData?.bookings || []
    const users = bookingsData?.users || []
    const rooms = bookingsData?.rooms || []
    const totalPages = bookingsData?.pagination?.totalPages || 1

    if (bookingsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
            </div>
        )
    }

    if (bookingsError) {
        return (
            <div className="text-center text-red-400 p-8">
                Error loading bookings: {bookingsError.message}
            </div>
        )
    }

    return (
        <>
            <Card className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-light text-slate-100 flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-emerald-400"/>
                        Booking Management
                    </CardTitle>
                    <Dialog
                        open={isCreateModalOpen}
                        onOpenChange={(open) => {
                            console.log("Create modal open state:", open)
                            setIsCreateModalOpen(open)
                            if (!open) resetForm()
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => console.log("New Booking button clicked")}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-900 flex items-center gap-2 font-light shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                            >
                                <Plus className="h-4 w-4"/>
                                New Booking
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-2xl">
                            <ErrorBoundary>
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-light">Create New Booking</DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        Add a new booking to the system
                                    </DialogDescription>
                                </DialogHeader>
                                {users.length === 0 || rooms.length === 0 ? (
                                    <div className="text-red-400">Loading users or rooms...</div>
                                ) : (
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-slate-300 mb-2 block font-light">Guest
                                                    (Optional)</Label>
                                                <Select
                                                    value={formData.userId?.toString() || ""}
                                                    onValueChange={(value) =>
                                                        setFormData({
                                                            ...formData,
                                                            userId: value ? parseInt(value) : null
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger
                                                        className="bg-slate-700/50 border-slate-600 text-slate-100">
                                                        <SelectValue placeholder="Select guest (defaults to admin)"/>
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-800 border-slate-700">
                                                        {users.map((user) => (
                                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                                {user.firstName} {user.lastName} ({user.email})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-slate-300 mb-2 block font-light">Room *</Label>
                                                <Select
                                                    value={formData.roomId?.toString() || ""}
                                                    onValueChange={(value) => setFormData({
                                                        ...formData,
                                                        roomId: parseInt(value)
                                                    })}
                                                >
                                                    <SelectTrigger
                                                        className="bg-slate-700/50 border-slate-600 text-slate-100">
                                                        <SelectValue placeholder="Select room"/>
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-800 border-slate-700">
                                                        {rooms.map((room) => (
                                                            <SelectItem key={room.id} value={room.id.toString()}>
                                                                {room.roomNumber} - {room.roomType.name} (${room.roomType.basePrice}/night)
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-slate-300 mb-2 block font-light">Check-in Date
                                                    *</Label>
                                                <Input
                                                    type="date"
                                                    value={formData.checkIn ? formData.checkIn.toISOString().split('T')[0] : ''}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            checkIn: e.target.value ? new Date(e.target.value) : null
                                                        })
                                                    }
                                                    className="bg-slate-700/50 border-slate-600 text-slate-100"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-slate-300 mb-2 block font-light">Check-out Date
                                                    *</Label>
                                                <Input
                                                    type="date"
                                                    value={formData.checkOut ? formData.checkOut.toISOString().split('T')[0] : ''}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            checkOut: e.target.value ? new Date(e.target.value) : null
                                                        })
                                                    }
                                                    className="bg-slate-700/50 border-slate-600 text-slate-100"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-slate-300 mb-2 block font-light">Number of Guests
                                                *</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={formData.guests}
                                                onChange={(e) =>
                                                    setFormData({...formData, guests: parseInt(e.target.value) || 1})
                                                }
                                                className="bg-slate-700/50 border-slate-600 text-slate-100"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-300 mb-2 block font-light">Special
                                                Requests</Label>
                                            <Textarea
                                                value={formData.specialRequests}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    specialRequests: e.target.value
                                                })}
                                                className="bg-slate-700/50 border-slate-600 text-slate-100 resize-none"
                                                rows={3}
                                                placeholder="Any special requests or notes..."
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreateBooking}
                                        disabled={createBookingMutation.isPending || !formData.roomId || !formData.checkIn || !formData.checkOut}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-900"
                                    >
                                        {createBookingMutation.isPending ? "Creating..." : "Create Booking"}
                                    </Button>
                                </div>
                            </ErrorBoundary>
                        </DialogContent>
                    </Dialog>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div className="col-span-2">
                            <Label className="text-slate-300 mb-2 block font-light">Search Bookings</Label>
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400"/>
                                <Input
                                    placeholder="Search by guest name or booking ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-300"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-slate-300 mb-2 block font-light">Status Filter</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger
                                    className="bg-slate-700/50 border-slate-600 text-slate-100 focus:border-emerald-400">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-slate-300 mb-2 block font-light">Check-in From</Label>
                            <Input
                                type="date"
                                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                                className="bg-slate-700/50 border-slate-600 text-slate-100"
                            />
                        </div>
                        <div>
                            <Label className="text-slate-300 mb-2 block font-light">Check-in To</Label>
                            <Input
                                type="date"
                                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                                className="bg-slate-700/50 border-slate-600 text-slate-100"
                            />
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-700/30">
                                <TableRow className="border-slate-700/50 hover:bg-slate-700/20">
                                    <TableHead className="text-slate-300 font-light">ID</TableHead>
                                    <TableHead className="text-slate-300 font-light">Guest</TableHead>
                                    <TableHead className="text-slate-300 font-light">Room</TableHead>
                                    <TableHead className="text-slate-300 font-light">Check-in</TableHead>
                                    <TableHead className="text-slate-300 font-light">Check-out</TableHead>
                                    <TableHead className="text-slate-300 font-light">Guests</TableHead>
                                    <TableHead className="text-slate-300 font-light">Status</TableHead>
                                    <TableHead className="text-slate-300 font-light">Amount</TableHead>
                                    <TableHead className="text-slate-300 font-light">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBookings.map((booking: BookingWithDetails) => (
                                    <TableRow key={booking.id}
                                              className="border-slate-700/50 hover:bg-slate-700/20 transition-colors duration-200">
                                        <TableCell className="font-medium text-slate-200">#{booking.id}</TableCell>
                                        <TableCell className="text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-slate-400"/>
                                                <div>
                                                    <div>{booking.user.firstName} {booking.user.lastName}</div>
                                                    <div className="text-xs text-slate-400">{booking.user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <Home className="h-4 w-4 text-slate-400"/>
                                                <div>
                                                    <div>{booking.room.roomNumber}</div>
                                                    <div
                                                        className="text-xs text-slate-400">{booking.room.roomType.name}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-300">{formatDate(booking.checkIn)}</TableCell>
                                        <TableCell className="text-slate-300">{formatDate(booking.checkOut)}</TableCell>
                                        <TableCell className="text-slate-300">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4 text-slate-400"/>
                                                {booking.guests}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${getStatusColor(booking.status)} border`}>
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-amber-400 font-medium">
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4"/>
                                                {booking.totalAmount.toLocaleString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        console.log("Edit button clicked for booking:", booking.id)
                                                        setSelectedBooking(booking)
                                                        setStatusUpdateData({
                                                            status: booking.status,
                                                            reason: "",
                                                            checkInTime: "",
                                                            checkOutTime: "",
                                                        })
                                                        setIsStatusModalOpen(true)
                                                    }}
                                                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 bg-transparent transition-all duration-300"
                                                >
                                                    <Edit className="h-4 w-4"/>
                                                </Button>
                                                {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => cancelBookingMutation.mutate(booking.id)}
                                                        disabled={cancelBookingMutation.isPending}
                                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400 bg-transparent transition-all duration-300"
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                            >
                                Previous
                            </Button>
                            <span className="flex items-center px-4 text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={isStatusModalOpen}
                onOpenChange={(open) => {
                    console.log("Status modal open state:", open)
                    setIsStatusModalOpen(open)
                    if (!open) {
                        setSelectedBooking(null)
                        setStatusUpdateData({
                            status: BookingStatus.PENDING,
                            reason: "",
                            checkInTime: "",
                            checkOutTime: "",
                        })
                    }
                }}
            >
                <DialogContent className="bg-slate-800 border-slate-700 text-slate-100">
                    <ErrorBoundary>
                        {selectedBooking ? (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-light">Update Booking Status</DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        Change the status of booking #{selectedBooking.id}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div>
                                        <Label className="text-slate-300 mb-2 block font-light">Status</Label>
                                        <Select
                                            value={statusUpdateData.status}
                                            onValueChange={(value) => {
                                                const newStatus = value as BookingStatus
                                                setStatusUpdateData({
                                                    ...statusUpdateData,
                                                    status: newStatus,
                                                    checkInTime: newStatus === "CONFIRMED" ? statusUpdateData.checkInTime : "",
                                                    checkOutTime: newStatus === "COMPLETED" ? statusUpdateData.checkOutTime : "",
                                                })
                                            }}
                                        >
                                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-100">
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                {Object.values(BookingStatus).map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-slate-300 mb-2 block font-light">Reason
                                            (Optional)</Label>
                                        <Textarea
                                            value={statusUpdateData.reason}
                                            onChange={(e) => setStatusUpdateData({
                                                ...statusUpdateData,
                                                reason: e.target.value
                                            })}
                                            className="bg-slate-700/50 border-slate-600 text-slate-100 resize-none"
                                            rows={3}
                                            placeholder="Reason for status change..."
                                        />
                                    </div>
                                    {statusUpdateData.status === "CONFIRMED" && (
                                        <div>
                                            <Label className="text-slate-300 mb-2 block font-light">Check-in Time
                                                (Optional)</Label>
                                            <Input
                                                type="datetime-local"
                                                value={statusUpdateData.checkInTime}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                    console.log("Check-in time input:", value)
                                                    setStatusUpdateData({
                                                        ...statusUpdateData,
                                                        checkInTime: value
                                                    })
                                                }}
                                                className="bg-slate-700/50 border-slate-600 text-slate-100"
                                            />
                                        </div>
                                    )}
                                    {statusUpdateData.status === "COMPLETED" && (
                                        <div>
                                            <Label className="text-slate-300 mb-2 block font-light">Check-out Time
                                                (Optional)</Label>
                                            <Input
                                                type="datetime-local"
                                                value={statusUpdateData.checkOutTime}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                    console.log("Check-out time input:", value)
                                                    setStatusUpdateData({
                                                        ...statusUpdateData,
                                                        checkOutTime: value
                                                    })
                                                }}
                                                className="bg-slate-700/50 border-slate-600 text-slate-100"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsStatusModalOpen(false)}
                                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleStatusUpdate}
                                        disabled={updateStatusMutation.isPending}
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-slate-900"
                                    >
                                        {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-red-400">No booking selected</div>
                        )}
                    </ErrorBoundary>
                </DialogContent>
            </Dialog>
        </>
    )
}