export type RegisterRequest = {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
}

export type LoginRequest = {
    email: string;
    password: string;
}
export type LoginResponse = {
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