import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { checkInput, storeApp, storeUser, useFetch, useInput, useInputColor } from "modules"
import { $LOCATION_MSG, Button, Label_InputColor } from "components/app"

export const App_Login = ({ onClose }: { onClose: ()=>void })=>{
    const { push } = useRouter()
    const refInput = useRef<HTMLInputElement>(null)
    const { setPopup, setConfirm } = storeApp((s)=>s)
    const { user } = storeUser((s)=>s)
    const [view, setView] = useState(false)
    
    const [input, setInput] = useInput({ id: '', pass: ''})
    const inputColor = useInputColor(input)

    useEffect(()=>{ refInput.current?.focus() }, [])

    const clickLogin = async ()=>{
        if(!user.location) return setPopup($LOCATION_MSG);
        const $CHECK = checkInput(input)
        if($CHECK.code) return setPopup($CHECK)
        const $DATA = await useFetch.post('/app/login', { input_id: input.id, input_pass: input.pass })
        if(!$DATA) return setInput({ pass: '' })
        window.location.replace('/')
    }
    const clickRegister = ()=>{
        setConfirm({ msg: '회원가입 페이지로 이동하시겠습니까?', confirm: ()=>push('/register') })
        onClose()
    }

    return(<div className="max_w40 mg_2a">
        <div className="pd_h10">
            <Label_InputColor label="아이디" inputColor={inputColor.id}>영문(소) 4자 이후, 숫자, 밑줄 (6~20)</Label_InputColor>
            <input ref={refInput} className="input mg_b10" type="text" name="id" placeholder="아이디를 입력해 주세요" onChange={setInput} value={input.id}
            onKeyDown={(e)=>{ if(e.key === 'Enter') clickLogin() }}/>

            <Label_InputColor label="비밀번호">숫자 위 특수(-_=+)문자 가능 (10~20) <span className="c_blue fwb mg_l6 cursor" onClick={()=>setView(!view)}>[표시]</span></Label_InputColor>
            <input className="input mg_b6" type={view ? "text" : "password"} name="pass" placeholder="비밀번호를 입력해 주세요" onChange={setInput} value={input.pass}
            onKeyDown={(e)=>{ if(e.key === 'Enter') clickLogin() }}/>
        </div>
        <div className="pd_h2 ta_c">
            {/* <button className="bt_main c_blue" disabled={loading} onClick={clickLogin}>로그인</button> */}
            <Button style="bt_main c_blue" onClick={clickLogin}>로그인</Button>
            <button className="bt_main c_gray mg_l6" onClick={clickRegister}>회원 가입</button>
        </div>
        </div>
    )
}