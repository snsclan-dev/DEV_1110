import { $REGEX_GUIDE, checkInput, socket, socketData, storeApp, storeChat, storeUser, useInput, useInputColor } from "modules"
import { Label_InputColor, Button, Title, Label, Li_Label, Li, $APP_STATUS, Label_Output } from "components/app"
import { Chat_Header, Chat_View } from "components/chat"
import type { CodeData } from "types"

export const Chat_Page = ({ roomCode }: { roomCode?: string })=>{
    const { setPopup } = storeApp((s)=> s)
    const { user } = storeUser((s)=> s)
    const { chat, setChat, room, setRoom } = storeChat((s)=> s)
    const [input, setInput] = useInput<{ room: string, name: string }>({ room: roomCode || '', name: chat.name || '' })
    const inputColor = useInputColor({ room: input.room, name: input.name })
    

    const clickCopy = ()=>{
        navigator.clipboard.writeText(`대화방 코드 : ${socket.id}\n\n대화방 링크\n${process.env.NEXT_PUBLIC_APP_URL}/chat/${socket.id}`)
        return setPopup({ msg: "대화방 코드(링크)가 복사되었습니다." });
    }
    const clickCreate = ()=>{
        if(!input.name) return setPopup({ msg: '' })
        socket.emit('ROOM_CREATE', { name: chat.name }, (data: CodeData)=>{
            const $DATA = socketData(data)
            if($DATA){
                setRoom({ room: socket.id || '' })
                socket.emit('ROOM_USER')
            }
        })
    }
    const clickJoin = ()=>{
        const $INPUT = input.room.trim();
        const $CHECK = checkInput({ room: $INPUT })
        if($CHECK.code !== 0) return setPopup($CHECK)
        socket.emit('ROOM_JOIN', { room: $INPUT, name: chat.name }, (data: CodeData)=>{
            const $DATA = socketData(data)
            if($DATA){
                setRoom({ room: $INPUT })
                socket.emit('ROOM_USER', { room: room.room })
            }
        })
    }

    if(chat.status === $APP_STATUS['3_CHAT']) return(<>
        <Chat_Header/>
        <Chat_View/>
    </>)
    return(<div className="layout_max">
        <Title title="대화방 만들기 (참여하기)"/>

        <div className="max_w40 box pd_10 mg_20a">
            <Label_Output label="내 대화명"><span className="c_blue fwb">{chat.name}</span></Label_Output>

            <div className="ta_c pd_h4">
                <Button style="bt_main c_green" onClick={()=>setChat({ status: 0 })}>대화명 변경하기</Button>
            </div>
        </div>
        
        <div className="max_w40 box pd_10 mg_20a">
            <div className="cursor" onClick={clickCopy}>
                <Li_Label label="1" color="blue">내 대화방 코드를 <span className="c_blue fwb">클릭</span>하시면 초대 링크가 복사됩니다.</Li_Label>
                <Label_Output label="내 대화방 코드"><span className="c_green fwb">{socket.id}</span></Label_Output>
            </div>

            <Li_Label label="2" color="blue">대화방을 만든 후, 초대하세요.</Li_Label>
            <div className="ta_c pd_h4">
                <Button style="bt_main c_blue" onClick={clickCreate}>대화방 만들기</Button>
            </div>
        </div>
        
        <div className="max_w40 box pd_10 mg_20a">
            <Li color="blue" style="mg_b6">초대(공유)받은 대화방에 참여하세요.</Li>
            <Label_InputColor label="대화방 코드" inputColor={inputColor.room}>{$REGEX_GUIDE.chat_code}</Label_InputColor>
            <input className="input mg_b8" type="text" name="room" maxLength={30} placeholder="대화방 참여 코드를 입력해 주세요" onChange={setInput} value={input.room}/>
            <div className="ta_c pd_h4">
                <Button style="bt_main c_blue" onClick={clickJoin}>대화방 참여하기</Button>
            </div>
        </div>
    </div>)
}