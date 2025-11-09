import { $REGEX_GUIDE, checkInput, socketData, storeApp, storeChat, storeUser, useInput, useInputColor } from "modules"
import { Label_InputColor, Button, Title, Label, Li_Label } from "components/app"
import { Chat_Header, Chat_View } from "components/chat"
import type { CodeData } from "types"

export const Chat_Page = ({ roomCode }: { roomCode?: string })=>{
    const { loading, setPopup } = storeApp((s)=> s)
    const { user, socket } = storeUser((s)=> s)
    const { room, setRoom, roomStatus } = storeChat((s)=> s)
    const [input, setInput] = useInput<{ room: string }>({ room: roomCode || '' })
    const inputColor = useInputColor({ room: input.room })
    
    const clickCopy = ()=>{
        navigator.clipboard.writeText(`대화방 코드 : ${socket.id}\n\n대화방 초대 링크(주소)\n${process.env.NEXT_PUBLIC_APP_URL}/chat/${socket.id}`)
        return setPopup({ msg: "대화방 초대 링크(주소)가 복사되었습니다." });
    }
    const clickCreate = ()=>{
        socket.emit('ROOM_CREATE', { name: user.name }, (data: CodeData)=>{
            const $DATA = socketData(data)
            if($DATA){
                setRoom({ room: socket.id || '' })
                socket.emit('ROOM_USER')
            }
        })
    }
    const clickJoin = ()=>{
        const $CHECK = checkInput({ room: input.room })
        if($CHECK.code !== 0) return setPopup($CHECK)
        socket.emit('ROOM_JOIN', { room: input.room, name: user.name }, (data: CodeData)=>{
            const $DATA = socketData(data)
            if($DATA){
                setRoom({ room: input.room })
                socket.emit('ROOM_USER', { room: room.room })
            }
        })
    }

    if(roomStatus === 'CHAT') return(<>
        {/* <Chat_Header clickStatus={()=>setRoomStatus('WAIT')}/> */}
        <Chat_Header/>
        <Chat_View/>
    </>)
    return(<div className="max_w60 pd_6">
        <Title>대화방 만들기 (참여하기)</Title>

        <div className="max_w40 box pd_10 mg_5a">
            <Li_Label label="1" color="blue">대화방 초대 링크(주소)를 복사하세요.</Li_Label>
            <Li_Label label="2" color="blue" style="mg_b6">대화방을 만들고 상대를 초대해 보세요.</Li_Label>
            <div className="input mg_b10" onClick={clickCopy}><Label label="방 이름(코드)"><span className="c_green fwb">{socket.id}</span></Label></div>
            
            <div className="ta_c pd_h6">
                <button className="bt_4 c_green" onClick={clickCopy}>초대 링크(주소) 복사</button>
                {/* <button className="bt_4 c_blue" onClick={clickCreate}>대화방 만들기</button> */}
                <Button style="bt_4 c_blue" onClick={clickCreate}>대화방 만들기</Button>
            </div>
        </div>

        <div className="max_w40 box pd_10 mg_5a">
            <Label_InputColor label="대화방 참여(코드)" inputColor={inputColor.room}>{$REGEX_GUIDE.room}</Label_InputColor>
            <input className="input mg_b10" type="text" name="room" maxLength={30} placeholder="대화방 이름(코드)을 입력해 주세요" onChange={setInput} value={input.room}/>
            <div className="ta_c pd_h6">
                <Button style="bt_4 c_green" onClick={clickJoin}>테스트</Button>
                <button className="bt_4 c_green" onClick={clickJoin} disabled={loading}>대화방 참여하기</button>
            </div>
        </div>

    </div>)
}