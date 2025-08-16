'use client'

import React, {useState} from "react"
import {Edit, Mail, Phone, Plus, Search, Shield, User, Users} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
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
import {toast} from "sonner"
import {Role} from "@/app/generated/prisma"
import {UpdateUserRequest} from "@/app/api/(protected)/user/[id]/route";

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

const GuestCreateSchema = z.object({
    email: z.string().email("Invalid email format").max(255, "Email too long"),
    password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
    firstName: z.string().min(1, "First name is required").max(100, "First name too long"),
    lastName: z.string().min(1, "Last name is required").max(100, "Last name too long"),
    phone: z.string().max(20, "Phone number too long").optional().nullable(),
    role: z.literal(Role.GUEST)
})

const GuestUpdateSchema = z.object({
    email: z.string().email("Invalid email format").max(255, "Email too long").optional(),
    password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long").optional(),
    firstName: z.string().min(1, "First name is required").max(100, "First name too long").optional(),
    lastName: z.string().min(1, "Last name is required").max(100, "Last name too long").optional(),
    phone: z.string().max(20, "Phone number too long").nullable().optional(),
    role: z.literal(Role.GUEST).optional(),
    isDeleted: z.boolean().optional()
})

interface GuestInternal {
    id: number
    email: string
    firstName: string
    lastName: string
    phone: string | null
    role: string
    isDeleted: boolean
    createdAt: Date
    updatedAt: Date
}

interface GuestsResponse {
    users: GuestInternal[]
    pagination: {
        page: number
        limit: number
        totalCount: number
        totalPages: number
    }
}

interface GuestFormData {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
}

interface GuestEditData {
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    phone: string
    isDeleted: boolean
}

