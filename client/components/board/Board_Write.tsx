import { Label_InputColor } from "components/app"
import { checkEditor, Editor } from "components/editor"
import { $REGEX_GUIDE, checkInput, storeApp, storeUser, useFetch, useInput, useInputColor } from "modules"

export const Board_Write = ()=>{
    const { setPopup, setConfirm } = storeApp((s)=> s)
    const { user } = storeUser((s)=> s)
    const [input, setInput] = useInput({ board_title: '', image: '' })
    const inputColor = useInputColor(input)

    const clickWrite = async ()=>{
        const $CHECK = checkInput(input)
        if($CHECK.code !== 0) return setPopup($CHECK)
        const $EDITOR = checkEditor({ editorType: 'BOARD' })
        if($EDITOR.code !== 0) return setPopup($EDITOR)
        const $CONFIRM = async ()=>{
            const $DATA = await useFetch.post('/board/write', { ...input, editor: $EDITOR.data })
            if($DATA){
                // closeModal(); refresh();
            }
        }
        setConfirm({msg: '글을 등록하시겠습니까?', confirm: $CONFIRM})
    }
    
    return(<div>
        <Label_InputColor label="글 제목" inputColor={inputColor.board_title}>{$REGEX_GUIDE.board_title}</Label_InputColor>
        <input className="input mg_b10" type="text" name="board_title" placeholder="제목을 입력해 주세요" onChange={setInput} value={input.board_title}/>
        <div className="mg_b10"><Editor upload={5}/></div>
        <div className="pd_h2 ta_c">
            {/* <button className="bt_main c_red" onClick={closeModal}>취소 (뒤로가기)</button> */}
            <button className="bt_main c_blue" onClick={clickWrite}>글 등록</button>
        </div>
    </div>)
}