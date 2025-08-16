'use client'

import React, {useState} from "react"
import {Edit, Mail, Phone, Plus, Search, Shield, User, Users} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
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

const UserCreateSchema = z.object({
    email: z.string().email("Invalid email format").max(255, "Email too long"),
    password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
    firstName: z.string().min(1, "First name is required").max(100, "First name too long"),
    lastName: z.string().min(1, "Last name is required").max(100, "Last name too long"),
    phone: z.string().max(20, "Phone number too long").optional().nullable(),
    role: z.enum([Role.STAFF, Role.ADMIN], {
        errorMap: () => ({message: "Role must be STAFF or ADMIN"})
    })
})

const UserUpdateSchema = z.object({
    email: z.string().email("Invalid email format").max(255, "Email too long").optional(),
    password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long").optional(),
    firstName: z.string().min(1, "First name is required").max(100, "First name too long").optional(),
    lastName: z.string().min(1, "Last name is required").max(100, "Last name too long").optional(),
    phone: z.string().max(20, "Phone number too long").nullable().optional(),
    role: z.enum([Role.STAFF, Role.ADMIN], {
        errorMap: () => ({message: "Role must be STAFF or ADMIN"})
    }).optional(),
    isDeleted: z.boolean().optional()
})

interface UserInternal {
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

interface UsersResponse {
    users: UserInternal[]
    pagination: {
        page: number
        limit: number
        totalCount: number
        totalPages: number
    }
}

interface UserFormData {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
    role: Role
}


export function UserManagement() {
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [roleFilter, setRoleFilter] = useState<string>("ALL")
    const [includeDeleted, setIncludeDeleted] = useState<boolean>(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserInternal | null>(null)
    const [formData, setFormData] = useState<UserFormData>({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        role: Role.STAFF,
    })
    const [editData, setEditData] = useState<UpdateUserRequest>({
        email: "",
        passwordHash: "",
        firstName: "",
        lastName: "",
        phone: "",
        role: Role.STAFF,
        isDeleted: false,
    })

    const queryClient = useQueryClient()

    // Fetch users
    const {data: usersData, isLoading: usersLoading, error: usersError} = useQuery<UsersResponse>({
        queryKey: ['users', currentPage, roleFilter, searchTerm, includeDeleted],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
            })
            if (roleFilter && roleFilter !== 'ALL') params.append('role', roleFilter)
            if (searchTerm) params.append('search', searchTerm)
            if (includeDeleted) params.append('includeDeleted', 'true')

            const response = await axios.get(`/api/user/secure?${params}`)
            return response.data.data
        },
        retry: 2,
    })

    const createUserMutation = useMutation({
        mutationFn: async (data: z.infer<typeof UserCreateSchema>) => {
            console.log("Submitting user data:", data)
            const response = await axios.post('/api/user/secure', data)
            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['users']})
            setIsCreateModalOpen(false)
            resetForm()
            toast.success("User created successfully")
        },
        onError: (error) => {
            toast.error(error.message || error.message || "Failed to create user")
        },
    })

    const updateUserMutation = useMutation({
        mutationFn: async ({id, data}: { id: number, data: z.infer<typeof UserUpdateSchema> }) => {
            console.log("Updating user ID:", id, "with data:", data)
            const response = await axios.put(`/api/user/${id}`, data)
            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['users']})
            setIsEditModalOpen(false)
            setSelectedUser(null)
            toast.success("User updated successfully")
        },
        onError: (error) => {
            toast.error(error.message || error.message || "Failed to update user")
        },
    })


    const resetForm = () => {
        setFormData({
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            phone: "",
            role: Role.STAFF,
        })
    }

    const resetEditForm = () => {
        setEditData({
            email: "",
            passwordHash: "",
            firstName: "",
            lastName: "",
            phone: "",
            role: Role.STAFF,
            isDeleted: false,
        })
    }

    const handleCreateUser = () => {
        console.log("Form data before submission:", formData)
        try {
            const userData = UserCreateSchema.parse({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone || null,
                role: formData.role,
            })
            createUserMutation.mutate(userData)
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

    const handleEditUser = (user: UserInternal) => {
        setSelectedUser(user)
        setEditData({
            email: user.email,
            passwordHash: "",
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone || "",
            role: user.role as Role,
            isDeleted: user.isDeleted,
        })
        setIsEditModalOpen(true)
    }

    const handleUpdateUser = () => {
        if (!selectedUser) {
            console.error("No user selected for update")
            return
        }
        try {
            const updatePayload: UpdateUserRequest = {
                email: editData.email,
                firstName: editData.firstName,
                lastName: editData.lastName,
                phone: editData.phone,
                role: editData.role,
                isDeleted: editData.isDeleted,
            }

            if (editData.passwordHash && editData.passwordHash.length > 8) {
                updatePayload.passwordHash = editData.passwordHash
            }

            const validatedData = UserUpdateSchema.parse(updatePayload)
            updateUserMutation.mutate({id: selectedUser.id, data: validatedData})
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

    const getRoleColor = (role: string): string => {
        switch (role.toUpperCase()) {
            case "ADMIN":
                return "bg-purple-500/20 text-purple-400 border-purple-500/30"
            case "STAFF":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30"
            case "GUEST":
                return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
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

    const filteredUsers = usersData?.users || []
    const totalPages = usersData?.pagination?.totalPages || 1

    if (usersLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
            </div>
        )
    }

    if (usersError) {
        return (
            <div className="text-center text-red-400 p-8">
                Error loading users: {usersError.message}
            </div>
        )
    }

    return (
        <>
            <Card className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-light text-slate-100 flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-400"/>
                        User Management
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
                                onClick={() => console.log("New User button clicked")}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-slate-900 flex items-center gap-2 font-light shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                            >
                                <Plus className="h-4 w-4"/>
                                New User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-2xl">
                            <ErrorBoundary>
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-light">Create New User</DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        Add a new staff or admin user to the system
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-slate-300 mb-2 block font-light">Phone</Label>
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                className="bg-slate-700/50 border-slate-600 text-slate-100"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-300 mb-2 block font-light">Role *</Label>
                                            <Select
                                                value={formData.role}
                                                onValueChange={(value) => setFormData({
                                                    ...formData,
                                                    role: value as Role
                                                })}
                                            >
                                                <SelectTrigger
                                                    className="bg-slate-700/50 border-slate-600 text-slate-100">
                                                    <SelectValue/>
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-slate-700">
                                                    <SelectItem value={Role.STAFF}>Staff</SelectItem>
                                                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
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
                                        onClick={handleCreateUser}
                                        disabled={createUserMutation.isPending || !formData.email || !formData.password || !formData.firstName || !formData.lastName}
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-slate-900"
                                    >
                                        {createUserMutation.isPending ? "Creating..." : "Create User"}
                                    </Button>
                                </div>
                            </ErrorBoundary>
                        </DialogContent>
                    </Dialog>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="col-span-2">
                            <Label className="text-slate-300 mb-2 block font-light">Search Users</Label>
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400"/>
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-slate-300 mb-2 block font-light">Role Filter</Label>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger
                                    className="bg-slate-700/50 border-slate-600 text-slate-100 focus:border-blue-400">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="ALL">All Roles</SelectItem>
                                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                                    <SelectItem value={Role.STAFF}>Staff</SelectItem>
                                </SelectContent>
                            </Select>
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
                                    <TableHead className="text-slate-300 font-light">Role</TableHead>
                                    <TableHead className="text-slate-300 font-light">Status</TableHead>
                                    <TableHead className="text-slate-300 font-light">Created</TableHead>
                                    <TableHead className="text-slate-300 font-light">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user: UserInternal) => (
                                    <TableRow key={user.id}
                                              className="border-slate-700/50 hover:bg-slate-700/20 transition-colors duration-200">
                                        <TableCell className="font-medium text-slate-200">#{user.id}</TableCell>
                                        <TableCell className="text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-slate-400"/>
                                                <div>
                                                    <div>{user.firstName} {user.lastName}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-slate-400"/>
                                                {user.email}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            {user.phone ? (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-slate-400"/>
                                                    {user.phone}
                                                </div>
                                            ) : (
                                                <span className="text-slate-500">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`${getRoleColor(user.role)} border flex items-center gap-1 w-fit`}>
                                                <Shield className="h-3 w-3"/>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={user.isDeleted
                                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                            }>
                                                {user.isDeleted ? "Deleted" : "Active"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-300">{formatDate(user.createdAt)}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditUser(user)}
                                                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 bg-transparent transition-all duration-300"
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

            {/* Edit User Modal */}
            <Dialog
                open={isEditModalOpen}
                onOpenChange={(open) => {
                    console.log("Edit modal open state:", open)
                    setIsEditModalOpen(open)
                    if (!open) {
                        setSelectedUser(null)
                        resetEditForm()
                    }
                }}
            >
                <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 max-w-2xl">
                    <ErrorBoundary>
                        {selectedUser ? (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-light">Edit User</DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        Update user #{selectedUser.id} information
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-slate-300 mb-2 block font-light">Phone</Label>
                                            <Input
                                                value={editData.phone}
                                                onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                                className="bg-slate-700/50 border-slate-600 text-slate-100"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-slate-300 mb-2 block font-light">Role *</Label>
                                            <Select
                                                value={editData.role}
                                                onValueChange={(value) => setEditData({
                                                    ...editData,
                                                    role: value as Role
                                                })}
                                            >
                                                <SelectTrigger
                                                    className="bg-slate-700/50 border-slate-600 text-slate-100">
                                                    <SelectValue/>
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-slate-700">
                                                    <SelectItem value={Role.STAFF}>Staff</SelectItem>
                                                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
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
                                        onClick={handleUpdateUser}
                                        disabled={updateUserMutation.isPending || !editData.email || !editData.firstName || !editData.lastName}
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-slate-900"
                                    >
                                        {updateUserMutation.isPending ? "Updating..." : "Update User"}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-red-400">No user selected</div>
                        )}
                    </ErrorBoundary>
                </DialogContent>
            </Dialog>
        </>
    )
}