import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { RootState } from "../store/store";
import { IconContext } from "react-icons";
import { FaBars } from "react-icons/fa";
import address from "../addressConfig";
import getToken from "../utils/getTokens";
import fetchWithInterval from "../utils/fetchWithInterval";
import Logout from "./Logout";
import UpdateLanguage from "./UpdateLanguage";

export default function UserColumn({ setChatPartner, setChat, unreadMessagesArray, setUnreadMessagesArray, onlineUsers }:
    { setChatPartner: any, setChat: any, unreadMessagesArray: UnreadMessage[], setUnreadMessagesArray: any, onlineUsers: OnlineUser[]; }) {
    const user = useSelector((state: RootState) => state.user);
    const { username, id } = user;
    const [openMenu, setOpenMenu] = useState<SlideMenu>(null);
    const [users, setUsers] = useState<Username[]>([]);

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

    useEffect(() => {
        if (username) {
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
                //on page load we want to set the chat on the last chat recorded and delete the unread mess if any
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
    );
}