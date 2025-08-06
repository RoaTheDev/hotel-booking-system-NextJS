'use client'

import React, {JSX, useRef} from "react"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    XAxis,
    YAxis
} from "recharts"
import {
    Activity,
    Calendar,
    Clock,
    DollarSign,
    Edit,
    Home,
    Plus,
    Settings,
    Star,
    Trash2,
    TrendingUp,
    Users
} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Badge} from "@/components/ui/badge"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart"
import {AdminProfilePopup} from "@/components/AdminProfilePopup"
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns"
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider"
import {useQuery} from "@tanstack/react-query"
import axios from "axios"
import {AdminDashboardStats, BookingWithDetails} from "@/lib/types/roomTypes"
import {BookingManagement} from "@/components/BookingManagement";

interface RevenueData {
    month: string;
    revenue: number;
    bookings: number;
    occupancy: number;
}

interface RoomTypeData {
    name: string;
    bookings: number;
    revenue: number;
    color: string;
}

interface DailyBookingsData {
    day: string;
    bookings: number;
    checkins: number;
    checkouts: number;
}



interface Booking {
    id: number;
    guest: string;
    room: string;
    checkIn: string;
    checkOut: string;
    status: "CONFIRMED" | "PENDING" | "COMPLETED" | "CANCELLED";
    amount: number;
}


type ChartConfig = {
    [key: string]: {
        label: string;
        color?: string;
    };
}

const revenueChartConfig = {
    revenue: {label: "Revenue", color: "hsl(var(--chart-1))"},
    bookings: {label: "Bookings", color: "hsl(var(--chart-2))"},
    occupancy: {label: "Occupancy %", color: "hsl(var(--chart-3))"},
} satisfies ChartConfig

const roomPerformanceConfig = {
    bookings: {label: "Bookings"},
} satisfies ChartConfig

const dailyActivityConfig = {
    checkins: {label: "Check-ins", color: "hsl(var(--chart-1))"},
    checkouts: {label: "Check-outs", color: "hsl(var(--chart-2))"},
    bookings: {label: "New Bookings", color: "hsl(var(--chart-3))"},
} satisfies ChartConfig

const transformToRevenueData = (revenueData: AdminDashboardStats['revenueData']): RevenueData[] => {
    return revenueData.map(data => ({
        month: data.month,
        revenue: data.revenue,
        bookings: data.bookings,
        occupancy: data.occupancy
    }))
}

const transformToBookingData = (bookings: BookingWithDetails[]): Booking[] => {
    return bookings.map(booking => ({
        id: booking.id,
        guest: `${booking.user.firstName} ${booking.user.lastName}`,
        room: booking.room.roomType.name,
        checkIn: new Date(booking.checkIn).toISOString().split('T')[0],
        checkOut: new Date(booking.checkOut).toISOString().split('T')[0],
        status: booking.status,
        amount: booking.totalAmount,
    }))
}

const transformToRoomTypeData = (bookings: BookingWithDetails[]): RoomTypeData[] => {
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']
    const roomTypeSummary = bookings.reduce((acc, booking) => {
        const roomType = booking.room.roomType.name
        if (!acc[roomType]) {
            acc[roomType] = {bookings: 0, revenue: 0}
        }
        acc[roomType].bookings += 1
        acc[roomType].revenue += booking.totalAmount
        return acc
    }, {} as Record<string, { bookings: number; revenue: number }>)

    return Object.entries(roomTypeSummary).map(([name, data], index) => ({
        name,
        bookings: data.bookings,
        revenue: data.revenue,
        color: colors[index % colors.length]
    }))
}

