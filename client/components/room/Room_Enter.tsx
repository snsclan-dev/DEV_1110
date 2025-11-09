import Cookies from "js-cookie"
import { useEffect } from "react"
import { redirect, usePathname } from "next/navigation"
import { $REGEX_GUIDE, checkInput, socketData, storeApp, storeChat, storeUser, useInput, useInputColor } from "modules"
import { checkAdmin } from "modules/systems"
import { $LOCATION_MSG, App_Check, Label_InputColor } from "components/app"
import { $ROOM_STATUS } from "components/room";
import type { CodeData } from "types"

export const Room_Enter = ()=>{
    const path = usePathname().split('/')
    const { setLoading, setPopup } = storeApp((s)=> s)
    const { user, setUser, socket } = storeUser((s)=> s)
    const { setRoom, roomStatus, setRoomStatus } = storeChat((s)=> s)
    const [input, setInput] = useInput<{ room: string, name: string, sound: boolean }>({ room: '', name: '', sound: false })
    const inputColor = useInputColor({ room: input.room, name: input.name })

    useEffect(()=>{
        setLoading(1000)
        setInput({ 
            room: path[2] || Cookies.get('room') || '', 
            name: Cookies.get('name') || user.name || '',
            sound: Cookies.get('sound') === 'true' || false
        })
    }, [])

    const checkRoom = ()=>{
        if(!user.location) return setPopup($LOCATION_MSG);
        const $CHECK = checkInput({ room: input.room })
        if($CHECK.code !== 0) return setPopup($CHECK)
        socket.emit('CHECK_ROOM', { room: input.room }, (data: CodeData)=>{
            const $DATA = socketData(data)
            if($DATA){
                Cookies.set('room', input.room || '')
                setRoom($DATA.room)
                setRoomStatus($ROOM_STATUS['NAME_1'])
            }
        })
    }
    const clickEnter = ()=>{
        if(!user.location) return setPopup($LOCATION_MSG);
        if(!checkAdmin(user.level)){
            const $CHECK = checkInput({ name: input.name })
            if($CHECK.code !== 0) return setPopup($CHECK)
        }
        socket.emit('ROOM_ENTER', { room: input.room, id: user.id, name: input.name }, (data: CodeData)=>{
            const $DATA = socketData(data)
            if($DATA){
                Cookies.set('name', input.name || user.name || '')
                setUser({ name: input.name })
                setRoomStatus($ROOM_STATUS['WAIT_2'])
                redirect(`/room/${input.room}`)
            }
        })
    }
    const clickDelete = ()=>{
        setLoading(1000)
        Cookies.remove('room')
        Cookies.remove('name')
        setUser({ name: user.name })
        setRoom({ room: null })
        setRoomStatus($ROOM_STATUS['ROOM_0'])
        setInput({ room: '', name: '', sound: false })
    }
    
    return (<div className="layout_max">
        <App_Check/>

        <div className="max_w40 mg_5a">
            {roomStatus === $ROOM_STATUS['ROOM_0'] && <>
                <Label_InputColor label="대화방 참여 코드" inputColor={inputColor.room}>{$REGEX_GUIDE.room}</Label_InputColor>
                <input className="input mg_b20" type="text" name="room" maxLength={30} placeholder="대화방 참여 코드를 입력해 주세요" onChange={setInput} value={input.room} onKeyDown={(e)=>{ if(e.key === 'Enter') checkRoom() }}/>
            </>}
            {roomStatus === $ROOM_STATUS['NAME_1'] && <>
                <Label_InputColor label="대화명" inputColor={inputColor.name}>{$REGEX_GUIDE.name}</Label_InputColor>
                {user.id && <Label_InputColor label="회원 별명" color="c_gray">
                    <span className="c_green fwb">&nbsp;{user.name}&nbsp;</span><span className="c_blue fwb cursor" onClick={()=>setInput({ name: user.name as string })}>[ 대화명 사용 ]</span>
                </Label_InputColor>}
                <input className="input mg_b20" type="text" name="name" maxLength={12} placeholder="대화명을 입력해 주세요" onChange={setInput} value={input.name} onKeyDown={(e)=>{ if(e.key === 'Enter') clickEnter() }}/>
            </>}
        </div>

        <div className="pd_h6 ta_c">
            {roomStatus === $ROOM_STATUS['NAME_1'] && <button className="bt_4 c_gray" onClick={()=>setRoomStatus($ROOM_STATUS['ROOM_0'])}>방 수정</button>}
            <button className="bt_4 c_blue" onClick={roomStatus === $ROOM_STATUS['ROOM_0'] ? checkRoom : clickEnter}>{roomStatus === $ROOM_STATUS['ROOM_0'] ? '방 확인' : '방 입장'}</button>
            <button className="bt_4 c_red" onClick={clickDelete}>정보 삭제</button>
        </div>
    </div>);
}