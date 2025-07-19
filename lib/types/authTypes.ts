import * as z from "zod";

export const LoginFormSchema = z.object({
    email: z.string().email("Must be a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;


const BaseSignupFormSchema = z.object({
    firstName: z.string().min(2, "Full name is required").max(50, "First name must not exceed 50 characters long"),
    lastName: z.string().min(2, "Full name is required").max(50, "Last name must not exceed 50 characters long"),
    email: z.string().email("Must be a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .max(50, "Password must not exceed 50 characters long"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val, {
        message: "You must agree to the Terms of Service and Privacy Policy",
    }),
});

export const SignupFormSchema = BaseSignupFormSchema.refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

export const ServerSignupSchema = BaseSignupFormSchema.omit({
    confirmPassword: true,
    terms: true,
})
export type SignupFormData = z.infer<typeof SignupFormSchema>;

export type ServerSignupFromData = z.infer<typeof ServerSignupSchema>;
export type AppJwtPayload = {
    userId: number,
    email: string,
    role: string,
    iat?: number,
    exp?: number,
}
export type ForgetPassword = {
    email: string
}

export type ResetPassword = {
    otp: string,
    newPassword: string
}


export type UserType = {
    id: number,
    email: string,
    firstName: string,
    lastName: string,
    role: string,
}

export type LoginResponse = {
    message: string
    data: {
        token: string,
        user: UserType
    }
}


export type SignupResponse = {
    user: {id: number, email : string,role: string},
    token: string
}

export type ForgetPasswordResponse = {
    sessionId: string
}
