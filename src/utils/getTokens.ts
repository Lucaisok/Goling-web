import checkToken from "./checkToken";
import createNewToken from "./createNewTokens";

export default async function getToken() {

    try {
        const tokens = localStorage.getItem("tokens");

        if (tokens) {
            const { token, refresh_token } = JSON.parse(tokens);

            const validToken = checkToken(token);
            if (validToken) return validToken;

            // If our current token has expired we use our refresh token to create new tokens
            let newToken = await createNewToken(refresh_token);
            if (newToken) return newToken;

            //would be great to log the user out here, but can not dispatch action from a non component file!
        }

    } catch (err) {
        console.log("err in getToken", err);
    }

}