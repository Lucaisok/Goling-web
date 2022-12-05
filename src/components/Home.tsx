import { useEffect, useState } from "react";
import Logout from "./Logout";
import { useSelector } from 'react-redux';
import { RootState } from "../store/store";
import address from "../addressConfig";
import getToken from "../utils/getTokens";
import fetchWithInterval from "../utils/fetchWithInterval";
// import { uid } from 'uid';
import { socket, socketListener } from "../utils/socketListener";
import UpdateLanguage from "./UpdateLanguage";
import { FaBars } from "react-icons/fa";
import { IconContext } from "react-icons";

type SlideMenu = null | boolean;

export default function Home() {
    const user = useSelector((state: RootState) => state.user);
    const { username, id } = user;
    const [users, setUsers] = useState<Username[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [chatPartner, setChatPartner] = useState<OnlineUser>();
    const [message, setMessage] = useState("");
    const [openMenu, setOpenMenu] = useState<SlideMenu>(null);
    const [chat, setChat] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<Message | null>();

    // const openRoom = (e: any) => {
    //     // setChatPartner(onlineUsers.find((obj) => obj.username === e.target.innerText)); //should not be just for online users
    //     // if (newMessage) setChat([...chat, newMessage]);
    //     // const room = uid();
    //     // socket.emit('join-room', { username, chatPartner: e.target.innerText, room });
    // };

    const selectChat = async (usr: Username) => {

        setChatPartner({ username: usr.username, socketId: "" });

        if (newMessage) setNewMessage(null);

        try {
            const token = await getToken();

            if (token) {

                const serverCall = () => {
                    return fetch(address + `/chat?userId=${id}&chatPartnerUsername=${usr.username}`, {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            "authorization": token
                        }
                    });
                };

                const data = await fetchWithInterval(serverCall) as Message[];
                setChat(data);
            }

        } catch (err) {
            console.log("err", err);

        }
    };

    const sendMessage = async () => {

        const serverCall = () => {
            return fetch("https://libretranslate.de/detect", {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    q: message
                })
            });
        };

        const data = await fetchWithInterval(serverCall) as DetectLanguageResult[];
        //add checks here
        const messageLanguage = data[0].language;

        socket.emit("message", {
            content: message,
            language: messageLanguage,
            to: chatPartner?.username
        });

        setChat([...chat, { original_body: message, sender: username, receiver: chatPartner?.username, original_language: messageLanguage, created_at: new Date() }]);
        setMessage("");
    };

    useEffect(() => {
        if (username) {
            socketListener(username, id, setOnlineUsers, setNewMessage); //initialize socket

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
                            }
                        });
                    };

                    const data = await fetchWithInterval(serverCall) as Username[];

                    setUsers(data);
                }
            })();
        }
    }, [username, id]);

    useEffect(() => {
        if (newMessage && (newMessage.sender === chatPartner?.username)) {
            setChat([...chat, newMessage]);
            setNewMessage(null);
        }
    }, [newMessage, chat, chatPartner?.username]);

    return (
        <div className="HomeContainer">
            <div className="leftCol">
                <div className="topBar">
                    <div className="leftSide">
                        <p className="username"><strong>{user.username}</strong></p>
                        <p className="username" style={{ marginLeft: "10px" }}>{user.language}</p>
                    </div>
                    <div className="rightSide">
                        <div onClick={() => setOpenMenu(!openMenu)} className={openMenu === null ? "" : openMenu ? "rotate" : "rotateBack"}>
                            <IconContext.Provider value={{ color: "white", size: "1.5em", className: "hamburgerMenu" }}>
                                <FaBars />
                            </IconContext.Provider>
                        </div>
                    </div>
                </div>
                <div style={{ height: "inherit", display: "flex", justifyContent: "center", alignItems: "center", width: "200%" }}>
                    <div style={{ height: "inherit", width: "100%" }}>
                        <div className="searchFieldContainer">
                            <input className="searchField" type="text" placeholder="Search Contact" />
                        </div>
                        <div className="listContainer">
                            {/* map of the chat chronology and search results */}
                            {users && users.map((usr, idx) => {
                                if (usr.username !== user.username) {
                                    return (
                                        <div key={idx} className="userContainer" onClick={() => selectChat(usr)}>
                                            <p className="username" style={onlineUsers.some((contactObj: OnlineUser) => contactObj.username === usr.username) ? { color: "white" } : { color: "red", opacity: 0.5 }}>{usr.username}</p>
                                            {newMessage && newMessage.sender === usr.username && <p>{newMessage.translated_body}</p>}
                                            {newMessage && newMessage.sender === usr.username && <div className="redCircle"></div>}
                                        </div>
                                    );
                                } else {
                                    return null;
                                }
                            })}
                        </div>
                    </div>
                    <div className={(openMenu === null ? "slideMenu" : openMenu === false ? "slideBack slideMenu" : "slide slideMenu")}>
                        <div>
                            <UpdateLanguage />
                        </div>
                        <div>
                            <Logout />
                        </div>
                    </div>
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
                    {chat && chat.map((msg, idx) => {
                        return (
                            <div key={idx} className={"messageRow " + (msg.sender === username ? "ownMessage" : "partnerMessage")}>
                                {msg.sender === username ? <p>{msg.original_body}</p> : <p>{msg.translated_body}</p>}
                            </div>
                        );
                    })}
                </div>
                <div className="chatInputContainer">
                    <div className="textFieldContainer">
                        <input disabled={!chatPartner} className="chatInput" type="text" placeholder="Write a message..." onChange={(e) => setMessage(e.target.value)} value={message} />
                    </div>
                    <div className="sendButtonContainer">
                        <button disabled={!chatPartner} className="chatButton" onClick={sendMessage}>SEND</button>
                    </div>
                </div>
            </div>
        </div>
    );
}