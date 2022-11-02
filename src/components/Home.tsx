import { useEffect, useState } from "react";
import Logout from "./Logout";
import { useSelector } from 'react-redux';
import { RootState } from "../store/store";
import address from "../addressConfig";
import getToken from "../utils/getTokens";
import fetchWithInterval from "../utils/fetchWithInterval";
import { uid } from 'uid';
import { socket, socketListener } from "../utils/socketListener";

export default function Home() {
    const user = useSelector((state: RootState) => state.user);
    const { username } = user;
    const [users, setUsers] = useState<Usernames[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [chatPartner, setChatPartner] = useState<OnlineUser>();
    const [message, setMessage] = useState("");

    const openRoom = (e: any) => {
        setChatPartner(onlineUsers.find((obj) => obj.username === e.target.innerText));
        const room = uid();
        socket.emit('join-room', { username, chatPartner: e.target.innerText, room });
    };

    const sendMessage = () => {
        console.log(chatPartner?.socketId);
        console.log("send mess", message);
        socket.emit("message", {
            content: message,
            to: chatPartner?.socketId
        });
    };

    useEffect(() => {

        socketListener(username, setOnlineUsers); //initialize socket

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
    }, [username]);

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
                        if (usr.username !== user.username) {
                            return (
                                <div key={idx} className="userContainer" onClick={(e) => openRoom(e)}>
                                    <p className="username" style={onlineUsers.some((contactObj: OnlineUser) => contactObj.username === usr.username) ? { color: "white" } : { color: "red", opacity: 0.5 }}>{usr.username}</p>
                                </div>
                            );
                        } else {
                            return null;
                        }
                    })}
                </div>
            </div>
            <div className="rightCol">
                <div className="topBar rightBar">
                    <div className="leftSide">
                        <p className="username"><strong>{chatPartner ? chatPartner.username : "Select a contact"}</strong></p>
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
                        <input disabled={!chatPartner} className="chatInput" type="text" placeholder="Write a message..." onChange={(e) => setMessage(e.target.value)} />
                    </div>
                    <div className="sendButtonContainer">
                        <button disabled={!chatPartner} className="chatButton" onClick={sendMessage}>SEND</button>
                    </div>
                </div>
            </div>
        </div>
    );
}