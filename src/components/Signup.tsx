import { useState } from 'react';
import Spinner from '../components/Spinner';
import address from '../addressConfig';
import fetchWithInterval from '../utils/fetchWithInterval';
import { useDispatch } from 'react-redux';
import { userLoggedIn } from '../features/user/userSlice';
import validEmail from '../utils/validEmail';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
    const [userInput, setUserInput] = useState({ username: '', password: '', first_name: '', last_name: '', email: '' });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const updateUsername = (e: any) => {
        setError("");
        setUserInput({ ...userInput, username: e.target.value });
    };

    const updateFirstName = (e: any) => {
        setError("");
        setUserInput({ ...userInput, first_name: e.target.value });
    };

    const updateLastName = (e: any) => {
        setError("");
        setUserInput({ ...userInput, last_name: e.target.value });
    };

    const updatePassword = (e: any) => {
        setError("");
        setUserInput({ ...userInput, password: e.target.value });
    };

    const updateEmail = (e: any) => {
        setError("");
        setUserInput({ ...userInput, email: e.target.value });
    };

    const signup = async () => {
        if (userInput.username !== "" && userInput.password !== "" && userInput.first_name !== "" && userInput.last_name !== "" && userInput.email) {
            const username = userInput.username.trim();
            const password = userInput.password.trim();
            const first_name = userInput.first_name.trim();
            const last_name = userInput.last_name.trim();
            const email = userInput.email.trim();

            if (!validEmail(email)) {
                setError('Please insert a valid email address');

            } else {
                setLoading(true);

                try {
                    const serverCall = () => {
                        return fetch(address + "/signin", {
                            method: 'POST',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                username, password, first_name, last_name, email
                            })
                        });
                    };

                    const data = await fetchWithInterval(serverCall) as SignupResponse;

                    if (data.existing_username) {
                        setError("Username already exist, please try again");

                    } else if (data.token && data.refresh_token && data.id) {
                        const token = data.token;
                        const refresh_token = data.refresh_token;

                        localStorage.setItem("userId", JSON.stringify(data.id));
                        localStorage.setItem("username", JSON.stringify(username));
                        //we could avoid storing the username but need to change how we create the tokens on the server and use Id instead.
                        localStorage.setItem("tokens", JSON.stringify({ token, refresh_token }));

                        setUserInput({ username: '', password: '', first_name: '', last_name: '', email: '' });

                        dispatch(userLoggedIn({ id: data.id, username, first_name, last_name }));

                        navigate("/");

                    } else {
                        setError("Server connection error, please try again");
                    }

                } catch (err) {
                    console.log("error in signup()", err);
                    setError("Server connection error, please try again");

                } finally {
                    setLoading(false);
                }

            }

        } else {
            setError("Every field is required");
        }
    };

    return (
        <div className="loginContainer">
            {loading &&
                <Spinner />}
            <h1 className="pageTitle">Goling</h1>
            <div className="loginFormContainer">
                {error && <p className='error'>{error}</p>}
                <input
                    placeholder="Username"
                    onChange={(elem) => updateUsername(elem)}
                />
                <input
                    placeholder="First Name"
                    onChange={(elem) => updateFirstName(elem)}
                />
                <input
                    placeholder="Last Name"
                    onChange={(elem) => updateLastName(elem)}
                />
                <input
                    placeholder="Email"
                    onChange={(elem) => updateEmail(elem)}
                />
                <input
                    placeholder="Password"
                    onChange={(elem) => updatePassword(elem)}
                />
                <button onClick={signup}>SIGNUP</button>
                <p>Already a member ? <Link to={"/"}>Login</Link></p>
            </div>
        </div>
    );
}
