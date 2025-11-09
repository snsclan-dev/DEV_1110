import { useCallback, useEffect, useState } from "react";
import { socketData, storeApp, storeChat, storeUser } from "modules"
import { checkAdmin } from "modules/systems";
import { $ROOM_STATUS, Room_Header, Room_Wait } from "components/room";
import { $CHAT_MESSAGE, Chat_View } from "components/chat";
import { ChatMessage, CodeData, RoomUser } from "types";

export const Room_Layout = ()=>{
    const { setPopup, setConfirm } = storeApp((s)=> s)
    const { user, socket } = storeUser((s)=> s)
    const { room, setRoom, setRoomUser, setRoomStatus, setMessage, clear } = storeChat((s)=> s)
    const [userStatus, setUserStatus] = useState<string | null>(null)
    const $MONITOR = userStatus === 'ADMIN'

    const ROOM_USER = useCallback((data: { user: RoomUser }) => setRoomUser(data.user), []);
    const ROOM_MESSAGE = useCallback((data: ChatMessage)=>{
        const { status, id, name, level } = data;
        if(status === 'ADMIN') setUserStatus('ADMIN')
        if (status === 'CREATE' || status === 'JOIN'){
            setUserStatus('CHAT'); 
            setRoomStatus($ROOM_STATUS['CHAT_3'])
        }
        setMessage({ status, id, name, level })
    }, [room])

    useEffect(()=>{
        socket.emit('ROOM', { num: room.num, room: room.room })
        socket.on('ROOM', (data)=> setRoom(data.room))
        socket.on("ROOM_USER", ROOM_USER)
        socket.on('ROOM_MESSAGE', ROOM_MESSAGE)
        socket.on('ROOM_BLOCK', ()=>{ // target_socket
            setUserStatus(null); clear();
            setRoomStatus($ROOM_STATUS['ROOM_0'])
            setPopup({ msg: '대화방에서 차단되었습니다.' });
        })
        socket.on('CHAT_MESSAGE', async (data) => {
            setMessage(data);
            if (data.name === user.name && !checkAdmin(user.level)) $CHAT_MESSAGE.line += 1;
            else $CHAT_MESSAGE.line = 1;
        })
        return ()=>{
            socket.off('ROOM_USER', ROOM_USER)
            socket.off('ROOM_MESSAGE', ROOM_MESSAGE)
        }
    }, [socket])

    const clickStatus = (userStatus: string)=>{
        if(userStatus === 'ADMIN_LEAVE'){
            socket.emit('ADMIN_LEAVE', (data: CodeData)=>{
                const $DATA = socketData(data)
                if($DATA) setUserStatus(null); clear();
            })
        }
        if(userStatus === 'LEAVE'){
            const $CONFIROM = ()=>{
                socket.emit('ROOM_LEAVE', (data: CodeData)=>{
                    const $DATA = socketData(data)
                    if($DATA) setUserStatus(null); clear();
                    setRoomStatus($ROOM_STATUS['WAIT_2'])
                })
            }
            setConfirm({ msg: '대화방을 나가시겠습니까?', confirm: $CONFIROM})
        }
        if(userStatus === 'DELETE') return socket.emit('ROOM_DELETE', { num: room.num, room: room.room })
    }
    
    if(userStatus === 'CHAT' || userStatus === 'ADMIN') return(<>
        <Room_Header monitor={$MONITOR} clickStatus={clickStatus}/>
        <Chat_View monitor={$MONITOR}/>
    </>)
    return(<>
        <Room_Header clickStatus={clickStatus}/>
        <Room_Wait/>
    </>)
}