export function GuestManagement() {
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [includeDeleted, setIncludeDeleted] = useState<boolean>(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedGuest, setSelectedGuest] = useState<GuestInternal | null>(null)
    const [formData, setFormData] = useState<GuestFormData>({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
    })
    const [editData, setEditData] = useState<GuestEditData>({
        email: "",
        passwordHash: "",
        firstName: "",
        lastName: "",
        phone: "",
        isDeleted: false,
    })

    const queryClient = useQueryClient()

    // Fetch guests (only GUEST role users)
    const {data: guestsData, isLoading: guestsLoading, error: guestsError} = useQuery<GuestsResponse>({
        queryKey: ['guests', currentPage, searchTerm, includeDeleted],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                role: Role.GUEST,
            })
            if (searchTerm) params.append('search', searchTerm)
            if (includeDeleted) params.append('includeDeleted', 'true')

            const response = await axios.get(`/api/user/secure?${params}`)
            return response.data.data
        },
        retry: 2,
    })

    const createGuestMutation = useMutation({
        mutationFn: async (data: z.infer<typeof GuestCreateSchema>) => {
            console.log("Submitting guest data:", data)
            const response = await axios.post('/api/user/secure', data)
            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['guests']})
            setIsCreateModalOpen(false)
            resetForm()
            toast.success("Guest created successfully")
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create guest")
        },
    })

    const updateGuestMutation = useMutation({
        mutationFn: async ({id, data}: { id: number, data: z.infer<typeof GuestUpdateSchema> }) => {
            console.log("Updating guest ID:", id, "with data:", data)
            const response = await axios.put(`/api/user/${id}`, data)
            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['guests']})
            setIsEditModalOpen(false)
            setSelectedGuest(null)
            toast.success("Guest updated successfully")
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update guest")
        },
    })

    const resetForm = () => {
        setFormData({
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            phone: "",
        })
    }

    const resetEditForm = () => {
        setEditData({
            email: "",
            passwordHash: "",
            firstName: "",
            lastName: "",
            phone: "",
            isDeleted: false,
        })
    }

    const handleCreateGuest = () => {
        console.log("Form data before submission:", formData)
        try {
            const guestData = GuestCreateSchema.parse({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone || null,
                role: Role.GUEST, // Always set to GUEST
            })
            createGuestMutation.mutate(guestData)
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

    const handleEditGuest = (guest: GuestInternal) => {
        setSelectedGuest(guest)
        setEditData({
            email: guest.email,
            passwordHash: "",
            firstName: guest.firstName,
            lastName: guest.lastName,
            phone: guest.phone || "",
            isDeleted: guest.isDeleted,
        })
        setIsEditModalOpen(true)
    }

    const handleUpdateGuest = () => {
        if (!selectedGuest) {
            console.error("No guest selected for update")
            return
        }
        try {
            const updatePayload: UpdateUserRequest = {
                email: editData.email,
                firstName: editData.firstName,
                lastName: editData.lastName,
                phone: editData.phone,
                role: Role.GUEST, // Always keep as GUEST
                isDeleted: editData.isDeleted,
            }

            if (editData.passwordHash && editData.passwordHash.length > 8) {
                updatePayload.passwordHash = editData.passwordHash
            }

            const validatedData = GuestUpdateSchema.parse(updatePayload)
            updateGuestMutation.mutate({id: selectedGuest.id, data: validatedData})
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("Update validation errors:", error.errors)
                toast.error(error.errors[0].message)
            } else {
                console.error("Unexpected error:", error)
                toast.error("An unexpected error occurred")
            }
        }
    }

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const filteredGuests = guestsData?.users || []
    const totalPages = guestsData?.pagination?.totalPages || 1

    if (guestsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
            </div>
        )
    }

    if (guestsError) {
        return (
            <div className="text-center text-red-400 p-8">
                Error loading guests: {guestsError.message}
            </div>
        )
    }

    return (
        <>
            <Card className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-light text-slate-100 flex items-center gap-2">
                        <Users className="h-6 w-6 text-emerald-400"/>
                        Guest Management
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
                                onClick={() => console.log("New Guest button clicked")}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-900 flex items-center gap-2 font-light shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                            >
                                <Plus className="h-4 w-4"/>
                                New Guest
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-2xl">
                            <ErrorBoundary>
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-light">Create New Guest</DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        Add a new guest user to the system
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-slate-300 mb-2 block font-light">First Name *</Label>
                                            <Input
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                                className="bg-slate-700/50 border-slate-600 text-slate-100"
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-300 mb-2 block font-light">Last Name *</Label>
                                            <Input
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                                className="bg-slate-700/50 border-slate-600 text-slate-100"
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-slate-300 mb-2 block font-light">Email *</Label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="bg-slate-700/50 border-slate-600 text-slate-100"
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-slate-300 mb-2 block font-light">Password *</Label>
                                        <Input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className="bg-slate-700/50 border-slate-600 text-slate-100"
                                            placeholder="Enter password (min 6 characters)"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-slate-300 mb-2 block font-light">Phone</Label>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="bg-slate-700/50 border-slate-600 text-slate-100"
                                            placeholder="Enter phone number"
                                        />
                                    </div>

                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreateGuest}
                                        disabled={createGuestMutation.isPending || !formData.email || !formData.password || !formData.firstName || !formData.lastName}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-900"
                                    >
                                        {createGuestMutation.isPending ? "Creating..." : "Create Guest"}
                                    </Button>
                                </div>
                            </ErrorBoundary>
                        </DialogContent>
                    </Dialog>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="col-span-2">
                            <Label className="text-slate-300 mb-2 block font-light">Search Guests</Label>
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400"/>
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-300"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-slate-300 mb-2 block font-light">Include Deleted</Label>
                            <Button
                                variant="outline"
                                onClick={() => setIncludeDeleted(!includeDeleted)}
                                className={`w-full justify-start ${includeDeleted
                                    ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                                    : 'border-slate-600 text-slate-300 hover:bg-slate-700/50'
                                }`}
                            >
                                {includeDeleted ? "Hide Deleted" : "Show Deleted"}
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-700/30">
                                <TableRow className="border-slate-700/50 hover:bg-slate-700/20">
                                    <TableHead className="text-slate-300 font-light">ID</TableHead>
                                    <TableHead className="text-slate-300 font-light">Name</TableHead>
                                    <TableHead className="text-slate-300 font-light">Email</TableHead>
                                    <TableHead className="text-slate-300 font-light">Phone</TableHead>
                                    <TableHead className="text-slate-300 font-light">Status</TableHead>
                                    <TableHead className="text-slate-300 font-light">Created</TableHead>
                                    <TableHead className="text-slate-300 font-light">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredGuests.map((guest: GuestInternal) => (
                                    <TableRow key={guest.id}
                                              className="border-slate-700/50 hover:bg-slate-700/20 transition-colors duration-200">
                                        <TableCell className="font-medium text-slate-200">#{guest.id}</TableCell>
                                        <TableCell className="text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-slate-400"/>
                                                <div>
                                                    <div>{guest.firstName} {guest.lastName}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-slate-400"/>
                                                {guest.email}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            {guest.phone ? (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-slate-400"/>
                                                    {guest.phone}
                                                </div>
                                            ) : (
                                                <span className="text-slate-500">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={guest.isDeleted
                                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                            }>
                                                {guest.isDeleted ? "Deleted" : "Active"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-300">{formatDate(guest.createdAt)}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditGuest(guest)}
                                                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 bg-transparent transition-all duration-300"
                                                >
                                                    <Edit className="h-4 w-4"/>
                                                </Button>
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

            {/* Edit Guest Modal */}
            <Dialog
                open={isEditModalOpen}
                onOpenChange={(open) => {
                    console.log("Edit modal open state:", open)
                    setIsEditModalOpen(open)
                    if (!open) {
                        setSelectedGuest(null)
                        resetEditForm()
                    }
                }}
            >
                <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-2xl">
                    <ErrorBoundary>
                        {selectedGuest ? (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-light">Edit Guest</DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        Update guest #{selectedGuest.id} information
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-slate-300 mb-2 block font-light">First Name *</Label>
                                            <Input
                                                value={editData.firstName}
                                                onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                                                className="bg-slate-700/50 border-slate-600 text-slate-100"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-300 mb-2 block font-light">Last Name *</Label>
                                            <Input
                                                value={editData.lastName}
                                                onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                                                className="bg-slate-700/50 border-slate-600 text-slate-100"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-slate-300 mb-2 block font-light">Email *</Label>
                                        <Input
                                            type="email"
                                            value={editData.email}
                                            onChange={(e) => setEditData({...editData, email: e.target.value})}
                                            className="bg-slate-700/50 border-slate-600 text-slate-100"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-slate-300 mb-2 block font-light">New Password</Label>
                                        <Input
                                            type="password"
                                            value={editData.passwordHash}
                                            onChange={(e) => setEditData({...editData, passwordHash: e.target.value})}
                                            className="bg-slate-700/50 border-slate-600 text-slate-100"
                                            placeholder="Leave empty to keep current password"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-slate-300 mb-2 block font-light">Phone</Label>
                                        <Input
                                            value={editData.phone}
                                            onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                            className="bg-slate-700/50 border-slate-600 text-slate-100"
                                        />
                                    </div>
                                    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-emerald-400"/>
                                            <span className="text-slate-300 font-light">Role: Guest (Fixed)</span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Guest role cannot be changed
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="isDeleted"
                                            checked={editData.isDeleted}
                                            onChange={(e) => setEditData({...editData, isDeleted: e.target.checked})}
                                            className="rounded border-slate-600 bg-slate-700/50 text-red-500 focus:ring-red-500/20"
                                        />
                                        <Label htmlFor="isDeleted" className="text-slate-300 font-light">
                                            Mark as deleted
                                        </Label>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleUpdateGuest}
                                        disabled={updateGuestMutation.isPending || !editData.email || !editData.firstName || !editData.lastName}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-900"
                                    >
                                        {updateGuestMutation.isPending ? "Updating..." : "Update Guest"}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-red-400">No guest selected</div>
                        )}
                    </ErrorBoundary>
                </DialogContent>
            </Dialog>
        </>
    )
}