import { useEffect } from "react";
import { storeApp, storeUser, getWatermark, useModal } from "modules";
import { Popup, Confirm, Loading } from "components/app";
import type { User } from "types";

export const Header_App = ({ user }: { user: User })=>{
    const { loading, popup, setPopup, confirm, setConfirm } = storeApp((s)=>s)
    const { getSocket, initUser } = storeUser((s)=>s)
    const [closeModal] = useModal()
    
    useEffect(()=>{
        initUser(user)
        getSocket()
        const onEsc = (e: KeyboardEvent)=>{
            if(e.key === 'Escape'){
                setPopup(null)
                closeModal()
            }
        }
        addEventListener('keydown', onEsc)
        const mark = getWatermark(user)
        return ()=> {
            removeEventListener('keydown', onEsc)
            if(mark) mark()
        }
    }, [])

    return(<>
        {loading && <Loading/>}
        {popup && <Popup code={popup.code} msg={popup.msg ?? ''} note={popup.note} onClose={()=>setPopup(null)}/>}
        {confirm && <Confirm msg={confirm.msg} note={confirm.note} confirm={confirm.confirm} onClose={()=>setConfirm(null)}/>}
    </>)
}
export const Header_Socket = ()=>{
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