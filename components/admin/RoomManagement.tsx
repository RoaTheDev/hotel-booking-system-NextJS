'use client'

import React, { JSX } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Plus } from "lucide-react"
import { AdminDashboardStats } from "@/types/roomTypes"

interface RoomManagementProps {
    dashboardData?: AdminDashboardStats
}

export function RoomManagement({ dashboardData }: RoomManagementProps): JSX.Element {
    return (
        <Card className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-light text-slate-100">Room Management</CardTitle>
                <Button
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-slate-900 flex items-center gap-2 font-light shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                    <Plus className="h-4 w-4" />
                    Add Room
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-700/30">
                            <TableRow className="border-slate-700/50 hover:bg-slate-700/20">
                                <TableHead className="text-slate-300 font-light">Room No</TableHead>
                                <TableHead className="text-slate-300 font-light">Type</TableHead>
                                <TableHead className="text-slate-300 font-light">Floor</TableHead>
                                <TableHead className="text-slate-300 font-light">Status</TableHead>
                                <TableHead className="text-slate-300 font-light">Occupancy</TableHead>
                                <TableHead className="text-slate-300 font-light">Price/Night</TableHead>
                                <TableHead className="text-slate-300 font-light">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dashboardData?.recentBookings.map((booking) => (
                                <TableRow key={booking.id} className="border-slate-700/50 hover:bg-slate-700/20 transition-colors duration-200">
                                    <TableCell className="font-medium text-slate-200">{booking.room.roomNumber}</TableCell>
                                    <TableCell className="text-slate-300">{booking.room.roomType.name}</TableCell>
                                    <TableCell>
                                        <Badge>{booking.room.floor}</Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-300">{booking.status}</TableCell>
                                    {booking.status !== "CANCELLED" ? (
                                        <TableCell className="text-slate-300">{booking.guests > 1 ? `${booking.guests} guests` : `${booking.guests} guest`}</TableCell>
                                    ) : (
                                        <TableCell className="text-slate-300">Empty</TableCell>
                                    )}
                                    <TableCell className="text-amber-400 font-medium">${booking.room.roomType.basePrice}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent transition-all duration-300">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 bg-transparent transition-all duration-300">
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
    )
}