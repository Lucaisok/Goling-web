import jwt_decode, { JwtPayload } from "jwt-decode";

export default function checkToken(token: string) {

    const decoded: JwtPayload = jwt_decode(token);
    const dateNow = new Date();
    const timeNow = dateNow.getTime();
    const expiryDate = decoded.exp! * 1000;
    const timeToServer = 5000;    // Making sure the token is still valid when it arrives on the server!
    const tokenExpired = (expiryDate - timeToServer) < timeNow;

    if (decoded && !tokenExpired) {
        return token;
    }
}