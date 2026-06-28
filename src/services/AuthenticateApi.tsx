import type { ApiResponse } from "@/components/types/ApiResponse";
import { axiosInstance, baseUrl } from "@/lib/utils/axios-instance";
import type { LoginRequest, LoginResponse, RegisterRequest, UserInfoResponse } from "@/types/authentication";

type GoogleAuthUrlResponse = {
    url: string;
    state: string;
}

export const GetGoogleAuthUrl = async (mode: string) => {
    try {
        const res = await axiosInstance.get(`/authenticate/google/url`, {
            params: { mode }
        });
        return res as unknown as ApiResponse<GoogleAuthUrlResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const RedirectToGoogle = async (mode: string) => {
    const response = await GetGoogleAuthUrl(mode);
    const data = response.data as GoogleAuthUrlResponse;
    if (data.state) {
        sessionStorage.setItem("googleOAuthState", data.state);
    }
    window.location.href = data.url;
}

export const GoogleAuthCallbackService = async (code: string, state: string) => {
    try {
        const res = await axiosInstance.post(`/authenticate/google/callback`, { code, state });
        return res as unknown as ApiResponse<LoginResponse>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const RegisterAccountService = async (data: RegisterRequest) => {
    try {
        const res = await axiosInstance.post(`/authenticate/register`, data);
        return res as unknown as ApiResponse<string>;
    } catch (err: any) {
        throw new Error(err.message);
    }
}

export const ActiveAccountService= async (values:string)=>{
    try{
        const data:{
            email: string;
        }={
            email: values
        }
        const res= await axiosInstance.post(`/authenticate/active-account`,data);
        return res as unknown as ApiResponse<string>;
    }catch(err:any){
        throw new Error(err.message);
    }
}

export const LoginService= async (data: LoginRequest)=>{
    try{
        const res= await axiosInstance.post(`/authenticate/auth`,data);
        return res as unknown as ApiResponse<LoginResponse>;
    }catch(err:any){
        throw new Error(err.message);
    }
}
export const CheckSessionLoginService= async ()=>{
    try{
        const res= await axiosInstance.get(`/authenticate/login`);
        return res as unknown as ApiResponse<LoginResponse>;
    }catch(err:any){
        throw new Error(err.message);
    }
}
export const LogoutService= async ()=>{
    try{
        const res= await axiosInstance.get(`/authenticate/logout`);
        return res as unknown as ApiResponse<string>;
    }catch(err:any){
        throw new Error(err.message);
    }
}

export const LoadUserInfoService= async ()=>{
    try{
        const res= await axiosInstance.get(`/authenticate/load-info`);
        return res as unknown as ApiResponse<UserInfoResponse>;
    }catch(err:any){
        throw new Error(err.message);
    }
}

export const FindEmailExistAPI= async (email:string)=>{
    try{
        const res :string= await axiosInstance.post(`/authenticate/find-email?email=${email}`);
        return res as string;
    }catch(err:any){
        throw new Error(err.message);
    }
}

export const SendUpdatePasswordAPI= async (data: {email:string;oldPassword:string; newPassword:string})=>{
    try{
        const res= await axiosInstance.post(`/authenticate/reset-password`,data);
        return res as unknown as ApiResponse<string>; 
    }catch(err:any){
        throw new Error(err.message);
    }
}