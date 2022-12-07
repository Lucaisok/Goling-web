import { useEffect, useState } from "react";
import Logout from "./Logout";
import { useSelector } from 'react-redux';
import { RootState } from "../store/store";
import address from "../addressConfig";
import getToken from "../utils/getTokens";
import fetchWithInterval from "../utils/fetchWithInterval";
import { socket, socketListener } from "../utils/socketListener";
import UpdateLanguage from "./UpdateLanguage";
import { FaBars } from "react-icons/fa";
import { IconContext } from "react-icons";

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
    const [unreadMessagesArray, setUnreadMessagesArray] = useState<UnreadMessage[]>([]);

    const selectChat = async (usr: Username) => {

        setChatPartner({ username: usr.username, socketId: "" });

        localStorage.setItem("chatPartner", usr.username);

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

                if (unreadMessagesArray.filter((msg: UnreadMessage) => msg.sender === usr.username).length) {
                    setUnreadMessagesArray(unreadMessagesArray.filter((msg: UnreadMessage) => msg.sender !== usr.username));
                    //update db, everything read for this conversation.

                    const serverCall = () => {
                        return fetch(address + `/update-message-unread-flag`, {
                            method: 'POST',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                "authorization": token
                            },
                            body: JSON.stringify({
                                userId: id,
                                chatPartnerUsername: usr.username
                            })
                        });
                    };

                    await fetchWithInterval(serverCall);
                }
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

        setChat([...chat, { id: 999, original_body: message, sender: username, receiver: chatPartner?.username, original_language: messageLanguage, translated_body: "", created_at: new Date() }]);
        setMessage("");
    };

    useEffect(() => {
        if (username) {
            socketListener(username, id, setOnlineUsers, setNewMessage); //initialize socket

            //retrieve all users, just for ex.
            (async () => {

                try {
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

                } catch (err) {
                    console.log("err", err);
                }

            })();
        }
    }, [username, id]);

    useEffect(() => {
        //this fires when we receive a new message
        if (newMessage) {
            if (newMessage.sender === chatPartner?.username) {
                //we are alkready talking with the sender, just update chat
                setChat([...chat, newMessage]);
                setNewMessage(null);

            } else {
                //we are not talking with the user, update unread messages
                const unreadMessFromSameUser = unreadMessagesArray.filter(msg => msg.sender === newMessage.sender);
                if (unreadMessFromSameUser.length) {
                    //we already have unread mess from this user, update his last unread mess.
                    const count = unreadMessFromSameUser[0].numberOfUnreadMessages + 1;
                    let newMessagesArray = unreadMessagesArray.filter(mess => mess.id !== unreadMessFromSameUser[0].id);
                    const newMess = {
                        sender: newMessage.sender,
                        id: newMessage.id,
                        numberOfUnreadMessages: count,
                        body: newMessage.translated_body
                    };
                    newMessagesArray.push(newMess);
                    setUnreadMessagesArray(newMessagesArray);
                    setNewMessage(null);
                } else {
                    //no previous unread mess from this user, push it to unread mess
                    const message: UnreadMessage = {
                        body: newMessage.translated_body,
                        sender: newMessage.sender,
                        id: newMessage.id,
                        numberOfUnreadMessages: 1
                    };
                    setUnreadMessagesArray([...unreadMessagesArray, message]);
                    setNewMessage(null);
                }
            }
        }

    }, [newMessage]);

    useEffect(() => {
        //check for unread messages on page load
        (async () => {
            let unreadMessages: UnreadMessage[] = [];
            let senderGroupedMessagesObject: UnreadMessage;

            try {
                const token = await getToken();

                if (token) {

                    const serverCall = () => {
                        return fetch(address + `/unread-messages?username=${username}`, {
                            method: 'GET',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                "authorization": token
                            }
                        });
                    };

                    const data = await fetchWithInterval(serverCall) as Message[];

                    for (let i = 0; i < data.length; i++) {

                        const messageFromSameUser = unreadMessages.filter(e => e.sender === data[i].sender);

                        if (messageFromSameUser.length) {
                            //unreadMessages already contain a message from this user, check if id is >
                            if (messageFromSameUser[0].id < data[i].id) {
                                //data[i] is more recent, this must sostituire messageFromSameUser in unreadMessages and its count must be messageFromSameUser.number + 1
                                senderGroupedMessagesObject = {
                                    id: data[i].id,
                                    sender: data[i].sender,
                                    body: data[i].translated_body,
                                    numberOfUnreadMessages: messageFromSameUser[0].numberOfUnreadMessages + 1
                                };
                                unreadMessages = unreadMessages.filter(e => e !== messageFromSameUser[0]);
                                unreadMessages.push(senderGroupedMessagesObject);

                            } else {
                                // just increment numberOfUnreadMessages count of messageFromSameUser reference in unreadMessages
                                let updatedMessageFromSameUser = {
                                    id: messageFromSameUser[0].id,
                                    sender: messageFromSameUser[0].sender,
                                    body: messageFromSameUser[0].body,
                                    numberOfUnreadMessages: messageFromSameUser[0].numberOfUnreadMessages + 1
                                };

                                unreadMessages = unreadMessages.filter(e => e !== messageFromSameUser[0]);
                                unreadMessages.push(updatedMessageFromSameUser);
                            }

                        } else {
                            //unreadMess do not contain a mess from this user, push it there.
                            senderGroupedMessagesObject = {
                                id: data[i].id,
                                sender: data[i].sender,
                                body: data[i].translated_body,
                                numberOfUnreadMessages: 1
                            };

                            unreadMessages.push(senderGroupedMessagesObject);
                        }

                    }
                    setUnreadMessagesArray(unreadMessages);
                }

            } catch (err) {
                console.log("err", err);

            } finally {
                const partner = localStorage.getItem("chatPartner");

                if (partner) {
                    selectChat({ username: partner });

                    if (unreadMessages.length) {
                        const token = await getToken();

                        if (token) {
                            setUnreadMessagesArray(unreadMessages.filter((msg: UnreadMessage) => msg.sender !== partner));
                            //update db, everything read for this conversation.
                            const serverCall = () => {
                                return fetch(address + `/update-message-unread-flag`, {
                                    method: 'POST',
                                    headers: {
                                        Accept: 'application/json',
                                        'Content-Type': 'application/json',
                                        "authorization": token
                                    },
                                    body: JSON.stringify({
                                        userId: id,
                                        chatPartnerUsername: partner
                                    })
                                });
                            };

                            await fetchWithInterval(serverCall);
                        }
                    }
                }
            }

        })();

    }, []);

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
                                            <p className="username" style={onlineUsers.some((contactObj: OnlineUser) => contactObj.username === usr.username) ? { color: "white" } : { color: "#315477" }}>{usr.username}</p>
                                            {unreadMessagesArray.map((msg, idx) => {
                                                if (msg.sender === usr.username) {
                                                    return (
                                                        <div key={idx} className="unreadMessagePreviewContainer">
                                                            <p>{msg.body}</p>
                                                            <div className="redCircle">
                                                                <p>{msg.numberOfUnreadMessages}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                } else {
                                                    return null;
                                                }
                                            })}
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
};
