import { io, Socket } from 'socket.io-client';
import address from "../addressConfig";

export let socket: Socket;

export async function socketListener(username: string, id: string, setOnlineUsers: any, setNewMessage: any) {

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

        const message = {
            translated_body: content,
            sender: from,
            id
        };

        setNewMessage(message);
    });

    socket.on("socket-duplicate", () => {
        window.location.reload();
    });

}