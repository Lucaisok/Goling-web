import Logout from "./Logout";
import { useSelector } from 'react-redux';
import { RootState } from "../store/store";

export default function Home() {
    const user = useSelector((state: RootState) => state.user);

    return (
        <div>
            <h1>Goling</h1>
            <p>Welcome {user.first_name} {user.last_name}</p>
            <p>Your username is: {user.username}</p>
            <p>Your Id is: {user.id}</p>
            <Logout />
        </div>
    );
}