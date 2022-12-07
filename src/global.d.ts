interface LoginResponse {
    id: number;
    first_name: string;
    last_name: string;
    token: string;
    refresh_token: string;
    wrong_username: any;
    wrong_password: any;
    language: string;
}

type UserVerification = "succeeded" | "failed" | null;

interface UserData {
    first_name: string;
    last_name: string;
    username: string;
    language: string;
}

interface TokensResponse {
    token: string;
    refreshToken: string;
}

interface SignupResponse {
    existing_username?: object;
    id?: number;
    token?: string;
    refresh_token?: string;
}

interface ServerResponse {
    success: boolean;
    serverError: boolean;
}

interface Username {
    username: string;
}

interface OnlineUser {
    socketId: string;
    username: string;
}

interface Language {
    code: string;
    name: string;
}

interface DetectLanguageResult {
    confidence: number;
    language: string;
}

interface Message {
    id: number;
    sender: string;
    receiver?: string;
    original_body?: string;
    translated_body: string;
    original_language?: string;
    translation_language?: string;
    created_at?: object;
}

type SlideMenu = null | boolean;

interface UnreadMessage {
    id: number;
    sender: string;
    body: string;
    numberOfUnreadMessages: number;
}
