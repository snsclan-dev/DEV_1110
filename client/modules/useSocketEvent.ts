import { useCallback, useEffect } from "react";
import { chatSound } from "./utils";
import type { ChatMessage } from "types";
import { Socket } from "socket.io-client";

type SocketEvent = {
    socket: Socket;
    setMessage: (data: ChatMessage) => void;
    setUserStatus: (status: string | null) => void;
}
export const useSocketEvent = ({ socket, setUserStatus, setMessage }: SocketEvent)=>{
    
    const ROOM_MESSAGE = useCallback((data: ChatMessage) => {
        const { status, id, name, level } = data;
        if (status === "ADMIN") setUserStatus("ADMIN");
        if (status === "CREATE" || status === "JOIN") {
            setUserStatus("CHAT");
            chatSound();
        }
        setMessage({ status, id, name, level });
    }, [setUserStatus, setMessage]);

    useEffect(()=>{
        socket.on('ROOM_MESSAGE', ROOM_MESSAGE)
        return ()=>{
            socket.off('ROOM_MESSAGE', ROOM_MESSAGE)
        }
    }, [socket])
}