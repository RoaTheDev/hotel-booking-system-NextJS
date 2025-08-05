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

});

export const SignupFormSchema = BaseSignupFormSchema.refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

export const ServerSignupSchema = BaseSignupFormSchema.omit({
    confirmPassword: true,
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
    phone: string | null,

}


export type LoginResponse = {
    token: string,
    user: UserType,
    redirectUrl: string
}


export type SignupResponse = {
    user: UserType,
    token: string
}

export type ForgetPasswordResponse = {
    sessionId: string
}

export const profileSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name must not exceed 50 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name must not exceed 50 characters"),
    email: z.string().email("Must be a valid email address").max(255, "Email must not exceed 255 characters"),
    phone: z.string().max(20, "Phone number must not exceed 20 characters").optional().nullable(),
})

export type ProfileForm = z.infer<typeof profileSchema>
