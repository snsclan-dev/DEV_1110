import { Label } from "components/app"
import { $REGEX_GUIDE, checkInput, storeApp, storeChat, storeUser, Text_Area, useFetch, useInput, useInputColor } from "modules"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const Room_Info = ({ onClose }: { onClose: ()=> void})=>{
    const { refresh } = useRouter()
    const { setPopup, setConfirm } = storeApp((s)=>s)
    const { socket } = storeUser((s)=>s)
    const { room, setRoom } = storeChat((s)=>s)
    const [input, setInput] = useInput({ title: '', note: '', room_pass: '' })
    const inputColor = useInputColor(input)

    useEffect(()=>{
        if(room.room) setInput({ title: room.title || '', note: room.note || '', room_pass: room.room_pass || '' })
    }, [])

    const clickCreate = ()=>{
        const $CHECK = checkInput(input)
        if($CHECK.code !== 0) return setPopup($CHECK)
        const $CONFIRM = async ()=>{
            const $DATA = await useFetch.post('/room/create', { input })
            // if($DATA) setTimeout(()=> replace(`/room/${$DATA.room}`), 1000) // 강제 이동 보다는 목록 업데이트로 변경
            if($DATA){
                onClose()
                refresh()
            }
        }
        setConfirm({ msg: '대화방을 만드시겠습니까?', confirm: $CONFIRM })
    }
    const clickModify = async ()=>{
        const $CHECK = checkInput(input)
        if($CHECK.code !== 0) return setPopup($CHECK)
        const $CONFIRM = async ()=>{
            const $DATA = await useFetch.post('/room/modify', { ...input, room: room.room, user_id: room.user_id })
            if($DATA){
                socket.emit('ROOM_UPDATE', { room: room.room });
                onClose()
            }
        }
        setConfirm({ msg: '대화방을 수정하시겠습니까?', confirm: $CONFIRM })
    }
    const clickDelete = ()=>{
        const $CONFIRM = async ()=>{
            const $DATA = await useFetch.post('/room/delete', { room: room.room })
            if($DATA){
                socket.emit('ROOM_DELETE', { num: room.num, room: room.room })
                onClose()
            }
        }
        setConfirm({ msg: '대화방을 삭제하시겠습니까?', confirm: $CONFIRM })
    }

    return(<div>
        <Label_InputColor label="방 제목" inputColor={inputColor.title}>{$REGEX_GUIDE.room_title}</Label_InputColor>
        <input className="input mg_b10" type="text" name="title" placeholder="방 제목을 입력해 주세요" onChange={setInput} value={input.title}/>

        <Label_InputColor label="비밀 번호" inputColor={inputColor.room_pass}>{$REGEX_GUIDE.room_pass}</Label_InputColor>
        <input className="input mg_b10" type="text" name="room_pass" maxLength={10} placeholder="방 입장 비밀번호를 입력해 주세요" onChange={setInput} value={input.room_pass} />

        <Label_InputColor label="내용(안내)" inputColor={inputColor.note}>{$REGEX_GUIDE.note}</Label_InputColor>
        <Text_Area className="scroll mg_b10" maxRows={3} name='note' maxLength={100} onChange={setInput} value={input.note}/>

        <div className="ta_c">
            {!room.room ? <button className="bt_4 c_blue" onClick={clickCreate}>방 만들기</button> :
            <>
                <button className="bt_4 c_blue" onClick={clickModify}>대화방 수정</button>
                <button className="bt_4 c_red" onClick={clickDelete}>대화방 삭제</button>
            </>}
        </div>
    </div>)
}