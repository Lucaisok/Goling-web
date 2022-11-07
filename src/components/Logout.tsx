import { useDispatch } from 'react-redux';
import { userLoggedOut } from "../features/user/userSlice";
import { socket } from "../utils/socketListener";

export default function Logout() {
    const dispatch = useDispatch();

    const logout = () => {
        localStorage.clear();
        socket.disconnect();
        dispatch(userLoggedOut());
    };

    return (
        <div>
            <button className='logoutButton' onClick={logout}>LOGOUT</button>
        </div>
    );
}