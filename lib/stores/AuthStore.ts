import {create} from "zustand/react";
import {persist} from "zustand/middleware";
import {
    forgetPasswordApi,
    loginApi,
    logoutApi,
    resetPasswordApi,
    signupApi,
    updateProfileApi,
    ValidateSession,
} from "@/lib/data/authApi";
import {
    ForgetPasswordResponse,
    LoginResponse,
    ServerSignupFromData,
    SignupResponse,
    UserType,
} from "@/lib/types/authTypes";
import {ApiResponse} from "@/lib/types/commonTypes";
import axios, {HttpStatusCode} from "axios";
import _ from "lodash";

type UserState = {
    email: string,
    firstName: string,
    lastName: string,
    role: string,
    phone: string | null,
}

interface AuthStore {
    user: UserState | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    login: (email: string, password: string) => Promise<ApiResponse<LoginResponse>>;
    signup: (data: ServerSignupFromData) => Promise<ApiResponse<SignupResponse>>;
    logout: () => Promise<void>;
    setUser: (user: UserState) => void;
    clearAuth: () => void;
    forgetPassword: (email: string) => Promise<string | null>;
    revalidateSession: () => Promise<void>
    resetPassword: (sessionId: string, otp: string, newPassword: string) => Promise<void>;
    updateProfile: (data: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string | null;
    }) => Promise<ApiResponse<UserType>>;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isHydrated: false,
            login: async (email, password) => {
                try {
                    const response: ApiResponse<LoginResponse> = await loginApi(email, password);
                    if (response.success && response.data) {

                        const userWithoutId: UserState = _.omit(response.data.user, ['id']);
                        set({
                            user: userWithoutId,
                            isAuthenticated: true
                        });
                    } else {
                        set({user: null, isAuthenticated: false});
                    }
                    return response;
                } catch (error) {
                    set({user: null, isAuthenticated: false});
                    throw error;
                }
            },

            revalidateSession: async () => {
                const state = useAuthStore.getState();
                if (!state.isAuthenticated) return;

                try {
                    const response = await ValidateSession();
                    if (!response) {
                        set({user: null, isAuthenticated: false});
                    }
                } catch {
                    set({user: null, isAuthenticated: false});
                }
            },

            signup: async (request) => {
                try {
                    const response: ApiResponse<SignupResponse> = await signupApi(request);
                    if (response.success && response.data) {
                        const userWithoutId: UserState = _.omit(response.data.user, ['id']);
                        set({
                            user: userWithoutId,
                            isAuthenticated: true
                        });
                    } else {
                        set({user: null, isAuthenticated: false});
                    }
                    return response;
                } catch (error) {
                    set({user: null, isAuthenticated: false});
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await logoutApi();
                } catch (error) {
                    throw error;
                } finally {
                    useAuthStore.persist.clearStorage();
                }
            },
            setUser: (user) => set({user, isAuthenticated: true}),
            clearAuth: () => set({user: null, isAuthenticated: false}),
            forgetPassword: async (email) => {
                try {
                    const response: ApiResponse<ForgetPasswordResponse> = await forgetPasswordApi(email);
                    return response.success && response.data ? response.data.sessionId : null;
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

            updateProfile: async (data) => {
                try {
                    const response: ApiResponse<UserType> = await updateProfileApi(data);
                    const userWithoutId: UserState = _.omit(response.data, ['id']);
                    set({user: userWithoutId});
                    return response;
                } catch (error) {
                    throw error;
                }
            },
        }),
        {
            name: "tranquility_user",
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
            onRehydrateStorage: () => {
                return (state, error) => {
                    if (!error && state) {
                        state.isHydrated = true;
                    }
                };
            },
        }
    )
);

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === HttpStatusCode.Unauthorized) {
            const store = useAuthStore.getState();
            if (store.isAuthenticated) {
                await store.logout();
            }
        }
        return Promise.reject(error);
    }
);