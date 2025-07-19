import axios, {AxiosResponse} from "axios";
import {ForgetPasswordResponse, LoginResponse, ServerSignupFromData, SignupResponse} from "@/lib/types/authTypes";

export const loginApi = async (email: string, password: string):Promise<AxiosResponse<LoginResponse>> => {
    return await axios.post("api/auth/login", {email, password})
}
export const signupApi = async (data: ServerSignupFromData): Promise<AxiosResponse<SignupResponse>> => {
    return await axios.post("api/auth/signup", data)
}

export const logoutApi = async () => {
    return await axios.post("api/auth/logout")
}

export const forgetPasswordApi = async (email: string): Promise<AxiosResponse<ForgetPasswordResponse>> => {
    return await axios.post("api/auth/forget-password", {email})
}

export const resetPasswordApi = async (sessionId: string, otp: string, newPassword: string): Promise<AxiosResponse<string>> => {
    return await axios.post("api/auth/reset-password", {sessionId, otp, newPassword})
}