import { io, Socket } from 'socket.io-client';
import address from "../addressConfig";

export let socket: Socket;

export async function socketListener(username: string, id: string, setOnlineUsers: any, unreadMessagesArray: UnreadMessage[], setUnreadMessagesArray: any, chatPartner: OnlineUser | undefined, chat: Message[], setChat: any) {

    socket = io(address, { transports: ["websocket"], query: { username, id } });

    socket.onAny((event) => {
        console.log('socketEvent:', event, "user: ", username);
    });

    socket.on("connect_error", (err) => {
        console.log("connection error,", "user: ", username, "err: ", err);
    });

    socket.on("users", (users: OnlineUser[]) => {
        setOnlineUsers(users);
    });

    socket.on("message", ({ content, from, id }) => {
        //old version
        // const message = {
        //     translated_body: content,
        //     sender: from
        // };
        // setNewMessage(message);

        //new version, if not working may be cause unreadMessagesArray do not update being a prop and not a state, wee need redux then

        const prevMessArray = unreadMessagesArray.filter(msg => msg.sender === from);

        if (prevMessArray.length > 0) {
            //we already have unread messages from this user, the incoming is newer for sure, sostituisci.
            let newMessagesArray = unreadMessagesArray.filter(mess => mess !== prevMessArray[0]);
            const count = prevMessArray[0].numberOfUnreadMessages;
            const newMess = {
                sender: from,
                id,
                numberOfUnreadMessages: count + 1,
                body: content
            };
            newMessagesArray.push(newMess);
            setUnreadMessagesArray(newMessagesArray);

        } else {
            // no prev unread mess from same user
            if (chatPartner && chatPartner.username !== from) {
                //chat screen not open on sender of the new mess, new unread mess
                const message: UnreadMessage = {
                    body: content,
                    sender: from,
                    id,
                    numberOfUnreadMessages: 1
                };

                setUnreadMessagesArray((prevArray: UnreadMessage[]) => {
                    return [
                        ...prevArray,
                        message
                    ];
                });

            } else {
                //already talking with this user, update chat
                const message: Message = {
                    translated_body: content,
                    sender: from,
                    id,
                };

                setChat((prevChat: Message[]) => {
                    return [
                        ...prevChat,
                        message
                    ];
                });
            }
        }

    });

    socket.on("socket-duplicate", () => {
        window.location.reload();
    });

}