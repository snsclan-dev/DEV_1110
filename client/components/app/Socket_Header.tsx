import { useCallback, useEffect } from "react";
import { chatSound, storeApp, storeUser } from "modules";
import { checkAdmin } from "modules/systems";
import { $CHAT_MESSAGE } from "components/chat";
import type { ChatMessage, User } from "types";
import { storeChat } from "modules/storeChat";

export const Socket_Header = ()=>{
    const { setPopup } = storeApp((s)=>s)
    const { user, socket } = storeUser((s)=> s)
    const { room, setRoomUser, setRoomStatus, setMessage } = storeChat((s)=> s)
    
    const ROOM_USER = useCallback((data: { user: User[] }) => setRoomUser(data.user), []);
    const ROOM_MESSAGE = useCallback((data: ChatMessage)=>{
        const { status, id, name, level } = data;
        if(status === 'ADMIN') setRoomStatus('ADMIN')
        if (status === 'CREATE' || status === 'JOIN'){
            setRoomStatus('CHAT'); chatSound();
        }
        setMessage({ status, id, name, level })
    }, [room])

    useEffect(()=>{
        socket.on('ALERT', (data)=> setPopup(data))
        socket.on("ROOM_USER", ROOM_USER)
        socket.on('ROOM_MESSAGE', ROOM_MESSAGE)
        socket.on('CHAT_MESSAGE', async (data) => {
            setMessage(data);
            if (data.name === user.name && !checkAdmin(user.level)) $CHAT_MESSAGE.line += 1;
            else $CHAT_MESSAGE.line = 1;
        })
        return ()=>{
            socket.off()
        }
    }, [socket])

    return null;
}