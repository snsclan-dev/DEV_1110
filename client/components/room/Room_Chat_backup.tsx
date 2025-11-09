import parse from 'html-react-parser';
import { ClipboardEvent, Fragment, memo, useEffect, useRef } from "react"
import { $FILE_UPLOAD, checkAdmin } from 'modules/systems';
import { storeApp, storeUser, useInput, useModal, chatMessage, chatSlider, $REGEX } from "modules"
import { Modal, Modal_Image, Modal_Video, View_Char } from 'components/app';
import { $CHAT_MESSAGE } from "components/room"
import { Chat_Paste_Image, Chat_Paste_Video, Chat_Preview_Image, Chat_Preview_Video, Chat_Upload } from "components/chat"
import type { Chat, Room, User } from "types"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CHAT_BOX = memo(({ room, obj, line, user, view, openModal }: { room: Room, obj: Chat, line: number, user: User, view: Chat[], openModal: (modal: Record<string, any>)=> void }) => { 
    const $ADMIN = checkAdmin(user.level)
    const $NAME = $ADMIN ? view[line - 1]?.name !== view[line]?.name : view[line - 1]?.name !== view[line]?.name && obj.name !== user.name
    const $USER = $ADMIN ? room.user_id === obj.id : obj.name === user.name
    if (obj.notice) return null;
    return (<div className={$USER ? "chat_box_right" : "chat_box_left"}>
        {$NAME && <p className={$USER ? 'pd_r ta_r' : 'ta_l'}>{room.user_id === obj.id && '⭐'}<span className={`${$USER ? 'c_orange' : 'c_blue'} pd_l fs_13 fwb`}>{obj.name}</span></p>}
        {obj.message && <div className={`${$USER && 'ta_r'} lh_26`}>{parse(chatMessage(obj.message))}</div>} 
        {(obj.image?.length || obj.video?.length) && (<>
            {obj.image?.map((src, i) => (<img key={i} className='chat_media' src={src} onClick={() => openModal({ image: src })} />))}
            {obj.video?.map((src, i) => (<video key={i} className='chat_media' src={src} onClick={() => openModal({ video: src })} />))}
            <p className='fs_13 c_gray fwb ta_c'>{obj.image ? '이미지' : '동영상'}</p>
        </>)}
    </div>);
}, (prev, next)=>{
    return prev.obj === next.obj && prev.line === next.line; // 불변 객체 기준 최적화
});
CHAT_BOX.displayName = "CHAT_BOX";

