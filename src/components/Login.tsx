import { useState } from "react";
import address from "../addressConfig";
import fetchWithInterval from "../utils/fetchWithInterval";
import { useDispatch } from 'react-redux';
import { userLoggedIn } from '../features/user/userSlice';
import Spinner from "./Spinner";

export default function Login() {
    const [userInput, setUserInput] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const dispatch = useDispatch();

    const updateUsername = (elem: any) => {
        const username = elem.target.value;
        setUserInput({ ...userInput, username });
    };

    const updatePassword = (elem: any) => {
        const password = elem.target.value;
        setUserInput({ ...userInput, password });
    };

    const login = async () => {

        if (userInput.username !== "" && userInput.password !== "") {
            setLoading(true);
            const username = userInput.username.trim();
            const password = userInput.password.trim();

            const serverCall = () => {
                return fetch(address + "/login", {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username, password
                    })
                });
            };

            try {

                const data = await fetchWithInterval(serverCall) as LoginResponse;

                if (data.id) {
                    const token = data.token;
                    const refresh_token = data.refresh_token;

                    localStorage.setItem("userId", JSON.stringify(data.id));
                    localStorage.setItem("tokens", JSON.stringify({ token, refresh_token }));
                    setUserInput({ username: "", password: "" });

                    dispatch(userLoggedIn({ id: data.id, username, first_name: data.first_name, last_name: data.last_name }));

                } else if (data.wrong_username) {
                    setError("This username does not exist, please try again");

                } else if (data.wrong_password) {
                    setError("Wrong password, please try again");

                } else {
                    setError("Server connection error, please try again");
                }

            } catch (err) {
                setError("Server connection error, please try again");
                console.log("error in login()", err);
            }

            finally {
                setLoading(false);
            }

        } else {
            setError(userInput.username !== "" ?
                "Please insert your password" : "Please insert a username");
        }
    };

    return (
        <div className="loginContainer">
            {loading &&
                <Spinner />}
            <h1 className="pageTitile">Goling</h1>
            <div className="loginFormContainer">
                {error && <p className="error">{error}</p>}
                <input type="text" placeholder="Username" onChange={(elem) => updateUsername(elem)} />
                <input type="password" placeholder="Password" onChange={(elem) => updatePassword(elem)} />
                <button onClick={login}>LOGIN</button>
            </div>
        </div>
    );
}