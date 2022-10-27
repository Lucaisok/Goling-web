import { useState } from 'react';
import address from '../addressConfig';
import fetchWithInterval from '../utils/fetchWithInterval';

export default function CheckVerificationCode({ setCodeSent, setCodeVerified, email, setLoading, error, setError }
    : { setCodeSent: any, setCodeVerified: any; email: string, setLoading: any; error: string, setError: any; }) {
    const [code, setCode] = useState('');

    const updateCode = (e: any) => {
        setError("");
        setCode(e.target.value);
    };

    const submitCode = async () => {

        if (code !== "") {
            code.trim();
            setLoading(true);

            try {
                const serverCall = () => {
                    return fetch(address + "/verify-code", {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            code, email
                        })
                    });
                };

                const data = await fetchWithInterval(serverCall) as ServerResponse;

                if (data.success) {
                    setCodeVerified(true);

                } else {
                    setError("The code does not match, please try again");
                }

            } catch (err) {
                console.log("err", err);

            } finally {
                setLoading(false);

            }

        } else {
            setError("Please insert the code you just received at your email address");
        }
    };

    return (
        <div className="loginFormContainer">
            {error && <p className='error'>{error}</p>}
            <p>Insert Code</p>
            <input type="number" onChange={(elem) => updateCode(elem)} />
            <button onClick={submitCode}>Submit</button>
            <p>No email ?</p>
            <button onClick={() => setCodeSent(false)}>Try again</button>
        </div>
    );

}