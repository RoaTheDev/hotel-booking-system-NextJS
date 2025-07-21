import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/AuthStore";
import { ServerSignupFromData } from "@/lib/types/authTypes";

export const useLogin = () => {
    const login = useAuthStore((state) => state.login);
    return useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            login(email, password),
    });
};

export const useSignup = () => {
    const signup = useAuthStore((state) => state.signup);
    return useMutation({
        mutationFn: (data: ServerSignupFromData) => signup(data),
    });
};

export const useLogout = () => {
    const logout = useAuthStore((state) => state.logout);
    return useMutation({
        mutationFn: () => logout(),
    });
};

export const useForgetPassword = () => {
    const forgetPassword = useAuthStore((state) => state.forgetPassword);
    return useMutation({
        mutationFn: (email: string) => forgetPassword(email),
    });
};

export const useResetPassword = () => {
    const resetPassword = useAuthStore((state) => state.resetPassword);
    return useMutation({
        mutationFn: ({
                         sessionId,
                         otp,
                         newPassword,
                     }: {
            sessionId: string;
            otp: string;
            newPassword: string;
        }) => resetPassword(sessionId, otp, newPassword),
    });
};
