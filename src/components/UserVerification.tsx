import { useState, useEffect } from 'react';
import Home from './Home';
import Login from './Login';

export default function UserVerification() {
    const [userVerification, setUserVerification] = useState<UserVerification>(null);

    useEffect(() => {
        (async () => {

            try {

                const userId = localStorage.getItem("userId");

                if (userId) {
                    setUserVerification("succeeded");

                } else {
                    setUserVerification("failed");
                }

            } catch (err) {
                console.log("err in UserVerification", err);
                setUserVerification('failed');
            }

        })();

    }, []);

    if (userVerification === "succeeded") {
        return <Home />;

    } else if (userVerification === "failed") {
        return <Login />;

    } else {
        // splash screen!
        return null;
    }
}