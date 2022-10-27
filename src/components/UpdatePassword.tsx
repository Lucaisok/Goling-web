import address from '../addressConfig';
import fetchWithInterval from '../utils/fetchWithInterval';

export default function UpdatePassword({ error, setError, setPassword, setRepeatedPassword, password, repeatedPassword, setLoading, email, setPasswordUpdated }
    : { error: string, setError: any, setPassword: any, setRepeatedPassword: any, password: string, repeatedPassword: string, setLoading: any, email: string, setPasswordUpdated: any; }) {

    const updatePassword = (e: any) => {
        setError("");
        setPassword(e.target.value);
    };

    const updateRepeatedPassword = (e: any) => {
        setError("");
        setRepeatedPassword(e.target.value);
    };

    const submitPassword = async () => {
        if (password !== "" && repeatedPassword !== "") {
            password.trim();
            repeatedPassword.trim();

            if (password === repeatedPassword) {
                setLoading(true);

                try {
                    const serverCall = () => {
                        return fetch(address + "/update-password", {
                            method: 'POST',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                password, email
                            })
                        });
                    };

                    const data = await fetchWithInterval(serverCall) as ServerResponse;

                    if (data.success) {
                        setPasswordUpdated(true);

                    } else {
                        setError("Something went wrong, please try again");

                    }

                } catch (err) {
                    console.log("err", err);

                } finally {
                    setLoading(false);

                }

            } else {
                setError("The passwords do not match, please try again");
            }

        } else {
            setError("Please fill the fields");
        }
    };

    return (
        <div className="loginFormContainer">
            {error && <p className='error'>{error}</p>}
            <p>Insert New Password</p>
            <input type="password" onChange={(elem) => updatePassword(elem)} />
            <p>Repeat Password</p>
            <input type="password" onChange={(elem) => updateRepeatedPassword(elem)} />
            <button onClick={submitPassword}>Submit</button>
        </div>
    );
}