export const Room_Chat = ({ room, view, monitor }: { room: Room, view: Chat[], monitor: string })=>{
    const refInput = useRef<HTMLInputElement>(null)
    const refView = useRef<HTMLDivElement>(null)
    const { setPopup } = storeApp((state)=>state)
    const { user, socket } = storeUser((state)=> state)
    const [input, setInput] = useInput({ message: '' })
    const { modal, openModal, closeModal } = useModal()

    useEffect(()=>{
        const $SLIDER = chatSlider(refView.current)
        refView.current?.scroll({top: refView.current.scrollHeight, left: 0, behavior: 'smooth'});
        return ()=>{
            $SLIDER()
        }
    }, [view])

    const onPaste = (e: ClipboardEvent)=>{
        e.preventDefault();
        const html = e.clipboardData.getData("text/html");
        const text = e.clipboardData.getData("text");

        const $TEXT_IMAGE: string[] = text.match($REGEX.url_image) || []
        const $HTML_IMAGE: string[] = html.match($REGEX.url_image) || []
        const $HTML_REPLACE_IMAGE: string[] = $HTML_IMAGE.map((e)=>e.replace($REGEX.url_image, '$1'))

        const $TEXT_VIDEO: string[] = text.match($REGEX.url_video) || []
        const $HTML_VIDEO: string[] = text.match($REGEX.url_video) || []
        const $HTML_REPLACE_VIDEO: string[] = $HTML_VIDEO.map((e)=>e.replace($REGEX.url_video, '$1'))

        if(/data:|:image\/|base64/gi.test($HTML_IMAGE.join(' '))) return setPopup({msg: <><p>붙여 넣을 수 없는 이미지가 포함되었습니다.</p><p>주소(URL)로 연결된 이미지만 가능합니다.</p></>})
            // const $IMAGE: string[] = [...new Set($TEXT_IMAGE.concat($HTML_REPLACE_IMAGE))].filter(Boolean).slice(0, 3);
            // const $VIDEO: string[] = [...new Set($TEXT_VIDEO.concat($HTML_REPLACE_VIDEO))].filter(Boolean).slice(0, 3);
        const $IMAGE: string[] = [...new Set($TEXT_IMAGE.concat($HTML_REPLACE_IMAGE))].filter((e): e is string => !!e).slice(0, 3);
        const $VIDEO: string[] = [...new Set($TEXT_VIDEO.concat($HTML_REPLACE_VIDEO))].filter((e): e is string => !!e).slice(0, 3);

        if($VIDEO.length){
            if($VIDEO.length > $FILE_UPLOAD.chat) return setPopup({msg: <>
                <p>최대 <span className="c_blue fwb">{$FILE_UPLOAD.chat}개</span>의 동영상만 붙여넣기가 가능합니다.</p>
                <p>복사(포함)된 동영상 : <span className="c_red fwb">{$VIDEO.length}개</span></p>
            </>})
            return openModal({ paste_video: true, data: { video: $VIDEO } })
        }
        if($IMAGE.length){
            if($IMAGE.length > $FILE_UPLOAD.chat) return setPopup({msg: <>
                <p>최대 <span className="c_blue fwb">{$FILE_UPLOAD.chat}개</span>의 이미지만 붙여넣기가 가능합니다.</p>
                <p>복사(포함)된 이미지 : <span className="c_red fwb">{$IMAGE.length}개</span></p>
            </>})
            return openModal({ paste_image: true, data: { image: $IMAGE, text: text } })
        }
        return setInput({ message: (input.message += text) });
    }
    const clickMessage = ()=>{
        const $MESSAGE = input.message
        if (!$MESSAGE) return setPopup({ msg: "메세지(내용)을 입력해 주세요." })
        if ($CHAT_MESSAGE.last === $MESSAGE) return setPopup({ msg: "중복된 메세지입니다." })
        if ($CHAT_MESSAGE.line >= $CHAT_MESSAGE.max) return setPopup({ msg: "상대방의 메세지를 기다려주세요." })
        setInput({ message: '' })
        socket.emit('CHAT_MESSAGE', { message: $MESSAGE.substring(0, 200) })
        refInput.current?.focus()
    }
    const CHAT_NOTICE = ({ status, notice }: { status?: string; notice?: string }) => {
        if (!status) return null;
        const colorClass = status === "ADMIN" ? "chat_notice_orange" : status === "CREATE" || status === "JOIN"
            ? "chat_notice_blue" : status === "BLOCK"
            ? "chat_notice_red" : "chat_notice_gray";
        return(<div className={colorClass}>{notice}</div>);
    };
    const CHAT_MENU = ()=>{
        return(<>
            <p className="fs_13"><View_Char char='li' style="c_blue"/>이미지(동영상)의 주소(URL) 전송이 가능합니다. <span className="c_blue fwb">(복사 &gt; 붙여넣기)</span></p>
            <p className="fs_13 mg_b6"><span className="item c_blue">-</span><span className="c_blue fwb">복사</span>한 주소(URL)를 메세지 입력칸에 <span className="c_blue fwb">붙여넣기</span> 하세요.</p>
            <div className='wrap_flex_bt'>
                <button className='flex_bt c_green' onClick={()=>openModal({ link_image: true })}>이미지 주소(URL) 전송</button>
                <button className='flex_bt c_green' onClick={()=>openModal({ link_video: true })}>동영상 주소(URL) 전송</button>
                <button className='flex_bt c_blue' onClick={()=>openModal({ upload: true })}>이미지 파일 전송</button>
            </div>
        </>)
    }

    return(<div className="layout_main">
        {modal.menu && <Modal title='이미지(동영상) 전송' onClose={closeModal}><CHAT_MENU/></Modal>}
        {modal.image && <Modal_Image src={modal.image as string} onClose={closeModal}></Modal_Image>}
        {modal.video && <Modal_Video src={modal.video as string} onClose={closeModal}></Modal_Video>}
        {modal.paste_image && <Modal title='이미지 미리보기' onClose={closeModal}><Chat_Paste_Image closeModal={closeModal} setInput={setInput} data={modal.data}/></Modal>}
        {modal.paste_video && <Modal title='동영상 미리보기' onClose={closeModal}><Chat_Paste_Video closeModal={closeModal} data={modal.data}/></Modal>}
        {modal.link_image && <Modal title='이미지 전송(URL)' onClose={closeModal}><Chat_Preview_Image openModal={openModal}/></Modal>}
        {modal.link_video && <Modal title='동영상 전송(URL)' onClose={closeModal}><Chat_Preview_Video openModal={openModal}/></Modal>}
        {modal.upload && <Modal title='이미지 전송(파일)' onClose={closeModal}><Chat_Upload openModal={openModal}/></Modal>}

        <div className="layout_view">
            <div id="view" ref={refView} className="chat_view" onPaste={onPaste}>
                {view.map((e, i)=> <Fragment key={i}>
                    <CHAT_NOTICE status={e.status} notice={e.notice}/>
                    <CHAT_BOX room={room} obj={e} line={i} user={user} view={view} openModal={openModal}/>
                </Fragment>)}
            </div>
            <div id="slider" className="chat_view_slider"></div>
        </div>

        {monitor !== 'ADMIN' && <div className="wrap_input">
            <input ref={refInput} id="message" className="chat_input" type="text" name="message" maxLength={200} placeholder='메세지(내용)를 입력해 주세요 (2-100)' onChange={setInput} value={input.message}
            onPaste={onPaste} onKeyDown={(e)=>{ if(e.key === 'Enter') clickMessage()}} />
            <button className="chat_input_bt c_blue" onClick={clickMessage}>전송</button>
            <button className="chat_input_bt c_orange" onClick={()=>openModal({ menu: true })}>등록</button>
        </div>}
    </div>)
}