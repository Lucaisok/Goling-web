import { useDispatch } from 'react-redux';
import { userLoggedOut } from "../features/user/userSlice";

export default function Logout() {
    const dispatch = useDispatch();

    const logout = async () => {
        localStorage.clear();
        dispatch(userLoggedOut());
    };

    return (
        <div>
            <button onClick={logout}>LOGOUT</button>
        </div>
    );
}