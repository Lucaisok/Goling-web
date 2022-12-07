import { useDispatch } from 'react-redux';
import { userLoggedOut } from "../features/user/userSlice";
import { socket } from "../utils/socketListener";

export default function Logout() {
    const dispatch = useDispatch();

    const logout = () => {
        const partner = localStorage.getItem("chatPartner");
        localStorage.clear();
        if (partner) localStorage.setItem("chatPartner", partner);
        socket.disconnect();
        dispatch(userLoggedOut());
    };

    return (
        <div id='logoutButtonContainer'>
            <button className='logoutButton' onClick={logout}>LOGOUT</button>
        </div>
    );
}