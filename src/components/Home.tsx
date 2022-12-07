import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { RootState } from "../store/store";
import { socketListener } from "../utils/socketListener";
import UserColumn from "./UserColumn";
import ChatColumn from "./ChatColumn";

export default function Home() {
    const user = useSelector((state: RootState) => state.user);
    const { username, id } = user;
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [chatPartner, setChatPartner] = useState<OnlineUser>();
    const [chat, setChat] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<Message | null>();
    const [unreadMessagesArray, setUnreadMessagesArray] = useState<UnreadMessage[]>([]);

    useEffect(() => {
        if (username) {
            socketListener(username, id, setOnlineUsers, setNewMessage); //initialize socket
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

    return (
        <div className="HomeContainer">
            <UserColumn setChatPartner={setChatPartner} setChat={setChat} unreadMessagesArray={unreadMessagesArray} setUnreadMessagesArray={setUnreadMessagesArray} onlineUsers={onlineUsers} />
            <ChatColumn chatPartner={chatPartner} chat={chat} setChat={setChat} />
        </div>
    );
};
