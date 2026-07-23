export type RegisterRequest = {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
}

export type LoginRequest = {
    username: string;
    password: string;
}
export type LoginResponse = {
    id: number;
    fullName: string;
    roleName: string;
    email: string;
    phoneNumber: string;
}

export type UserInfoResponse = {
    email: string;
    fullName: string;
    phoneNumber: string;
}

export type GoogleAuthResponse = {
    token: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    roleName: string;
    isNewUser: boolean;
}

export const MANAGER_USERS = ['linh@gmail.com', 'hieupo@gmail.com']