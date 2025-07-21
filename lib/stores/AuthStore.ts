import { ServerSignupFromData } from "@/lib/types/authTypes";
import { create } from "zustand/react";
import { persist } from "zustand/middleware";
import { forgetPasswordApi, loginApi, logoutApi, resetPasswordApi, signupApi } from "@/lib/data/authData";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/lib/types/commonTypes";

interface AuthUser {
    email: string;
    role: string;
    id: number;
}

interface AuthStore {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    error: ApiErrorResponse | string | null;

    login: (email: string, password: string) => Promise<void>;
    signup: (data: ServerSignupFromData) => Promise<void>;
    logout: () => Promise<void>;
    forgetPassword: (email: string) => Promise<string>;
    resetPassword: (sessionId: string, otp: string, newPassword: string) => Promise<void>;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
    isAuthenticated: boolean;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,

            get isAuthenticated() {
                return !!get().token && !!get().user;
            },

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await loginApi(email, password);
                    set({
                        user: data.data.user,
                        token: data.data.token,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    if (error instanceof AxiosError) {
                        set({ error: error.message, isLoading: false });
                    }
                }
            },

            signup: async (request) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await signupApi(request);
                    set({
                        user: data.user,
                        token: data.token,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    if (error instanceof AxiosError) {
                        set({ error: error.message, isLoading: false });
                    }
                }
            },

            logout: async () => {
                set({ isLoading: true, error: null });
                try {
                    await logoutApi();
                    set({
                        user: null,
                        token: null,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    if (error instanceof AxiosError) {
                        set({ error: error.message, isLoading: false });
                    }
                }
            },

            forgetPassword: async (email) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await forgetPasswordApi(email);
                    set({ isLoading: false, error: null });
                    return data.sessionId;
                } catch (error) {
                    if (error instanceof AxiosError) {
                        set({ error: error.message, isLoading: false });
                        throw error;
                    }
                    throw error;
                }
            },

            resetPassword: async (sessionId: string, otp: string, newPassword: string) => {
                set({ isLoading: true, error: null });
                try {
                    await resetPasswordApi(sessionId, otp, newPassword);
                    set({ isLoading: false, error: null });
                } catch (error) {
                    if (error instanceof AxiosError) {
                        set({ error: error.message, isLoading: false });
                    }
                }
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },

            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                token: state.token,
            }),
        }
    )
);
