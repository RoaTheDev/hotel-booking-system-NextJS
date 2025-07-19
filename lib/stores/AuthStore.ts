import {ServerSignupFromData} from "@/lib/types/authTypes";
import {create} from "zustand/react";
import {persist} from "zustand/middleware/persist";
import {forgetPasswordApi, loginApi, logoutApi, resetPasswordApi, signupApi} from "@/lib/data/authData";
import {AxiosError} from "axios";
import {ApiErrorResponse} from "@/lib/types/commonTypes";

interface AUthStore {
    user: {
        email: string,
        role: string,
        id: number
    } | null
    token: string | null,
    isLoading: boolean,
    error: ApiErrorResponse | string | null

    login: (email: string, password: string) => Promise<void>
    signup: (data: ServerSignupFromData) => Promise<void>
    logout: () => Promise<void>
    forgetPassword: (email: string) => Promise<string>
    resetPassword: (sessionId: string, otp: string, newPassword: string) => Promise<void>
    clearError: () => void
    setLoading: (loading: boolean) => void
    isAuthenticated: boolean
}

export const useAuthStore = create<AUthStore>()(
    persist((set, get) => ({

        user: null, error: null, token: null, isLoading: false,

        get isAuthenticated() {
            return !!get().token && !!get().user
        },
        login: async (email: string, password: string) => {
            set({isLoading: true, error: null})

            try {
                const {data} = await loginApi(email, password);
                set({
                    user: data.data.user, token: data.data.token, isLoading: false, error: null
                })
            } catch (error) {
                if (error instanceof AxiosError) {
                    set({
                        error: error.message, isLoading: false
                    })
                }
            }
        },
        signup: async (request: ServerSignupFromData) => {
            set({isLoading: true, error: null})

            try {
                const {data} = await signupApi(request);
                set({
                    user: data.user, token: data.token, isLoading: false, error: null
                })
            } catch (error) {
                if (error instanceof AxiosError) {
                    set({error: error.message, isLoading: false})
                }
            }
        }, logout: async () => {
            set({isLoading: true, error: null})
            try {
                await logoutApi();
                set({
                    isLoading: false, token: null, user: null, error: null
                })
            } catch (error) {
                if (error instanceof AxiosError) {
                    set({error: error.message, isLoading: false})
                }
            }
        },

        forgetPassword: async (email: string) => {
            set({isLoading: true, error: null})
            try {
                const {data} = await forgetPasswordApi(email);
                set({
                    error: null, isLoading: false,
                })
                return data
            } catch (error) {
                if (error instanceof AxiosError) {
                    set({error: error.message, isLoading: false})
                }
            }
        },
        resetPassword: async (sessionId, otp, newPassword) => {
            set({isLoading: false, error: null})
            try {
                await resetPasswordApi(sessionId, otp, newPassword)
                set({})
            }
        },
        setLoading: () => {

        },
        clearError: () => {

        }
    })))

