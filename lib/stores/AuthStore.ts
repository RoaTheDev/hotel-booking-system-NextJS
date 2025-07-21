import { ServerSignupFromData } from "@/lib/types/authTypes";
import { create } from "zustand/react";
import { persist } from "zustand/middleware";
import { forgetPasswordApi, loginApi, logoutApi, resetPasswordApi, signupApi } from "@/lib/data/authApi";

interface AuthUser {
    email: string;
    role: string;
    id: number;
}

interface AuthStore {
    user: AuthUser | null;
    token: string | null;

    login: (email: string, password: string) => Promise<void>;
    signup: (data: ServerSignupFromData) => Promise<void>;
    logout: () => Promise<void>;
    forgetPassword: (email: string) => Promise<string>;
    resetPassword: (sessionId: string, otp: string, newPassword: string) => Promise<void>;

    isAuthenticated: boolean;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,

            get isAuthenticated() {
                return !!get().token && !!get().user;
            },

            login: async (email, password) => {
                // No need to set loading or error here, handled by React Query
                try {
                    const { data } = await loginApi(email, password);
                    set({
                        user: data.data.user,
                        token: data.data.token,
                    });
                } catch (error) {
                    // Let React Query catch and handle errors
                    throw error;
                }
            },

            signup: async (request) => {
                try {
                    const { data } = await signupApi(request);
                    set({
                        user: data.user,
                        token: data.token,
                    });
                } catch (error) {
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await logoutApi();
                    set({
                        user: null,
                        token: null,
                    });
                } catch (error) {
                    throw error;
                }
            },

            forgetPassword: async (email) => {
                try {
                    const { data } = await forgetPasswordApi(email);
                    return data.sessionId;
                } catch (error) {
                    throw error;
                }
            },

            resetPassword: async (sessionId: string, otp: string, newPassword: string) => {
                try {
                    await resetPasswordApi(sessionId, otp, newPassword);
                } catch (error) {
                    throw error;
                }
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
