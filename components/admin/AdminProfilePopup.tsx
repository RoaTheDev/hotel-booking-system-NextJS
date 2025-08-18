'use client'

import React, {useEffect, useRef, useState} from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {gsap} from "gsap"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Badge} from "@/components/ui/badge"
import {Edit, LogOut, Save, User, X} from "lucide-react"
import {ProfileForm, profileSchema} from "@/types/authTypes"
import {useAuthStore} from "@/stores/AuthStore"
import {toast} from "sonner"
import {useRouter} from "next/navigation";

export const AdminProfilePopup = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const {user, isAuthenticated, isHydrated, updateProfile, logout, revalidateSession} = useAuthStore()
    const modalRef = useRef<HTMLDivElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)
    const route = useRouter();
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
        if (user) {
            reset({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || null,
            })
        }
    }, [user, reset])

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (isOpen) {
                gsap.fromTo(
                    overlayRef.current,
                    {opacity: 0},
                    {opacity: 0.8, duration: 0.3, ease: "power2.out"}
                )
                gsap.fromTo(
                    modalRef.current,
                    {opacity: 0, scale: 0.9, y: 0},
                    {opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)"}
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
            }
        }, [modalRef, isOpen])

        return () => ctx.revert()
    }, [isOpen])

    const onSubmit = async (data: ProfileForm) => {
        setIsLoading(true)
        gsap.to(".save-btn", {scale: 0.95, duration: 0.1})

        try {
            await updateProfile(data)
            setIsEditing(false)
            toast.success("Profile updated successfully")
            gsap.to(modalRef.current, {
                scale: 1.02,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut",
            })
        } catch (error) {
            console.error("Profile update failed:", error)
            toast.error("Failed to update profile")
            const tl = gsap.timeline()
            tl.to(modalRef.current, {x: -10, duration: 0.1, ease: "power2.inOut"})
                .to(modalRef.current, {x: 10, duration: 0.1, ease: "power2.inOut"})
                .to(modalRef.current, {x: -10, duration: 0.1, ease: "power2.inOut"})
                .to(modalRef.current, {x: 10, duration: 0.1, ease: "power2.inOut"})
                .to(modalRef.current, {x: 0, duration: 0.1, ease: "power2.inOut"})
        } finally {
            setIsLoading(false)
            gsap.to(".save-btn", {scale: 1, duration: 0.2})
        }
    }
    const onSignOut = async () => {
        await logout()
        await revalidateSession()
        route.push('/')

    }
    const handleCancel = () => {
        reset()
        setIsEditing(false)
        gsap.to(modalRef.current, {
            scale: 0.98,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
        })
    }

    const handleClose = () => {
        gsap.to(modalRef.current, {
            opacity: 0,
            scale: 0.9,
            y: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => setIsOpen(false),
        })
        gsap.to(overlayRef.current, {opacity: 0, duration: 0.3, ease: "power2.in"})
    }

    if (!isHydrated || !isAuthenticated) {
        return null
    }

    return (
        <>
            <Button
                variant="ghost"
                className="text-slate-300 hover:bg-slate-800 hover:text-purple-400 transition-all duration-300"
                onClick={() => setIsOpen(true)}
            >
                Profile
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
                    <div
                        ref={overlayRef}
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                        onClick={handleClose}
                    />
                    <div
                        ref={modalRef}
                        className="relative w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-2xl p-6 max-h-[80vh] overflow-y-auto"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 hover:bg-slate-700/50"
                            onClick={handleClose}
                        >
                            <X className="h-4 w-4"/>
                        </Button>

                        <div className="flex items-center gap-4 mb-6">
                            <div
                                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-slate-900"/>
                            </div>
                            <div>
                                <h2 className="text-xl font-light text-slate-100">
                                    {user!.firstName} {user!.lastName}
                                </h2>
                                <Badge className="mt-1 bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                    {user!.role === "ADMIN" ? "Administrator" : "Guest"}
                                </Badge>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="form-input">
                                    <Label className="text-slate-300 mb-2 block font-light">First Name</Label>
                                    <Input
                                        {...register("firstName")}
                                        disabled={!isEditing}
                                        className={
                                            !isEditing
                                                ? "bg-slate-700/30 border-slate-600/50 text-slate-300"
                                                : "bg-slate-700/50 border-slate-600 text-slate-100 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
                                        }
                                    />
                                    {errors.firstName && (
                                        <p className="text-sm text-red-400 mt-1">{errors.firstName.message}</p>
                                    )}
                                </div>
                                <div className="form-input">
                                    <Label className="text-slate-300 mb-2 block font-light">Last Name</Label>
                                    <Input
                                        {...register("lastName")}
                                        disabled={!isEditing}
                                        className={
                                            !isEditing
                                                ? "bg-slate-700/30 border-slate-600/50 text-slate-300"
                                                : "bg-slate-700/50 border-slate-600 text-slate-100 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
                                        }
                                    />
                                    {errors.lastName && (
                                        <p className="text-sm text-red-400 mt-1">{errors.lastName.message}</p>
                                    )}
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
                                            : "bg-slate-700/50 border-slate-600 text-slate-100 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
                                    }
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="form-input">
                                <Label className="text-slate-300 mb-2 block font-light">Phone Number</Label>
                                <Input
                                    {...register("phone")}
                                    disabled={!isEditing}
                                    className={
                                        !isEditing
                                            ? "bg-slate-700/30 border-slate-600/50 text-slate-300"
                                            : "bg-slate-700/50 border-slate-600 text-slate-100 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-300"
                                    }
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-400 mt-1">{errors.phone.message}</p>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                {!isEditing ? (
                                    <Button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-slate-900 flex items-center gap-2 font-light shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                                    >
                                        <Edit className="h-4 w-4"/>
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            onClick={handleCancel}
                                            variant="outline"
                                            className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent transition-all duration-300"
                                        >
                                            <X className="h-4 w-4 mr-2"/>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="save-btn bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-900 flex items-center gap-2 font-light shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                                            disabled={isLoading}
                                        >
                                            <Save className="h-4 w-4"/>
                                            {isLoading ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-700/50">

                            <div
                                className="flex justify-between items-center p-4 border border-red-500/50 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 mt-4">
                                <div>
                                    <h3 className="font-medium text-red-400">Sign Out</h3>
                                    <p className="text-sm text-red-300">Log out of your admin account</p>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={onSignOut}
                                    className="bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-500 transition-all duration-300"
                                >
                                    <LogOut className="h-4 w-4 mr-2"/>
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}