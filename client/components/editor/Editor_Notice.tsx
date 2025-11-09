import { useState } from "react";
import { $REGEX_GUIDE, checkInput, Pagination, storeApp, storeUser, useFetch, useInput, useInputColor, useListPage, useModal } from "modules"
import { Hr, Label_Output, Label_InputColor, Message, Modal, Title } from "components/app";
import { Board_Info } from "components/board";
import { Editor, Editor_View, checkEditor } from "components/editor";
import type { BoardData, BoardParams } from "types/app";
import { Board_State } from "components/board/Boards";

export const Editor_Notice = ({ params }: { params: BoardParams })=>{
    const { setPopup, setConfirm } = storeApp((s)=> s)
    const { user } = storeUser((s)=> s)
    const { list, setPage, paging, refresh } = useListPage({ url: '/notice/list', ...params })
    const [write, setWrite] = useState(false)
    const { modal, openModal, closeModal } = useModal()
    const [input, setInput] = useInput({ board_title: '', image: '' })
    const inputColor = useInputColor(input)

    console.log(params);

    const noticeState = (updated: string)=>{ ///
        return updated ? 'box_lgray' : 'box_red'
    }

    const clickWrite = async ()=>{
        const $CHECK = checkInput(input)
        if($CHECK.code !== 0) return setPopup($CHECK)
        const $EDITOR = checkEditor({ editorType: 'BOARD' })
        if($EDITOR.code !== 0) return setPopup($EDITOR)
        const $CONFIRM = async ()=>{
            const $DATA = await useFetch.post('/notice/write', { ...params, ...input, editor: $EDITOR.data })
            if($DATA){
                closeModal(); refresh();
            }
        }
        setConfirm({msg: '글을 등록하시겠습니까?', confirm: $CONFIRM})
    }
    const clickModify = async (obj: BoardData)=>{
        const $CHECK = checkInput(input)
        if($CHECK.code !== 0) return setPopup($CHECK)
        const $EDITOR = checkEditor({ editorType: 'BOARD' })
        if($EDITOR.code !== 0) return setPopup($EDITOR)
        const $CONFIRM = async ()=>{
            const $DATA = await useFetch.post('/notice/modify', { num: obj.num, ...input, editor: $EDITOR.data, refEditor: obj.note })
            if($DATA){
                closeModal(); refresh();
            }
        }
        setConfirm({msg: '글을 수정하시겠습니까?', confirm: $CONFIRM})
    }
    const Modal_Menu = ({ obj }: { obj: BoardData })=>{
        return(<>
            <Board_State type="modal" state={obj.state}/>
            <Label_Output label="제목" style="mg_b10">{obj.title}</Label_Output>
            <div className="pd_h2 ta_c">
                <button className="bt_main c_gray">숨김</button>
                <button className="bt_main c_modify" onClick={()=>{ openModal({ modify: obj.num, menu: false }); setInput({ board_title: obj.title || '', image: obj.image }) }}>수정</button>
                <button className="bt_main c_red">삭제</button>
            </div>
        </>)
    }
    
    if(write) return(<>
        <Title title="글쓰기"/>
        <Label_InputColor label="글 제목" inputColor={inputColor.board_title}>{$REGEX_GUIDE.board_title}</Label_InputColor>
        <input className="input mg_b10" type="text" name="board_title" placeholder="제목을 입력해 주세요" onChange={setInput} value={input.board_title}/>
        <div className="mg_b10"><Editor upload={5}/></div>
        <div className="pd_h4 ta_c">
            <button className="bt_main c_red" onClick={()=>setWrite(false)}>글쓰기 취소</button>
            <button className="bt_main c_blue" onClick={clickWrite}>글쓰기 완료</button>
        </div>
    </>)
    return(<div>
        <Title title="공지 및 안내사항"><button className="bt_34 c_orange fwb" onClick={()=>{ setWrite(true); setInput({board_title: ''}); }}>공지 글쓰기</button></Title>

        {list.length ? list.map((e)=> <div key={e.num} className="mg_b20">
            {modal.menu === e.num && <Modal onClose={closeModal}><Modal_Menu obj={e}/></Modal>}
            {modal.modify === e.num ? <div className="box_blue pd_10">
                <Label_InputColor label="글 제목" inputColor={inputColor.board_title}>{$REGEX_GUIDE.board_title}</Label_InputColor>
                <input className="input mg_b10" type="text" name="board_title" placeholder="제목을 입력해 주세요" onChange={setInput} value={input.board_title}/>
                <div className="mg_b10"><Editor upload={5} value={e.note}/></div>
                <div className="pd_h2 ta_c">
                    <button className="bt_main c_red" onClick={closeModal}>수정 취소</button>
                    <button className="bt_main c_blue" onClick={()=>clickModify(e)}>수정 완료</button>
                </div>
            </div> : <div className={`${noticeState(e.updated)} pd_10`}>
                <Board_Info obj={e} user={user} onClick={()=>openModal({ menu: e.num })}/>
                <Hr h={2}/>
                <div className="min_h10 pd_4"><Editor_View value={e.note}/></div>
            </div>}

        </div>) : <Message><span className="c_gray">작성된 공지 및 안내사항이 없습니다.</span></Message>}

        <Pagination paging={paging} setPage={setPage}/>
    </div>)
}