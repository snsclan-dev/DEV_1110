import { useCallback, useEffect } from "react";
import { setSound, storeApp, storeChat, storeUser, getWatermark } from "modules";
import { checkAdmin } from "modules/systems";
import { $APP_STATUS, Popup, Confirm, Loading } from "components/app";
import { $CHAT_MESSAGE } from "components/chat";
import { socket, socketConn } from "modules/sockets";
import type { ChatMessage, User } from "types";

export const Header_App = ({ user }: { user: User })=>{
    const { loading, popup, setPopup, confirm, setConfirm } = storeApp((s)=>s)
    const { initUser } = storeUser((s)=>s)
    
    useEffect(()=>{
        initUser(user)
        socketConn(user, setPopup)
        const mark = getWatermark(user)
        return ()=> {
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
    const { setStatus, setPopup } = storeApp((s)=>s)
    const { user } = storeUser((s)=> s)
    const { setRoomUser, setMessage, clear } = storeChat((s)=> s)
    
    const ROOM_USER = useCallback((data: { user: User[] }) => setRoomUser(data.user), []);
    const ROOM_MESSAGE = useCallback((data: ChatMessage)=>{
        const { status, id, name, level } = data;
        if(status === 'ADMIN') setStatus($APP_STATUS['9_ADMIN'])
        if (status === 'CREATE' || status === 'JOIN'){
            setStatus($APP_STATUS['3_CHAT']); setSound('join');
        }
        if(status === 'END' || status === 'BLOCK'){
            setStatus($APP_STATUS['2_WAIT']); clear();
            setPopup({ msg: status === 'END' ? '대화방이 종료되었습니다.' : '대화방에서 차단되었습니다.' });
        }
        setMessage({ status, id, name, level })
    }, [])
    
    useEffect(()=>{
        socket.on('ALERT', (data)=> setPopup(data))
        // socket.on('USER_NOTICE', (data)=>{}) ///
        // socket.on('MENU_NOTICE', (data)=>{ // 메뉴 알림
        //     if(menu.tab !== 'CHAT'){
        //         setMenu(data); setSound('message');
        //     }
        // })
        socket.on("ROOM_USER", ROOM_USER)
        socket.on('ROOM_MESSAGE', ROOM_MESSAGE)
        socket.on('CHAT_MESSAGE', async (data) => {
            const { name } = storeChat.getState().chat;
            const { user } = storeUser.getState()
            setMessage(data);
            if (data.name === name && !checkAdmin(user.level)){
                $CHAT_MESSAGE.last = data.message;
                $CHAT_MESSAGE.line += 1;
            }
            else $CHAT_MESSAGE.line = 1;
        })
        return ()=>{
            socket.off()
        }
    }, [])

    return null;
}