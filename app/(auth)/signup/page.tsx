"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { gsap } from "gsap"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import {SignupFormData,SignupFormSchema} from "@/lib/types/authTypes";
import {useSignup} from "@/lib/query/authHooks";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {Modal} from "@/components/Modal";

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const [modalOpen, setModalOpen] = useState(false);
    const signup = useSignup()
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(SignupFormSchema),
    })

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial setup
            gsap.set([".form-content", ".image-content"], { opacity: 0, y: 50 })
            gsap.set(".floating-element", { opacity: 0, scale: 0 })

            // Entrance animations
            const tl = gsap.timeline()

            tl.to(".image-content", {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power3.out",
            })
                .to(
                    ".form-content",
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

            // Form field animations
            const inputs = gsap.utils.toArray(".form-input")
            inputs.forEach((inputEl) => {
                const input = inputEl as HTMLElement;
                const field = input.querySelector("input");
                const label = input.querySelector("label");
                field?.addEventListener("focus", () => {
                    gsap.to(label, { scale: 0.9, y: -5, color: "#f59e0b", duration: 0.3 })
                    gsap.to(input, { scale: 1.02, duration: 0.3 })
                })

                field?.addEventListener("blur", () => {
                    if (!field.value) {
                        gsap.to(label, { scale: 1, y: 0, color: "#94a3b8", duration: 0.3 })
                    }
                    gsap.to(input, { scale: 1, duration: 0.3 })
                })
            })
        }, containerRef)

        return () => ctx.revert()
    }, [])

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };
    const onSubmit = async (data: SignupFormData) => {
        setIsLoading(true)


        gsap.to(".submit-btn", { scale: 0.95, duration: 0.1 })

        try {
            await signup.mutateAsync(data);

            toast.success("Signup successfully")
            // Success animation
            gsap.to(".form-content", {
                scale: 1.05,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut",
            })

            router.push("/login")
        } catch  {
            gsap.to(".form-content", {
                keyframes: [
                    { x: -10, duration: 0.1 },
                    { x: 10, duration: 0.1 },
                    { x: -10, duration: 0.1 },
                    { x: 10, duration: 0.1 },
                    { x: 0, duration: 0.1 },
                ],
                ease: "power2.inOut",
            })
            openModal()
        } finally {
            setIsLoading(false)
            gsap.to(".submit-btn", { scale: 1, duration: 0.2 })
        }
    }

    return (
        <>
            {signup.isError && (
                <Modal isOpen={modalOpen} onClose={closeModal} title={signup.error.name}>
                    <p>{signup.error.message}</p>
                </Modal>
            )}
        <div
            ref={containerRef}
            className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden"
        >
            {/* Floating background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="floating-element floating-1 absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl"></div>
                <div className="floating-element floating-2 absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl"></div>
                <div className="floating-element absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
            </div>

            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
                {/* Left side - Image */}
                <div className="image-content hidden lg:block relative h-[700px] rounded-2xl overflow-hidden">
                    <Image
                        src="/bonsai-tree-img.png"
                        alt="Mountain sanctuary"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10" />

                    <div className="absolute top-6 left-6 z-20">
                        <Link href="/" className="inline-flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-sm flex items-center justify-center shadow-lg">
                                <div className="w-6 h-6 border-2 border-slate-100 rounded-full"></div>
                            </div>
                            <div className="text-left">
                                <span className="text-xl font-light text-slate-100 tracking-wide block">Tranquility Inn</span>
                                <span className="text-xs text-slate-400 tracking-widest">MOUNTAIN RETREAT</span>
                            </div>
                        </Link>
                    </div>
                    <div className=" flex flex-col  absolute bottom-8 left-28  text-center text-slate-100">
                        <h2 className="text-2xl font-light mb-2">Begin Your Journey</h2>
                        <p className="text-slate-300">Create your account and discover tranquility</p>
                    </div>
                </div>

                {/* Right side - Form */}
                <div className="w-full max-w-md mx-auto">
                    <div className="form-content text-center mb-8">

                        <h1 className="text-3xl font-light text-slate-100 mb-2">Create Account</h1>
                        <p className="text-slate-400">Join us and start your journey to inner peace</p>
                    </div>

                    <Card className=" shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-xl font-light text-center text-slate-100">Welcome</CardTitle>
                            <CardDescription className="text-center text-slate-400">
                                Create your account to book your perfect retreat
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-input space-y-2">
                                        <Label htmlFor="firstName" className="text-slate-300 font-light">
                                            First Name
                                        </Label>
                                        <Input
                                            id="firstName"
                                            placeholder="John"
                                            className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-300"
                                            {...register("firstName")}
                                        />
                                        {errors.firstName && <p className="text-sm text-red-400">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="form-input space-y-2">
                                        <Label htmlFor="lastName" className="text-slate-300 font-light">
                                            Last Name
                                        </Label>
                                        <Input
                                            id="lastName"
                                            placeholder="Doe"
                                            className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-300"
                                            {...register("lastName")}
                                        />
                                        {errors.lastName && <p className="text-sm text-red-400">{errors.lastName.message}</p>}
                                    </div>
                                </div>

                                <div className="form-input space-y-2">
                                    <Label htmlFor="email" className="text-slate-300 font-light">
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-300"
                                        {...register("email")}
                                    />
                                    {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
                                </div>



                                <div className="form-input space-y-2">
                                    <Label htmlFor="password" className="text-slate-300 font-light">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create a secure password"
                                            className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 pr-10 transition-all duration-300"
                                            {...register("password")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors duration-300"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
                                </div>

                                <div className="form-input space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-slate-300 font-light">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm your password"
                                            className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 pr-10 transition-all duration-300"
                                            {...register("confirmPassword")}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors duration-300"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>}
                                </div>

                                <Button
                                    type="submit"
                                    className="submit-btn w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-light tracking-wide shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Creating Account..." : "Create Account"}
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm">
                                <span className="text-slate-400">Already have an account? </span>
                                <Link
                                    href="/login"
                                    className="text-amber-400 hover:text-amber-300 font-medium transition-colors duration-300"
                                >
                                    Sign in here
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-center text-xs text-slate-500 mt-6">
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
        </>

    )
}
