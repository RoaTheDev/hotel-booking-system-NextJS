"use client";

import React, {useState} from "react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Eye, EyeOff, Lock, Mail, User} from "lucide-react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import useSWRMutation from "swr/mutation";
import axios, {AxiosError} from "axios";
import {SignupFormData, SignupFormSchema} from "@/lib/types/authTypes";

async function signupFetcher(_url: string, {arg}: { arg: Omit<SignupFormData, "confirmPassword" | "terms"> }) {
    try {
        const {data} = await axios.post("/api/signup", arg);
        return data;
    } catch (error) {
        throw new Error(
            error instanceof AxiosError && error.response
                ? error.response.data.message || "Signup failed. Please try again."
                : "An unexpected error occurred."
        );
    }
}

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<SignupFormData>({
        resolver: zodResolver(SignupFormSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            terms: false,
        },
    });

    const {trigger, isMutating, error} = useSWRMutation("/api/signup", signupFetcher);

    const onSubmit = async (data: SignupFormData) => {
        try {
            const {name, email, password} = data;
            await trigger({name, email, password});
            console.log("Signup successful");
            form.reset();
        } catch (err) {
            console.error("Signup error:", err);
        }
    };

    const handleGoogleSignup = async () => {
        console.log("Google signup clicked");
        // TODO: Implement OAuth flow (e.g., with NextAuth.js)
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-lg border-gray-300">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold text-gray-800">Create your account</CardTitle>
                        <CardDescription className="text-gray-500">Sign up to get started with your
                            account</CardDescription>
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
                                    name="name"
                                    render={({field}) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-gray-700">Full name</FormLabel>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                                                <FormControl>
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        placeholder="Enter your full name"
                                                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        autoFocus
                                                        disabled={isMutating}
                                                        aria-label="Full name"
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
                                                        placeholder="Create a password"
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

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({field}) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-gray-700">Confirm password</FormLabel>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                                                <FormControl>
                                                    <Input
                                                        id="confirmPassword"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="Confirm your password"
                                                        className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        disabled={isMutating}
                                                        aria-label="Confirm password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4"/> :
                                                        <Eye className="h-4 w-4"/>}
                                                </button>
                                                <FormMessage/>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="terms"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <input
                                                    id="terms"
                                                    type="checkbox"
                                                    className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                                    disabled={isMutating}
                                                    aria-label="Agree to terms and conditions"
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormLabel
                                                htmlFor="terms"
                                                className="text-sm sm:text-sm text-gray-600 flex flex-wrap items-baseline gap-x-1"
                                            >
                                                I agree to the
                                                <Link
                                                    href="/terms"
                                                    className="text-blue-500 hover:underline hover:text-blue-600 focus:text-blue-600"
                                                >
                                                    Terms of Service
                                                </Link>
                                                and
                                                <Link
                                                    href="/privacy"
                                                    className="text-blue-500 hover:underline  hover:text-blue-600 focus:text-blue-600"
                                                >
                                                    Privacy Policy
                                                </Link>
                                            </FormLabel>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    disabled={isMutating || form.formState.isSubmitting}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                                >
                                    {isMutating || form.formState.isSubmitting ? (
                                        <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating account...
                    </span>
                                    ) : (
                                        "Create account"
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
                                    onClick={handleGoogleSignup}
                                    disabled={isMutating}
                                >
                                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Continue with Google
                                </Button>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link href="/auth/login"
                                  className="text-blue-500 hover:text-blue-600 hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}