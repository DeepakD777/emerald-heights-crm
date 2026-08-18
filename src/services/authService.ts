import {
    apiRequest,
    clearAuthToken,
    getAuthToken,
    setAuthToken,
} from "./api";

// ======================================================
// Types
// ======================================================

export type AuthUser = {
    id: string;
    name: string;
    email: string;

    role: string;

    userType:
        | "ADMIN"
        | "EMPLOYEE";
};

export type LoginType =
    | "ADMIN"
    | "EMPLOYEE";

type LoginResponse = {
    success: true;
    message: string;
    token: string;
    user: AuthUser;
};

type MeResponse = {
    success: true;
    user: AuthUser;
};

type ForgotPasswordResponse = {
    success: true;
    message: string;
};

type VerifyOtpResponse = {
    success: true;
    message: string;
    resetToken: string;
};

// ======================================================
// Login
// ======================================================

export async function loginUser(
    email: string,
    password: string,
    loginType: LoginType
) {
    const response =
        await apiRequest<LoginResponse>(
            "/auth/login",
            {
                method:
                    "POST",

                body:
                    JSON.stringify({
                        email,
                        password,
                        loginType,
                    }),
            }
        );

    setAuthToken(
        response.token
    );

    return response;
}

// ======================================================
// Admin Forgot Password - Request OTP
// ======================================================

export async function requestAdminPasswordOtp(
    email: string
) {
    return apiRequest<ForgotPasswordResponse>(
        "/auth/admin/forgot-password/request-otp",
        {
            method:
                "POST",

            body:
                JSON.stringify({
                    email,
                }),
        }
    );
}

// ======================================================
// Admin Forgot Password - Verify OTP
// ======================================================

export async function verifyAdminPasswordOtp(
    email: string,
    otp: string
) {
    return apiRequest<VerifyOtpResponse>(
        "/auth/admin/forgot-password/verify-otp",
        {
            method:
                "POST",

            body:
                JSON.stringify({
                    email,
                    otp,
                }),
        }
    );
}

// ======================================================
// Admin Forgot Password - Reset Password
// ======================================================

export async function resetAdminPassword(
    resetToken: string,
    newPassword: string,
    confirmPassword: string
) {
    return apiRequest<ForgotPasswordResponse>(
        "/auth/admin/forgot-password/reset",
        {
            method:
                "POST",

            body:
                JSON.stringify({
                    resetToken,
                    newPassword,
                    confirmPassword,
                }),
        }
    );
}

// ======================================================
// Current User
// ======================================================

export async function getCurrentUser() {
    return apiRequest<MeResponse>(
        "/auth/me"
    );
}

// ======================================================
// Logout
// ======================================================

export function logoutUser() {
    clearAuthToken();
}

// ======================================================
// Token
// ======================================================

export function hasAuthToken() {
    return Boolean(
        getAuthToken()
    );
}