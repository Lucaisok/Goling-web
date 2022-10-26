import address from "../addressConfig";
import fetchWithInterval from '../utils/fetchWithInterval';

export default async function createNewToken(refreshToken: string) {
    const username = localStorage.getItem("username");

    try {
        const serverCall = () => {
            return fetch(address + "/create-new-tokens", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'refreshAuthorization': refreshToken
                },
                body: JSON.stringify({
                    username
                })
            });
        };

        const data = await fetchWithInterval(serverCall) as TokensResponse;

        if (data.token && data.refreshToken) {
            const token = data.token;
            const refresh_token = data.refreshToken;
            localStorage.setItem("tokens", JSON.stringify({ token, refresh_token }));

            return token;
        }

    } catch (err) {
        console.log("err in createNewToken", err);
    }

}