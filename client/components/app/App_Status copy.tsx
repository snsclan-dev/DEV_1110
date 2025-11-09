import Cookies from "js-cookie"
import { useEffect } from "react"
import { $REGEX_GUIDE, checkInput, socket, socketData, storeApp, storeChat, storeUser, useFetch, useInput, useInputColor } from "modules"
import { checkAdmin } from "modules/systems"
import { $APP_STATUS, $LOCATION_MSG, App_Check, Button, Label_InputColor } from "components/app"
import type { CodeData } from "types"

export const App_Status = ()=>{
    const { status, setStatus, setLoading, setPopup } = storeApp((s)=> s)
    const { user, setUser } = storeUser((s)=> s)
    const { chat, setChat } = storeChat((s)=>s)
    const [input, setInput] = useInput<{ name: string, room_code: string }>({ name: '', room_code: '' })
    const inputColor = useInputColor({ name: input.name })

    useEffect(()=>{
        setInput({ name: Cookies.get('name') || user.name || '' })
    }, [])

    const clickCheckName = ()=>{
        if(!user.location) return setPopup($LOCATION_MSG);
        if(!checkAdmin(user.level)){
            const $CHECK = checkInput({ name: input.name })
            if($CHECK.code !== 0) return setPopup($CHECK)
        }
        socket.emit('USER_NAME', { name: input.name }, (data: CodeData)=>{
            const $DATA = socketData(data)
            if($DATA){
                Cookies.set('name', input.name)
                setChat({ name: input.name })
                setUser({ name: input.name })
                setStatus($APP_STATUS['1_ROOM'])
            }
        })
    }
    const clickCheckRoom = async ()=>{
        if(!user.location) return setPopup($LOCATION_MSG);
        const $CHECK = checkInput({ room_code: input.room_code })
        if($CHECK.code !== 0) return setPopup($CHECK)
        const $DATA = await useFetch.get(`/room/check/${input.room_code}`)
        if($DATA){
            Cookies.set('room', input.room_code || '')
            setStatus($APP_STATUS['2_WAIT'])
        }
    }
    const clickDelete = ()=>{
        setLoading(1000)
        setChat({ name: '' })
        setInput({ name: '' })
        setStatus($APP_STATUS['0_NAME'])
        Cookies.remove('name')
        setPopup({ msg: '대화명 자동 입력이 삭제되었습니다.' })
    }
    
    return (<div className="layout_max">
        <App_Check/>

        <div className="max_w40 mg_5a">
            {status === $APP_STATUS['0_NAME'] && <>
                <Label_InputColor label="대화명" inputColor={inputColor.name}>{$REGEX_GUIDE.name}</Label_InputColor>
                {user.id && <Label_InputColor label="회원 별명" color="c_gray">
                    <span className="c_green fwb">&nbsp;{user.name}&nbsp;</span><span className="c_blue fwb cursor" onClick={()=>setInput({ name: user.name as string })}>[ 대화명 사용 ]</span>
                </Label_InputColor>}
                <input className="input mg_b20" type="text" name="name" maxLength={12} placeholder="대화명을 입력해 주세요" onChange={setInput} value={input.name} onKeyDown={(e)=>{ if(e.key === 'Enter') clickCheckName() }}/>
            </>}
            {status === $APP_STATUS['1_ROOM'] && <>
                <Label_InputColor label="방 이름(코드)" inputColor={inputColor.room_code}>{$REGEX_GUIDE.room_code}</Label_InputColor>
                <input className="input mg_b20" type="text" name="room_code" maxLength={30} placeholder="방 이름(코드)을 입력해 주세요" onChange={setInput} value={input.room_code} onKeyDown={(e)=>{ if(e.key === 'Enter') clickCheckRoom() }}/>
            </>}
        </div>
        
        <div className="pd_h6 ta_c">
            {status === $APP_STATUS['0_NAME'] && <Button style="bt_main c_blue" onClick={clickCheckName}>대화명 입력 (다음)</Button>}
            {status === $APP_STATUS['1_ROOM'] && <Button style="bt_main c_blue" onClick={clickCheckRoom}>방 이름(코드) 입력</Button>}
            <Button style="bt_main c_red" onClick={clickDelete}>정보 삭제</Button>
        </div>
    </div>);
}