export default function EnhancedAdminDashboard(): JSX.Element {
    const containerRef = useRef<HTMLDivElement>(null)

    const {data: dashboardData, isLoading, error} = useQuery<AdminDashboardStats>({
        queryKey: ['adminDashboard'],
        queryFn: async () => {
            const response = await axios.get('/api/admin/dashboard')
            return response.data.data
        },
        retry: 2,
        staleTime: 5 * 60 * 1000,
    })

    const revenueData = dashboardData ? transformToRevenueData(dashboardData.revenueData) : []
    const bookingData = dashboardData ? transformToBookingData(dashboardData.recentBookings) : []
    const roomTypeData = dashboardData ? transformToRoomTypeData(dashboardData.recentBookings) : []

    const dailyBookingsData: DailyBookingsData[] = [
        {day: 'Mon', bookings: 12, checkins: 8, checkouts: 6},
        {day: 'Tue', bookings: 15, checkins: 10, checkouts: 9},
        {day: 'Wed', bookings: 18, checkins: 12, checkouts: 8},
        {day: 'Thu', bookings: 22, checkins: 15, checkouts: 11},
        {day: 'Fri', bookings: 28, checkins: 18, checkouts: 14},
        {day: 'Sat', bookings: 35, checkins: 22, checkouts: 19},
        {day: 'Sun', bookings: 31, checkins: 20, checkouts: 16}
    ]

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
            case "available":
                return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            case "occupied":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30"
            case "maintenance":
                return "bg-orange-500/20 text-orange-400 border-orange-500/30"
            case "active":
                return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            default:
                return "bg-slate-500/20 text-slate-400 border-slate-500/30"
        }
    }




    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
                    <p className="mt-4 text-slate-300">Loading dashboard data...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400">Error loading dashboard data: {error.message}</p>
                    <Button
                        className="mt-4 bg-emerald-500 hover:bg-emerald-600"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div ref={containerRef} className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
                {/* Floating background elements */}
                <div className="fixed inset-0 pointer-events-none">
                    <div
                        className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl animate-pulse"></div>
                    <div
                        className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
                    <div
                        className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
                </div>

                {/* Navigation */}
                <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-3">
                                <div
                                    className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-sm flex items-center justify-center shadow-lg">
                                    <div className="w-5 h-5 border-2 border-slate-100 rounded-full"></div>
                                </div>
                                <div>
                                    <span
                                        className="text-lg font-light text-slate-100 tracking-wide">Tranquility Inn</span>
                                    <p className="text-xs text-slate-400 tracking-widest">ADMIN DASHBOARD</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">Admin
                                    Panel</Badge>
                                <AdminProfilePopup/>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                    <div className="mb-8">
                        <h1 className="text-3xl font-light text-slate-100 mb-2">Admin Dashboard</h1>
                        <p className="text-slate-400">Manage your mountain retreat operations and guest experiences</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <Card
                            className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400 font-light">Total Bookings</p>
                                        <p className="text-2xl font-light text-slate-100">{dashboardData?.totalBookings || 0}</p>
                                        <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                                            <TrendingUp className="h-3 w-3"/>
                                            +12% this month
                                        </p>
                                    </div>
                                    <div
                                        className="transform transition-transform group-hover:scale-110 group-hover:rotate-12">
                                        <Calendar className="h-8 w-8 text-emerald-400"/>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-blue-500/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400 font-light">Active Guests</p>
                                        <p className="text-2xl font-light text-slate-100">{dashboardData?.activeGuests || 0}</p>
                                        <p className="text-xs text-blue-400 flex items-center gap-1 mt-1">
                                            <Users className="h-3 w-3"/>
                                            Currently staying
                                        </p>
                                    </div>
                                    <div
                                        className="transform transition-transform group-hover:scale-110 group-hover:rotate-12">
                                        <Users className="h-8 w-8 text-blue-400"/>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400 font-light">Available Rooms</p>
                                        <p className="text-2xl font-light text-slate-100">{dashboardData?.availableRooms || 0}</p>
                                        <p className="text-xs text-purple-400 flex items-center gap-1 mt-1">
                                            <Home className="h-3 w-3"/>
                                            Ready for guests
                                        </p>
                                    </div>
                                    <div
                                        className="transform transition-transform group-hover:scale-110 group-hover:rotate-12">
                                        <Home className="h-8 w-8 text-purple-400"/>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card
                            className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-amber-500/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400 font-light">Revenue (Month)</p>
                                        <p className="text-2xl font-light text-slate-100">${(dashboardData?.monthlyRevenue || 0).toLocaleString()}</p>
                                        <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
                                            <DollarSign className="h-3 w-3"/>
                                            +8% vs last month
                                        </p>
                                    </div>
                                    <div
                                        className="transform transition-transform group-hover:scale-110 group-hover:rotate-12">
                                        <DollarSign className="h-8 w-8 text-amber-400"/>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList
                            className="grid w-full grid-cols-5 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                            <TabsTrigger value="overview"
                                         className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-slate-900">
                                <Activity className="h-4 w-4"/>
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="bookings"
                                         className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-slate-900">
                                <Calendar className="h-4 w-4"/>
                                Bookings
                            </TabsTrigger>
                            <TabsTrigger value="users"
                                         className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-slate-900">
                                <Users className="h-4 w-4"/>
                                Users
                            </TabsTrigger>
                            <TabsTrigger value="rooms"
                                         className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-slate-900">
                                <Home className="h-4 w-4"/>
                                Rooms
                            </TabsTrigger>
                            <TabsTrigger value="settings"
                                         className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-slate-900">
                                <Settings className="h-4 w-4"/>
                                Settings
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview">
                            <div className="grid gap-6">
                                {/* Revenue and Booking Trends */}
                                <div className="grid lg:grid-cols-2 gap-6">
                                    <Card
                                        className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                                        <CardHeader>
                                            <CardTitle
                                                className="text-xl font-light text-slate-100 flex items-center gap-2">
                                                <TrendingUp className="h-5 w-5 text-emerald-400"/>
                                                Revenue Trends
                                            </CardTitle>
                                            <CardDescription className="text-slate-400">
                                                Monthly revenue and growth patterns
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ChartContainer config={revenueChartConfig} className="h-[300px]">
                                                <AreaChart data={revenueData}>
                                                    <defs>
                                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0"
                                                                        y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                                                    <XAxis dataKey="month" stroke="#9ca3af"/>
                                                    <YAxis stroke="#9ca3af"/>
                                                    <ChartTooltip content={<ChartTooltipContent/>}/>
                                                    <Area type="monotone" dataKey="revenue" stroke="#10b981"
                                                          strokeWidth={2} fillOpacity={1} fill="url(#revenueGradient)"/>
                                                </AreaChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>

                                    <Card
                                        className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                                        <CardHeader>
                                            <CardTitle
                                                className="text-xl font-light text-slate-100 flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-blue-400"/>
                                                Booking Analytics
                                            </CardTitle>
                                            <CardDescription className="text-slate-400">
                                                Bookings and occupancy rates over time
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ChartContainer config={revenueChartConfig} className="h-[300px]">
                                                <LineChart data={revenueData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                                                    <XAxis dataKey="month" stroke="#9ca3af"/>
                                                    <YAxis stroke="#9ca3af"/>
                                                    <ChartTooltip content={<ChartTooltipContent/>}/>
                                                    <ChartLegend content={<ChartLegendContent/>}/>
                                                    <Line type="monotone" dataKey="bookings" stroke="#3b82f6"
                                                          strokeWidth={3}
                                                          dot={{fill: '#3b82f6', strokeWidth: 2, r: 4}}/>
                                                    <Line type="monotone" dataKey="occupancy" stroke="#8b5cf6"
                                                          strokeWidth={3}
                                                          dot={{fill: '#8b5cf6', strokeWidth: 2, r: 4}}/>
                                                </LineChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Room Performance and Daily Activity */}
                                <div className="grid lg:grid-cols-2 gap-6">
                                    <Card
                                        className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                                        <CardHeader>
                                            <CardTitle
                                                className="text-xl font-light text-slate-100 flex items-center gap-2">
                                                <Home className="h-5 w-5 text-purple-400"/>
                                                Room Performance
                                            </CardTitle>
                                            <CardDescription className="text-slate-400">
                                                Booking distribution by room type
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ChartContainer config={roomPerformanceConfig} className="h-[300px]">
                                                <PieChart>
                                                    <Pie data={roomTypeData} cx="50%" cy="50%" outerRadius={100}
                                                         dataKey="bookings"
                                                         label={({name, value}) => `${name}: ${value}`}>
                                                        {roomTypeData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color}/>
                                                        ))}
                                                    </Pie>
                                                    <ChartTooltip content={<ChartTooltipContent/>}/>
                                                </PieChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>

                                    <Card
                                        className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                                        <CardHeader>
                                            <CardTitle
                                                className="text-xl font-light text-slate-100 flex items-center gap-2">
                                                <Clock className="h-5 w-5 text-amber-400"/>
                                                Daily Activity
                                            </CardTitle>
                                            <CardDescription className="text-slate-400">
                                                Weekly check-ins, check-outs, and new bookings
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ChartContainer config={dailyActivityConfig} className="h-[300px]">
                                                <BarChart data={dailyBookingsData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                                                    <XAxis dataKey="day" stroke="#9ca3af"/>
                                                    <YAxis stroke="#9ca3af"/>
                                                    <ChartTooltip content={<ChartTooltipContent/>}/>
                                                    <ChartLegend content={<ChartLegendContent/>}/>
                                                    <Bar dataKey="checkins" fill="#10b981" radius={[4, 4, 0, 0]}/>
                                                    <Bar dataKey="checkouts" fill="#ef4444" radius={[4, 4, 0, 0]}/>
                                                    <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]}/>
                                                </BarChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Quick Stats Grid */}
                                <div className="grid md:grid-cols-3 gap-6">
                                    <Card
                                        className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-400 font-light">Average Rating</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-2xl font-light text-slate-100">{dashboardData?.averageRating || 0}</p>
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star key={star}
                                                                      className="h-4 w-4 fill-amber-400 text-amber-400"/>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-emerald-400 mt-1">+0.2 from last
                                                        month</p>
                                                </div>
                                                <Star className="h-8 w-8 text-amber-400"/>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card
                                        className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-400 font-light">Occupancy Rate</p>
                                                    <p className="text-2xl font-light text-slate-100">{dashboardData?.occupancyRate || 0}%</p>
                                                    <p className="text-xs text-blue-400 mt-1">Above target (85%)</p>
                                                </div>
                                                <Activity className="h-8 w-8 text-blue-400"/>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card
                                        className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-400 font-light">Avg. Stay
                                                        Duration</p>
                                                    <p className="text-2xl font-light text-slate-100">3.2</p>
                                                    <p className="text-xs text-purple-400 mt-1">days per booking</p>
                                                </div>
                                                <Clock className="h-8 w-8 text-purple-400"/>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Recent Activity */}
                                <Card
                                    className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                                    <CardHeader>
                                        <CardTitle
                                            className="text-xl font-light text-slate-100 flex items-center gap-2">
                                            <Activity className="h-5 w-5 text-emerald-400"/>
                                            Recent Activity
                                        </CardTitle>
                                        <CardDescription className="text-slate-400">
                                            Latest updates and notifications
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {bookingData.slice(0, 4).map((booking, index) => (
                                                <div key={booking.id}
                                                     className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                                        <span
                                                            className="text-slate-200">New booking from {booking.guest} for {booking.room} room</span>
                                                    </div>
                                                    <span
                                                        className="text-slate-400 text-sm">{index === 0 ? '5 minutes ago' : `${index * 7} minutes ago`}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="bookings">
                            <BookingManagement/>
                        </TabsContent>

                        <TabsContent value="users">
                            <Card className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-2xl font-light text-slate-100">User
                                        Management</CardTitle>
                                    <Button
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-slate-900 flex items-center gap-2 font-light shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                                        <Plus className="h-4 w-4"/>
                                        Add User
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-slate-700/30">
                                                <TableRow className="border-slate-700/50 hover:bg-slate-700/20">
                                                    <TableHead className="text-slate-300 font-light">Name</TableHead>
                                                    <TableHead className="text-slate-300 font-light">Email</TableHead>
                                                    <TableHead className="text-slate-300 font-light">Role</TableHead>
                                                    <TableHead
                                                        className="text-slate-300 font-light">Bookings</TableHead>
                                                    <TableHead className="text-slate-300 font-light">Status</TableHead>
                                                    <TableHead className="text-slate-300 font-light">Joined</TableHead>
                                                    <TableHead className="text-slate-300 font-light">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {dashboardData?.recentBookings.map((booking) => (
                                                    <TableRow key={booking.user.id}
                                                              className="border-slate-700/50 hover:bg-slate-700/20 transition-colors duration-200">
                                                        <TableCell
                                                            className="font-medium text-slate-200">{`${booking.user.firstName} ${booking.user.lastName}`}</TableCell>
                                                        <TableCell
                                                            className="text-slate-300">{booking.user.email}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                className={booking.user.id === 1 ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-slate-500/20 text-slate-400 border border-slate-500/30"}>
                                                                {booking.user.id === 1 ? "ADMIN" : "GUEST"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-slate-300">{1}</TableCell>
                                                        <TableCell>
                                                            <Badge className={getStatusColor("active")}>Active</Badge>
                                                        </TableCell>
                                                        <TableCell
                                                            className="text-slate-300">{new Date().toISOString().split('T')[0]}</TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm"
                                                                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent transition-all duration-300">
                                                                    <Edit className="h-4 w-4"/>
                                                                </Button>
                                                                <Button variant="outline" size="sm"
                                                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400 bg-transparent transition-all duration-300">
                                                                    <Trash2 className="h-4 w-4"/>
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="rooms">
                            <Card className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-2xl font-light text-slate-100">Room
                                        Management</CardTitle>
                                    <Button
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-slate-900 flex items-center gap-2 font-light shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                                        <Plus className="h-4 w-4"/>
                                        Add Room
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-slate-700/30">
                                                <TableRow className="border-slate-700/50 hover:bg-slate-700/20">
                                                    <TableHead className="text-slate-300 font-light">Room
                                                        Number</TableHead>
                                                    <TableHead className="text-slate-300 font-light">Type</TableHead>
                                                    <TableHead className="text-slate-300 font-light">Floor</TableHead>
                                                    <TableHead className="text-slate-300 font-light">Status</TableHead>
                                                    <TableHead
                                                        className="text-slate-300 font-light">Occupancy</TableHead>
                                                    <TableHead
                                                        className="text-slate-300 font-light">Price/Night</TableHead>
                                                    <TableHead className="text-slate-300 font-light">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {dashboardData?.recentBookings.map((booking) => (
                                                    <TableRow key={booking.room.id}
                                                              className="border-slate-700/50 hover:bg-slate-700/20 transition-colors duration-200">
                                                        <TableCell
                                                            className="font-medium text-slate-200">{booking.room.roomNumber}</TableCell>
                                                        <TableCell
                                                            className="text-slate-300">{booking.room.roomType.name}</TableCell>
                                                        <TableCell>
                                                            <Badge className={getStatusColor(booking.status)}>
                                                                {booking.status === "CONFIRMED" ? "Occupied" : "Available"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell
                                                            className="text-slate-300">{booking.status === "CONFIRMED" ? "2 guests" : "Empty"}</TableCell>
                                                        <TableCell
                                                            className="text-amber-400 font-medium">${booking.room.roomType.basePrice}</TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm"
                                                                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent transition-all duration-300">
                                                                    <Edit className="h-4 w-4"/>
                                                                </Button>
                                                                <Button variant="outline" size="sm"
                                                                        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 bg-transparent transition-all duration-300">
                                                                    View
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="settings">
                            <Card className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-light text-slate-100">System
                                        Settings</CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Configure your hotel management system
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-light text-slate-100">Hotel Information</h3>
                                            <div>
                                                <Label className="text-slate-300 mb-2 block font-light">Hotel
                                                    Name</Label>
                                                <Input
                                                    defaultValue="Tranquility Inn"
                                                    className="bg-slate-700/50 border-slate-600 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-300"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-slate-300 mb-2 block font-light">Contact
                                                    Email</Label>
                                                <Input
                                                    defaultValue="hello@tranquility-inn.com"
                                                    className="bg-slate-700/50 border-slate-600 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-300"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-slate-300 mb-2 block font-light">Phone
                                                    Number</Label>
                                                <Input
                                                    defaultValue="+1 (555) 123-4567"
                                                    className="bg-slate-700/50 border-slate-600 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-300"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-light text-slate-100">Booking Settings</h3>
                                            <div>
                                                <Label className="text-slate-300 mb-2 block font-light">Check-in
                                                    Time</Label>
                                                <Input
                                                    defaultValue="3:00 PM"
                                                    className="bg-slate-700/50 border-slate-600 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-300"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-slate-300 mb-2 block font-light">Check-out
                                                    Time</Label>
                                                <Input
                                                    defaultValue="11:00 AM"
                                                    className="bg-slate-700/50 border-slate-600 text-slate-100 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-300"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-slate-300 mb-2 block font-light">Cancellation
                                                    Policy</Label>
                                                <Select defaultValue="flexible">
                                                    <SelectTrigger
                                                        className="bg-slate-700/50 border-slate-600 text-slate-100 focus:border-amber-400">
                                                        <SelectValue/>
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-800 border-slate-700">
                                                        <SelectItem value="flexible">Flexible</SelectItem>
                                                        <SelectItem value="moderate">Moderate</SelectItem>
                                                        <SelectItem value="strict">Strict</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-light shadow-lg hover:shadow-amber-500/25 transition-all duration-300">
                                            Save Settings
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </LocalizationProvider>
    )
}