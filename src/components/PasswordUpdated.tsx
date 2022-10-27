import { useNavigate } from 'react-router-dom';

export default function PasswordUpdated() {
    const navigate = useNavigate();

    return (
        <div className="loginFormContainer">
            <p className='success'>Password successfully updated!</p>
            <button onClick={() => navigate("/")}>LOGIN</button>
        </div>
    );
}