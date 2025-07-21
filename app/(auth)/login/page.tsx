"use client";

import {useEffect, useRef, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {gsap} from "gsap";
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"; // Import Shadcn form components
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Eye, EyeOff} from "lucide-react";
import {LoginFormData, LoginFormSchema} from "@/lib/types/authTypes";
import {useLogin} from "@/lib/query/authHooks";
import {useAuthStore} from "@/lib/stores/AuthStore";
import {useRouter} from "next/navigation";
import {Modal} from "@/components/Modal";
import {toast} from "sonner";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const login = useLogin();
    const {user} = useAuthStore();
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);

    // Initialize the form with react-hook-form
    const form = useForm<LoginFormData>({
        resolver: zodResolver(LoginFormSchema),
        mode: "onChange",
        defaultValues: {
            email: "", // Ensure email starts as an empty string
            password: "", // Ensure password starts as an empty string
        },
    });

    const openModal = () => {
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set([".form-content", ".image-content"], {opacity: 0, y: 50});
            gsap.set(".floating-element", {opacity: 0, scale: 0});

            const tl = gsap.timeline();

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
                    "-=0.6"
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
                    "-=0.4"
                );

            gsap.to(".floating-1", {
                y: -20,
                rotation: 5,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut",
            });

            gsap.to(".floating-2", {
                y: -15,
                rotation: -3,
                duration: 3.5,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut",
                delay: 1,
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const onSubmit = async (data: LoginFormData) => {
        gsap.to(".submit-btn", {scale: 0.95, duration: 0.1});

        try {
            await login.mutateAsync(data);
            toast.success("Login successfully")
            gsap.to(".form-content", {
                scale: 1.05,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut",
            });
            router.push(user?.role.toUpperCase() === "ADMIN" ? "/admin/dashboard" : "/");
        } catch {
            gsap.to(".form-content", {
                keyframes: [{x: -10}, {x: 10}, {x: -10}, {x: 10}, {x: 0}],
                duration: 0.5,
                ease: "power2.inOut",
            });
            openModal()
        } finally {
            gsap.to(".submit-btn", {scale: 1, duration: 0.2});
        }
    };

    return (
        <>
            {login.isError && (
                <Modal isOpen={modalOpen} onClose={closeModal} title={login.error.name}>
                    <p>{login.error.message}</p>
                </Modal>
            )}

            <div
                ref={containerRef}
                className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden"
            >
                <div className="fixed inset-0 pointer-events-none">
                    <div
                        className="floating-element floating-1 absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl"></div>
                    <div
                        className="floating-element floating-2 absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl"></div>
                    <div
                        className="floating-element absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
                </div>

                <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

                    <div
                        ref={imageRef}
                        className="image-content hidden lg:block relative h-[600px] rounded-2xl overflow-hidden"
                    >
                        <Image
                            src="/bonsai-tree-img.png"
                            alt="Mountain inn at night"
                            fill
                            className="object-cover"
                        />

                        <div
                            className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10"/>

                        <div className="absolute top-6 left-6 z-20">
                            <Link href="/" className="inline-flex items-center space-x-3">
                                <div
                                    className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-sm flex items-center justify-center shadow-lg">
                                    <div className="w-6 h-6 border-2 border-slate-100 rounded-full"></div>
                                </div>
                                <div className="text-left">
                                    <span className="text-xl font-light text-slate-100 tracking-wide block">Tranquility Inn</span>
                                    <span className="text-xs text-slate-400 tracking-widest">MOUNTAIN RETREAT</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div ref={formRef} className="w-full max-w-md mx-auto">
                        <div className="form-content text-center mb-8">

                            <h1 className="text-3xl font-light text-slate-100 mb-2">Welcome Back</h1>
                            <p className="text-slate-400">Enter your credentials to continue your journey</p>
                        </div>

                        <Card className="shadow-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50">
                            <CardHeader className="space-y-1 pb-4">
                                <CardTitle className="text-xl font-light text-center text-slate-100">Sign In</CardTitle>
                                <CardDescription className="text-center text-slate-400">
                                    Access your sanctuary reservations and preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({field}) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-slate-300 font-light">Email
                                                        Address</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="your@email.com"
                                                            className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 transition-all duration-300"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({field}) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel
                                                        className="text-slate-300 font-light">Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type={showPassword ? "text" : "password"}
                                                                placeholder="Enter your password"
                                                                className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400/20 pr-10 transition-all duration-300"
                                                                {...field}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors duration-300"
                                                            >
                                                                {showPassword ? <EyeOff className="h-4 w-4"/> :
                                                                    <Eye className="h-4 w-4"/>}
                                                            </button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex items-center justify-between text-sm">
                                            <Link
                                                href="/forgot-password"
                                                className="text-amber-400 hover:text-amber-300 transition-colors duration-300"
                                            >
                                                Forgot your password?
                                            </Link>
                                        </div>
                                        <Button
                                            type="submit"
                                            className="submit-btn w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-light tracking-wide shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
                                            disabled={login.isPending}
                                        >
                                            {login.isPending ? "Signing In..." : "Sign In"}
                                        </Button>
                                    </form>
                                </Form>

                                <div className="mt-6 text-center text-sm">
                                    <span className="text-slate-400">{"Don't have an account?"} </span>
                                    <Link
                                        href="/signup"
                                        className="text-amber-400 hover:text-amber-300 font-medium transition-colors duration-300"
                                    >
                                        Create one here
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        <p className="text-center text-xs text-slate-500 mt-6">
                            By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}