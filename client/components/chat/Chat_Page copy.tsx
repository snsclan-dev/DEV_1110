import { useCallback, useEffect, useState } from "react"
import { $REGEX_GUIDE, chatSound, checkInput, socket, socketData, storeApp, storeChat, storeUser, useInput, useInputColor } from "modules"
import { checkAdmin } from "modules/systems"
import { Label_InputColor, Loading, Br, Title, Li, Svg, Li_Item, Label } from "components/app"
import { $CHAT_MESSAGE, Chat_Header, Chat_View } from "components/chat"
import type { ChatMessage, CodeData, RoomUser } from "types"
import { Li_Label } from "components/app/view/Tags"

export const Chat_Page = ()=>{
    const { setLoading, setPopup } = storeApp((s)=> s)
    const { user, setUser } = storeUser((s)=> s)
    const { room, setRoom, setRoomUser, setRoomStatus, setMessage, clear } = storeChat((s)=> s)
    const [input, setInput] = useInput<{ room: string, name: string, sound: boolean }>({ room: '', name: '', sound: false })
    const [userStatus, setUserStatus] = useState<string | null>(null)
    const inputColor = useInputColor({ room: input.room, name: input.name })

    const ROOM_USER = useCallback((data: { user: RoomUser }) => setRoomUser(data.user), []);
    const ROOM_MESSAGE = useCallback((data: ChatMessage)=>{
        const { status, id, name, level } = data;
        if(status === 'ADMIN') setUserStatus('ADMIN')
        if (status === 'CREATE' || status === 'JOIN'){
            setUserStatus('CHAT'); chatSound();
        }
        setMessage({ status, id, name, level })
    }, [room])

    useEffect(()=>{
        socket.on("ROOM_USER", ROOM_USER)
        socket.on('ROOM_MESSAGE', ROOM_MESSAGE)
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
    
    const clickInvite = ()=>{
        navigator.clipboard.writeText(`${socket.id}`)
        return setPopup({ msg: "대화방 코드가 복사되었습니다." });
    }
    const clickCreate = ()=>{
        socket.emit('CHAT_CREATE', { name: user.name }, (data: CodeData)=>{
            const $DATA = socketData(data)
            if($DATA){
                setRoom({ room: input.room })
                socket.emit('ROOM_USER', { room: room.room })
            }
        })
    }
    const clickJoin = ()=>{
        socket.emit('CHAT_JOIN', { room: input.room, name: user.name }, (data: CodeData)=>{
            const $DATA = socketData(data)
            if($DATA){
                setRoom({ room: input.room })
                socket.emit('ROOM_USER', { room: room.room })
            }
        })
    }

    if(userStatus === 'CHAT') return(<>
        <Chat_Header clickStatus={()=>setUserStatus('WAIT')}/>
        <Chat_View/>
    </>)
    return(<div className="max_w60 pd_6">
        <Title>대화방 만들기 (참여하기)</Title>

        <div className="max_w40 box pd_6 mg_5a">
            <Li color="blue" style="mg_b10">대화방을 만들고 상대를 초대해 보세요.</Li>
            <div className="ta_c pd_h6">
                <button className="bt_4 c_blue" onClick={clickCreate}>대화방 만들기</button>
            </div>
        </div>

        <div className="max_w40 box pd_10 mg_5a">
            <Label_InputColor label="방 이름(코드)" inputColor={inputColor.room}>{$REGEX_GUIDE.room}</Label_InputColor>
            <input className="input mg_b10" type="text" name="room" maxLength={30} placeholder="대화방 이름(코드)을 입력해 주세요" onChange={setInput} value={input.room}/>
            <div className="ta_c pd_h6">
                <button className="bt_4 c_green" onClick={clickJoin}>대화방 참여하기</button>
            </div>
        </div>

    </div>)
}