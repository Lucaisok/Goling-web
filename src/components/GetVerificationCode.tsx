import address from '../addressConfig';
import fetchWithInterval from '../utils/fetchWithInterval';
import validEmail from '../utils/validEmail';
import { Link } from 'react-router-dom';

export default function GetVerificationCode({ setCodeSent, email, setEmail, setLoading, error, setError }
    : { setCodeSent: any, email: string, setEmail: any; setLoading: any, error: string, setError: any; }) {

    const updateEmail = (e: any) => {
        setError("");
        setEmail(e.target.value);
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

    return (
        <div className="loginFormContainer">
            {error && <p className='error'>{error}</p>}
            <input
                placeholder="Email"
                onChange={(elem) => updateEmail(elem)}
            />
            <button onClick={sendEmail}>Get Code</button>
            <p><Link to={"/"}>Login</Link> or <Link to={"/signup"}>Signup</Link></p>
        </div>
    );
}