import { Editor } from "@tiptap/react";
import { useEffect, useRef } from "react"
import { storeApp, useInput } from "modules"

export const Tiptap_Link = ({ editor, onClose }: { editor: Editor, onClose: ()=> void })=>{
    const { setPopup } = storeApp((state)=> state)
    const [input, setInput] = useInput({ link: editor.getAttributes('link').href || '' })
    const ref = useRef<HTMLInputElement>(null)

    useEffect(()=>{ ref.current?.focus() }, [])

    const clickLink = ()=>{
        const $URL = input.link
        if(!$URL){
            onClose()
            return editor.chain().focus().extendMarkRange('link').unsetLink().run()
        }
        if(!/^https:\/\//.test($URL)) return setPopup({ msg: 'https:// 로 시작해야 합니다.' })
        editor.chain().focus().extendMarkRange('link').setLink({ href: $URL }).run()
        onClose()
    }

    return(<>
        <p className="fs_13"><span className="li c_blue">&bull;</span>주소(URL)를 입력해주세요.</p>
        <input ref={ref} className='input' type="text" name='link' onChange={setInput} value={input.link} />
        <div className='ta_c mg_t6'>
            <button className="bt_3m c_blue" onClick={clickLink}>주소 입력</button>
        </div>
    </>)
}