import parse from 'html-react-parser';
import { ClipboardEvent, Fragment, memo, useEffect, useRef } from "react"
import { $FILE_UPLOAD } from 'modules/systems';
import { storeApp, storeUser, useInput, useModal, $REGEX, storeChat } from "modules"
import { Modal, Modal_Image, Modal_Video, View_Char } from 'components/app';
import { $CHAT_MESSAGE, Chat_Paste_Media, Chat_Preview_Media, Chat_Upload, chatMessage, chatSlider } from "components/chat"
import type { RoomMessage, ChatMessage, RoomData, User } from "types"

const CHAT_BOX = memo(({ monitor, room, obj, line, user, message, openModal }: 
    { monitor?: boolean, room: RoomData, obj: ChatMessage, line: number, user: User, message: ChatMessage[], openModal: (modal: Record<string, any>)=> void }) => {
    if (obj.status) return null;
    const prevName = message[line - 1].status || message[line - 1]?.name;
    const currName = message[line]?.name;
    const $NAME = monitor ? prevName !== currName : prevName !== currName && obj.name !== user.name
    const $USER = monitor ? room.user_id === obj.id : obj.name === user.name
    const $IMAGE = Array.isArray(obj.image) && obj.image.length > 0;
    const $VIDEO = Array.isArray(obj.video) && obj.video.length > 0;

    return (<div className={$USER ? "chat_box_right" : "chat_box_left"}>
        {$NAME && <p className={$USER ? 'pd_r ta_r' : 'ta_l'}>{room.user_id === obj.id && '⭐ '}<span className={`${$USER ? 'c_orange' : 'c_blue'} pd_l fs_13 fwb`}>{obj.name}</span></p>}
        {obj.message && <div className={`${$USER && 'ta_r'} lh_26`}>{parse(chatMessage(obj.message))}</div>}
        {($IMAGE || $VIDEO) && (<>
            {obj.image?.map((src, i) => (<img key={i} className='chat_media' src={src} onClick={() => openModal({ image: src })} />))}
            {obj.video?.map((src, i) => (<video key={i} className='chat_media' src={src} onClick={() => openModal({ video: src })} />))}
            <p className='fs_13 c_gray fwb ta_c'>{obj.image ? '이미지' : '동영상'}</p>
        </>)}
    </div>);
}, (prev, next)=>{
    return prev.obj === next.obj && prev.line === next.line; // 불변 객체 기준 최적화
});
CHAT_BOX.displayName = "CHAT_BOX";

