import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { $REGEX_GUIDE, checkInput, useInput, storeApp, useInputColor, useFetch } from "modules"
import { Label_InputColor, Title } from "components/app"

export const App_Register = ()=>{
    const { loading, setConfirm, setPopup } = storeApp((state)=>state)
    const { push } = useRouter()
    const [input, setInput] = useInput({id: '', email: '', name: '', pass_code: '', pass: '', pass_check: ''})
    const [view, setView] = useState(false)
    const inputColor = useInputColor(input)

    const clickRegister = async ()=>{
        const $INPUT = { ...input, pass_confirm: input.pass === input.pass_check }
        const $CHECK = checkInput($INPUT)
        if($CHECK.code !== 0) return setPopup($CHECK)
        const $CONFIRM = async ()=>{
            const $DATA = await useFetch.post('/app/register', input)
            if($DATA) return push('/login')
        }
        setConfirm({ msg: '규칙을 위반할 경우 발생하는 모든 책임은 본인에게 있습니다.\n동의하시겠습니까?', confirm: $CONFIRM })
    }

    return(<div className="max_w40">
        <Title title="회원가입 (신청)"/>
        
        <div className="box pd_10 mg_b10">
            <p className="lh_26"><span className="li c_blue">&bull;</span>규칙을 위반할 경우, 발생하는 모든 책임은 본인에게 있습니다.</p>
            <p className="lh_26"><span className="li c_blue">&bull;</span>이메일 인증 후 로그인이 가능합니다.</p>
        </div>

        <Label_InputColor label="아이디" inputColor={inputColor.id}>{$REGEX_GUIDE.id}</Label_InputColor>
        <input className="input mg_b10" type="text" name="id" placeholder="아이디를 입력해 주세요" onChange={setInput} value={input.id}/>

        <Label_InputColor label="이메일" inputColor={inputColor.email}>{$REGEX_GUIDE.email}</Label_InputColor>
        <input className="input mg_b10" type="text" name="email" placeholder="이메일을 입력해 주세요" onChange={setInput} value={input.email}/>

        <Label_InputColor label="별명(대화명)" inputColor={inputColor.name}>{$REGEX_GUIDE.name}</Label_InputColor>
        <input className="input mg_b10" type="text" name="name" placeholder="별명(대화명)을 입력해 주세요" onChange={setInput} value={input.name}/>

        <Label_InputColor label="본인 확인(인증) 번호" inputColor={inputColor.pass_code}>{$REGEX_GUIDE.pass_code} <span className="c_blue fwb cursor" onClick={()=>setView(!view)}>[ 표시 ]</span></Label_InputColor>
        <input className="input mg_b10" type={view ? "number" : "password"} name="pass_code" placeholder="본인 확인(인증) 번호를 입력해 주세요" onChange={setInput} value={input.pass_code}/>
    
        <Label_InputColor label="비밀번호" inputColor={inputColor.pass}>{$REGEX_GUIDE.pass} <span className="c_blue fwb cursor" onClick={()=>setView(!view)}>[ 표시 ]</span></Label_InputColor>
        <input className="input mg_b10" type={view ? "text" : "password"} name="pass" placeholder="비밀번호를 입력해 주세요" onChange={setInput} value={input.pass}/>
    
        <Label_InputColor label="비밀번호 확인" inputColor={input.pass === input.pass_check ? 'c_green' : 'c_red'}>비밀번호를 입력해 주세요. <span className="c_blue fwb cursor" onClick={()=>setView(!view)}>[ 표시 ]</span></Label_InputColor>
        <input className="input mg_b10" type={view ? "text" : "password"} name="pass_check" placeholder="비밀번호를 입력해 주세요 (확인)" onChange={setInput} value={input.pass_check}/>

        <div className="pd_h6 ta_c">
            <button className="bt_40 c_blue" disabled={loading} onClick={clickRegister}>가입 신청</button>
            <Link href="/login"><button className="bt_40 c_gray mg_l10" disabled={loading}>로그인</button></Link>
        </div>
    </div>)
}