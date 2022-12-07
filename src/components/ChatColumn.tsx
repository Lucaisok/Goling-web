import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { RootState } from "../store/store";
import fetchWithInterval from "../utils/fetchWithInterval";
import { socket } from "../utils/socketListener";

export default function ChatColumn({ chatPartner, chat, setChat }: { chatPartner: OnlineUser | undefined; chat: Message[]; setChat: any; }) {
    const user = useSelector((state: RootState) => state.user);
    const { username, id } = user;
    const [message, setMessage] = useState("");

    const sendMessage = async () => {

        try {

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

        } catch (err) {
            console.log("err", err);
        }
    };

    return (
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
    );
}