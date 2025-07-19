"use client";

import React, {useState} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Eye, EyeOff, Lock, Mail} from "lucide-react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import useSWRMutation from "swr/mutation";
import axios, {AxiosError} from "axios";
import {LoginFormData, LoginFormSchema} from "@/lib/types/authTypes";
import {BsGoogle} from "react-icons/bs";
import {useRouter} from "next/navigation";


async function loginFetcher(_url: string, {arg}: { arg: LoginFormData }) {
    try {
        const response = await axios.post("/api/auth/login", arg);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            throw new Error(error.response.data.message || "Login failed. Please try again.");
        }
        throw new Error("An unexpected error occurred.");
    }
}

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter()
    const form = useForm<LoginFormData>({
        resolver: zodResolver(LoginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const {trigger, isMutating, error} = useSWRMutation("/api/login", loginFetcher);

    const onSubmit = async (data: LoginFormData) => {
        try {
            await trigger(data);
            console.log("Login successful");
            form.reset();
            router.push('/')
        } catch (err) {
            console.error("Login error:", err);
        }
    };

    const handleGoogleLogin = async () => {
        console.log("Google login clicked");
        // TODO: Implement OAuth flow (e.g., with NextAuth.js)
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-lg border-gray-300">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold text-gray-800">Welcome back</CardTitle>
                        <CardDescription className="text-gray-500">Sign in to your account to continue</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {error && (
                                    <Alert className="border-red-200 bg-red-50">
                                        <AlertDescription className="text-red-700">{error.message}</AlertDescription>
                                    </Alert>
                                )}

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({field}) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-gray-700">Email address</FormLabel>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                                                <FormControl>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="Enter your email"
                                                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        autoFocus
                                                        disabled={isMutating}
                                                        aria-label="Email address"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({field}) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-gray-700">Password</FormLabel>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                                                <FormControl>
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Enter your password"
                                                        className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        disabled={isMutating}
                                                        aria-label="Password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4"/> :
                                                        <Eye className="h-4 w-4"/>}
                                                </button>
                                                <FormMessage/>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            id="remember"
                                            type="checkbox"
                                            className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                            disabled={isMutating}
                                            aria-label="Remember me"
                                        />
                                        <Label htmlFor="remember" className="text-sm text-gray-600">Remember me</Label>
                                    </div>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isMutating || form.formState.isSubmitting}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                                >
                                    {isMutating || form.formState.isSubmitting ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                                 <circle className="opacity-25" cx="12" cy="12" r="10"
                                                         stroke="currentColor" strokeWidth="4"/>
                                                     <path
                                                         className="opacity-75"
                                                         fill="currentColor"
                                                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                     />
                                         </svg>
                                        Signing in...
                                    </span>
                                    ) : (
                                        "Sign in"
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"/>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full border-gray-300 hover:bg-gray-50 bg-transparent"
                                    onClick={handleGoogleLogin}
                                    disabled={isMutating}
                                >
                                    <BsGoogle/>
                                    Continue with Google
                                </Button>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="text-center">
                        <p className="text-sm text-gray-600">
                            {"Don't have an account? "}
                            <Link
                                href="/auth/signup"
                                className="text-blue-500 hover:text-blue-600 hover:underline font-medium"
                            >
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}