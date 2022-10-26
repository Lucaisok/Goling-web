interface LoginResponse {
    id: number;
    first_name: string;
    last_name: string;
    token: string;
    refresh_token: string;
    wrong_username: any;
    wrong_password: any;
}

type UserVerification = "succeeded" | "failed" | null;

interface UserData {
    first_name: string;
    last_name: string;
    username: string;
}
