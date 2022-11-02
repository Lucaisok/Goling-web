import { io, Socket } from 'socket.io-client';
import address from "../addressConfig";

export let socket: Socket;

export async function socketListener(username: string, setOnlineUsers: any) {

    console.log("socketListener fires");

    socket = io(address, { transports: ["websocket"], query: { username } });

    socket.onAny((event) => {
        console.log('socketEvent:', event, "user: ", username);
    });

    socket.on("connect_error", (err) => {
        console.log("connection error,", "user: ", username, "err: ", err);
    });

    socket.on("users", (users: OnlineUser[]) => {
        console.log("users", users);
        setOnlineUsers(users);
    });

    socket.on("private message", ({ content, from }) => {
        console.log("Private Message!!! content: ", content, "from: ", from);
    });

}