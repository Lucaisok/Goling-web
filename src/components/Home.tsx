import { useEffect, useState } from "react";
import Logout from "./Logout";
import { useSelector } from 'react-redux';
import { RootState } from "../store/store";
import address from "../addressConfig";
import getToken from "../utils/getTokens";
import fetchWithInterval from "../utils/fetchWithInterval";

export default function Home() {
    const user = useSelector((state: RootState) => state.user);
    const [users, setUsers] = useState<Usernames[]>([]);

    useEffect(() => {
        //retrieve all users, just for ex.
        (async () => {

            const token = await getToken();

            if (token) {

                const serverCall = () => {
                    return fetch(address + "/get-users", {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            "authorization": token
                        },
                    });
                };

                const data = await fetchWithInterval(serverCall) as Usernames[];

                setUsers(data);
            }
        })();
    });

    return (
        <div className="HomeContainer">
            <div className="leftCol">
                <div className="topBar">
                    <div className="leftSide">
                        <p className="username"><strong>{user.username}</strong></p>
                    </div>
                    <div className="rightSide">
                        {/* general menu, with logout inside */}
                        <Logout />
                    </div>
                </div>
                <div className="searchFieldContainer">
                    <input className="searchField" type="text" placeholder="Search Contact" />
                </div>
                <div className="listContainer">
                    {/* map of the chat chronology and search results */}
                    {users && users.map((usr, idx) => {
                        return (
                            <div key={idx} className="userContainer">
                                <p className="username">{usr.username}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="rightCol">
                <div className="topBar rightBar">
                    <div className="leftSide">
                        <p className="username"><strong>Chat partner username</strong></p>
                    </div>
                    <div className="rightSide">
                        <p className="username"><strong>Chat menu</strong></p>
                    </div>
                </div>
                <div className="chatBody">
                    {/* Here the body of the Chat */}
                </div>
                <div className="chatInputContainer">
                    <div className="textFieldContainer">
                        <input className="chatInput" type="text" placeholder="Write a message..." />
                    </div>
                    <div className="sendButtonContainer">
                        <button className="chatButton">SEND</button>
                    </div>
                </div>
            </div>
        </div>
    );
}