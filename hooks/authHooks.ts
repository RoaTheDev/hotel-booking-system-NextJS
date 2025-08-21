import {useMutation, useQuery} from "@tanstack/react-query";
import {useAuthStore} from "@/stores/AuthStore";
import {PasswordChangeForm, ServerSignupFromData} from "@/types/authTypes";
import {fetchUserProfile} from "@/data/authApi";
import {toast} from "sonner";
import {ApiResponse} from "@/types/commonTypes";

export const useLogin = () => {
    const login = useAuthStore((state) => state.login);
    return useMutation({
        mutationFn: ({email, password}: { email: string; password: string }) =>
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
        mutationFn: async () => {
            await logout()
        },
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

export const useFetchUser = () => {
    return useQuery({
        queryKey: ["user"],
        queryFn: () => fetchUserProfile(),
        retry: false,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

}

const changePassword = async (data: PasswordChangeForm): Promise<ApiResponse<null>> => {
    const response = await fetch('/api/auth/change-password', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Failed to change password');
    }

    return result;
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: changePassword,
        onSuccess: (data) => {
            toast.success(data.message || 'Password changed successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to change password');
        },
    });
};