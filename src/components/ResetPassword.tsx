import { useState } from 'react';
import Spinner from '../components/Spinner';
import CheckVerificationCode from './CheckVerificationCode';
import GetVerificationCode from './GetVerificationCode';
import UpdatePassword from './UpdatePassword';
import PasswordUpdated from './PasswordUpdated';


export default function ResetPassword() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [codeVerified, setCodeVerified] = useState(false);
    const [password, setPassword] = useState("");
    const [repeatedPassword, setRepeatedPassword] = useState("");
    const [passwordUpdated, setPasswordUpdated] = useState(false);

    return (
        <div className="loginContainer">
            {loading &&
                <Spinner />}
            <h1 className="pageTitile">Goling</h1>
            {!codeSent && !codeVerified && <GetVerificationCode setCodeSent={setCodeSent} email={email} setEmail={setEmail} setLoading={setLoading} error={error} setError={setError} />}
            {codeSent && !codeVerified && <CheckVerificationCode setCodeSent={setCodeSent} email={email} setLoading={setLoading} error={error} setError={setError} setCodeVerified={setCodeVerified} />}
            {codeVerified && !passwordUpdated && <UpdatePassword email={email} setLoading={setLoading} error={error} setError={setError} password={password} setPassword={setPassword} repeatedPassword={repeatedPassword} setRepeatedPassword={setRepeatedPassword} setPasswordUpdated={setPasswordUpdated} />}
            {passwordUpdated && <PasswordUpdated />}
        </div>
    );
}