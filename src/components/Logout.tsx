import { useDispatch } from 'react-redux';
import { userLoggedOut } from "../features/user/userSlice";

export default function Logout() {
    const dispatch = useDispatch();

    const logout = () => {
        localStorage.clear();
        dispatch(userLoggedOut());
    };

    return (
        <div>
            <button className='logoutButton' onClick={logout}>LOGOUT</button>
        </div>
    );
}