import { useState } from 'react';
import Spinner from '../components/Spinner';
import address from '../addressConfig';
import fetchWithInterval from '../utils/fetchWithInterval';
import validEmail from '../utils/validEmail';
import { Link, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [code, setCode] = useState('');
    const navigate = useNavigate();

    const updateEmail = (elem: any) => {
        setError("");
        setEmail(elem.target.value);
    };

    const sendEmail = async () => {
        if (email !== '') {
            email.trim();

            if (!validEmail(email)) {
                setError("Please insert a valid email address");

            } else {
                setLoading(true);

                try {
                    const serverCall = () => {
                        return fetch(address + "/reset-password-email", {
                            method: 'POST',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                email
                            })
                        });
                    };

                    const data = await fetchWithInterval(serverCall) as ServerResponse;

                    if (data.success) {
                        setEmail("");
                        setCodeSent(true);

                    } else if (data.serverError) {
                        setError('Server Error, please try again');

                    } else {
                        setEmail("");
                        setError('There isn`t any registerd account linked to this email address.');

                    }

                } catch (err) {
                    console.log("error in reset_pwd", err);

                } finally {
                    setLoading(false);
                }

            }

        } else {
            setError('Please enter the email address of your Goling account.');
        }
    };

    const updateCode = (elem: any) => {
        setCode(elem.target.value);
    };

    const submitCode = () => {
        console.log("code", code);
        //to be done
    };

    return (
        <div className="loginContainer">
            {loading &&
                <Spinner />}
            <h1 className="pageTitile">Goling</h1>
            <div className="">
                {error &&
                    <p className='error'>{error}</p>}

                {!codeSent &&
                    <div>
                        <input
                            placeholder="Email"
                            onChange={(elem) => updateEmail(elem)}
                        />
                        <button onClick={sendEmail}>Get Code</button>
                    </div>}
                {!codeSent &&
                    <div>
                        <button onClick={() => navigate('Login')}>Login</button>
                        <p>or</p>
                        <button onClick={() => navigate('Signup')}>Signup</button>
                    </div>}

                {codeSent &&
                    <div>
                        <p>Insert Code</p>
                        <input type="number" onChange={(elem) => updateCode(elem)} />
                        <button onClick={submitCode}>Submit</button>
                    </div>
                }

                {codeSent &&
                    <div>
                        <p>No email ?</p>
                        <button onClick={() => setCodeSent(false)}>Try again</button>
                    </div>}

            </div>
        </div>
    );
}