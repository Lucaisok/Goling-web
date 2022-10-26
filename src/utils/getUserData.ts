import address from '../addressConfig';
import fetchWithInterval from '../utils/fetchWithInterval';

export default async function getUserData(token: string, parsedUserId: number) {

    try {

        const serverCall = () => {
            return fetch(address + "/getUserData", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    "authorization": token
                },
                body: JSON.stringify({
                    parsedUserId
                })
            });
        };

        const data = await fetchWithInterval(serverCall) as UserData;

        if (data) {
            return data;

        }

    } catch (err) {
        console.log("err", err);
    }

}