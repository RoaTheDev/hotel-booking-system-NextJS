import axios from "axios";
import {
    ForgetPasswordResponse,
    LoginResponse,
    ServerSignupFromData,
    SignupResponse,
    UserType
} from "@/types/authTypes";
import {ApiResponse} from "@/types/commonTypes";

export const loginApi = async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    const response = await axios.post(`/api/auth/login`, {email, password});
    return response.data;
};

export const signupApi = async (data: ServerSignupFromData): Promise<ApiResponse<SignupResponse>> => {
    const response = await axios.post(`/api/auth/signup`, data);
    return response.data;
};

export const logoutApi = async () => {
    const response = await axios.post(`/api/auth/logout`, {withCredentials: true});
    return response.data;
};

export const forgetPasswordApi = async (email: string): Promise<ApiResponse<ForgetPasswordResponse>> => {
    const response = await axios.post(`/api/auth/forgot-password`, {email});
    return response.data;
};

export const resetPasswordApi = async (sessionId: string, otp: string, newPassword: string) => {
    const response = await axios.post(`/api/auth/reset-password`, {sessionId, otp, newPassword});
    return response.data;
};

export const updateProfileApi = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
}): Promise<ApiResponse<UserType>> => {
    const response = await axios.put(`/api/user`, data, {withCredentials: true});
    return response.data;
};

export const fetchUserProfile = async (): Promise<UserType> => {
    const res = await axios.get(`/api/user`, {withCredentials: true});
    return res.data;
};

export const ValidateSession = async (): Promise<string> => {
    const res = await axios.get(`/api/validate`, {withCredentials: true});
    return res.data;
};