export const Room_Chat = ({ monitor = false }: { monitor?: boolean })=>{
    const refInput = useRef<HTMLInputElement>(null)
    const refView = useRef<HTMLDivElement>(null)
    const { setPopup } = storeApp((s)=>s)
    const { user } = storeUser((s)=> s)
    const { room, message } = storeChat((s)=> s)
    const [input, setInput] = useInput({ message: '' })
    const { modal, openModal, closeModal } = useModal()
    
    useEffect(()=>{
        const $SLIDER = chatSlider(refView.current)
        refView.current?.scroll({top: refView.current.scrollHeight, left: 0, behavior: 'smooth'});
        return ()=>{
            $SLIDER()
        }
    }, [message])

    const onPaste = (e: ClipboardEvent)=>{
        e.preventDefault();
        const html = e.clipboardData.getData("text/html");
        const text = e.clipboardData.getData("text");
        const target = e.target as HTMLInputElement | null;

        if (!target || typeof target.value !== 'string') return;
        const start = target.selectionStart ?? 0;
        const end = target.selectionEnd ?? 0;
        const value = target.value.slice(0, start) + text + target.value.slice(end);

        const $TEXT_IMAGE: string[] = text.match($REGEX.url_image) || []
        const $HTML_IMAGE: string[] = html.match($REGEX.url_image) || []
        const $HTML_REPLACE_IMAGE: string[] = $HTML_IMAGE.map((e)=>e.replace($REGEX.url_image, '$1'))

        const $TEXT_VIDEO: string[] = text.match($REGEX.url_video) || []
        const $HTML_VIDEO: string[] = text.match($REGEX.url_video) || []
        const $HTML_REPLACE_VIDEO: string[] = $HTML_VIDEO.map((e)=>e.replace($REGEX.url_video, '$1'))

        if(/data:|:image\/|base64/gi.test($HTML_IMAGE.join(' '))) return setPopup({msg: <><p>붙여 넣을 수 없는 이미지가 포함되었습니다.</p><p>주소(URL)로 연결된 이미지만 가능합니다.</p></>})
        const $IMAGE: string[] = [...new Set($TEXT_IMAGE.concat($HTML_REPLACE_IMAGE))].filter((e): e is string => !!e).slice(0, 3);
        const $VIDEO: string[] = [...new Set($TEXT_VIDEO.concat($HTML_REPLACE_VIDEO))].filter((e): e is string => !!e).slice(0, 3);
        
        if($IMAGE.length){
            if($IMAGE.length > $FILE_UPLOAD.chat) return setPopup({msg: <>
                <p>최대 <span className="c_blue fwb">{$FILE_UPLOAD.chat}개</span>의 이미지만 붙여넣기가 가능합니다.</p>
                <p>복사(포함)된 이미지 : <span className="c_red fwb">{$IMAGE.length}개</span></p>
            </>})
            return openModal({ paste_image: true, data: { image: $IMAGE, text: value } })
        }
        if($VIDEO.length){
            if($VIDEO.length > $FILE_UPLOAD.chat) return setPopup({msg: <>
                <p>최대 <span className="c_blue fwb">{$FILE_UPLOAD.chat}개</span>의 동영상만 붙여넣기가 가능합니다.</p>
                <p>복사(포함)된 동영상 : <span className="c_red fwb">{$VIDEO.length}개</span></p>
            </>})
            return openModal({ paste_video: true, data: { video: $VIDEO, text: value  } })
        }
        setInput({ message: value });
        requestAnimationFrame(()=>{ target.selectionStart = target.selectionEnd = start + text.length })
    }
    const clickMessage = ()=>{
        const $MESSAGE = input.message?.trim()
        if (!$MESSAGE) return setPopup({ msg: "메세지(내용)를 입력해 주세요." })
        if ($CHAT_MESSAGE.last === $MESSAGE) return setPopup({ msg: "중복된 메세지입니다." })
        if ($CHAT_MESSAGE.line >= $CHAT_MESSAGE.max) return setPopup({ msg: "상대방의 메세지를 기다려주세요." })
        setInput({ message: '' })
        socket.emit('CHAT_MESSAGE', { message: $MESSAGE.substring(0, 200) })
        refInput.current?.focus()
    }
    const CHAT_NOTICE = ({ status, id, name }: { status?: RoomMessage, id?: string, name?: string }) => {
        if(!status) return null;
        const $STATUS: Record<RoomMessage, { color: string, text: string }> = {
            ADMIN: { color: 'chat_notice_orange', text: '모니터링을 시작합니다.' },
            CREATE: { color: 'chat_notice_blue', text: '방을 만들었습니다.' },
            JOIN: { color: 'chat_notice_blue', text: `[ ${name} ]님이 입장하였습니다.` },
            LEAVE: { color: 'chat_notice_gray', text: `[ ${name} ]님이 떠났습니다.` },
            BLOCK: { color: 'chat_notice_red', text: `[ ${name} ]님을 차단하였습니다. (내보내기)` },
            DELETE: { color: 'chat_notice_red', text: `방이 삭제되었습니다.` },
        }
        const $NOTICE = $STATUS[status];
        return(<div className={$NOTICE.color}>{room.user_id === id && '⭐ '}{$NOTICE.text}</div>);
    };
    const CHAT_MENU = ()=>{
        return(<>
            <p className="fs_13"><View_Char char='li' style="c_blue"/>이미지(동영상)의 주소(URL) 전송이 가능합니다. <span className="c_blue fwb">(복사 &gt; 붙여넣기)</span></p>
            <p className="fs_13 mg_b6"><span className="li c_blue">-</span><span className="c_blue fwb">복사</span>한 주소(URL)를 메세지 입력칸에 <span className="c_blue fwb">붙여넣기</span> 하세요.</p>
            <div className='wrap_flex_bt'>
                <button className='flex_bt c_green' onClick={()=>openModal({ wrap_preview: true })}>이미지 주소(URL) 전송</button>
                <button className='flex_bt c_green' onClick={()=>openModal({ preview_video: true })}>동영상 주소(URL) 전송</button>
                <button className='flex_bt c_blue' onClick={()=>openModal({ upload: true })}>이미지 파일 전송</button>
            </div>
        </>)
    }

    return(<div className="layout_max">
        {modal.menu && <Modal title='이미지(동영상) 전송' onClose={closeModal}><CHAT_MENU/></Modal>}
        {modal.image && <Modal_Image src={modal.image} onClose={closeModal}></Modal_Image>}
        {modal.video && <Modal_Video src={modal.video} onClose={closeModal}></Modal_Video>}
        {(modal.paste_image || modal.paste_video) && <Modal title={modal.paste_image ? '이미지 미리보기' : '동영상 미리보기'} onClose={closeModal}>
            <Chat_Paste_Media closeModal={closeModal} setInput={setInput} data={modal.data}/>
        </Modal>}
        {(modal.wrap_preview || modal.preview_video) && <Modal title={modal.wrap_preview ? '이미지 전송(URL)' : '동영상 전송(URL)'} onClose={closeModal}>
            <Chat_Preview_Media mediaType={modal.wrap_preview ? 'image' : 'video'} openModal={openModal}/>
        </Modal>}
        {modal.upload && <Modal title='이미지 전송(파일)' onClose={closeModal}><Chat_Upload openModal={openModal} onClose={closeModal}/></Modal>}

        <div className="layout_view">
            <div id="view" ref={refView} className="chat_view" onPaste={onPaste}>
                {message.map((e, i)=> <Fragment key={i}>
                    <CHAT_NOTICE status={e.status} id={e.id} name={e.name}/>
                    <CHAT_BOX monitor={monitor} room={room} obj={e} line={i} user={user} message={message} openModal={openModal}/>
                </Fragment>)}
            </div>
            <div id="slider" className="chat_view_slider"></div>
        </div>

        {!monitor && <div className="wrap_input">
            <input ref={refInput} id="message" className="chat_input" type="text" name="message" maxLength={200} placeholder='메세지(내용)를 입력해 주세요 (2-100)' onChange={setInput} value={input.message}
            onPaste={onPaste} onKeyDown={(e)=>{ if(e.key === 'Enter') clickMessage()}} />
            <button className="chat_input_bt c_blue" onClick={clickMessage}>전송</button>
            <button className="chat_input_bt c_orange" onClick={()=>openModal({ menu: true })}>등록</button>
        </div>}
    </div>)
}