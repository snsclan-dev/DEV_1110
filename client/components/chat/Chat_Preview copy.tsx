import { onErrorImage, storeApp, storeUser, Text_Area, useInput } from "modules"
import { $CHAT_MESSAGE } from "components/room"

type Preview = {
    openModal: (modal: Record<string, any>) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}
export const Chat_Preview_Image = ({ openModal }: Preview)=>{
    const { setPopup } = storeApp((state)=>state)
    const { socket } = storeUser((state)=>state)
    const [input, setInput] = useInput({link: ''})
    const $LINK = input.link.split(/[\s,]+/).filter(e => e.trim());

    // const $LINK = useMemo(() => 
    //     [...input.link.matchAll($REGEX.url_image)].map(m => m[1]).slice(0, 3), [input.link]
    // );

    // const $LINK = useMemo(() => {
    //     return input.link.split(/[\s,]+/).map(e => e.trim()).map(e => {
    //         const match = e.match($REGEX.url_image); // 이미지 URL 추출
    //         return match ? match[0] : null;
    //     }).filter(Boolean).slice(0, 3); // null제거, 최대 3개
    // }, [input.link]);

    const sendImage = ()=>{
        if($CHAT_MESSAGE.line > $CHAT_MESSAGE.max) return setPopup({msg: '상대방의 메세지를 기다려주세요.'})
        if($LINK.length > 3) return setPopup({ msg: `이미지는 한번에 3개까지 등록 가능합니다.\n현재 입력된 이미지 수 : ${$LINK.length}개` });
        socket.emit('CHAT_IMAGE', { image: $LINK })
        document.getElementById('message')?.focus()
        return openModal({})
    }

    return(<div>
        <p className="lh_26 fs_13"><span className="li c_blue">&bull;</span>이미지 표시 여부를 확인할 수 있습니다.</p>
        <div className="wrap_preview mg_b6">
            {$LINK.slice(0, 5).map((e, i)=> <div key={i} className="preview_map3"><img src={e} alt="preview" onError={onErrorImage}/></div>)}
        </div>

        <p className="lh_26 fs_13"><span className="li c_blue">&bull;</span>이미지 주소(URL)를 입력해주세요. 공백, 콤마( , )로 구분</p>
        <div className="mg_b6"><Text_Area className="textarea scroll" maxRows={8} name='link' maxLength={2000} onChange={setInput} value={input.link}/></div>
        <div className="ta_c mg_t10">
            <button className="bt_3 c_green" onClick={()=>openModal({ menu: true })}>뒤로가기(취소)</button>
            <button className="bt_3 c_blue" onClick={sendImage}>이미지 전송</button>
        </div>
    </div>)
}
export const Chat_Preview_Video = ({ openModal }: Preview)=>{
    const { setPopup } = storeApp((state)=>state)
    const { socket } = storeUser((state)=>state)
    const [input, setInput] = useInput({video: ''})
    const $LINK = input.video.split(/[\s,]+/).filter(e => e.trim());

    const sendVideo = ()=>{
        if($CHAT_MESSAGE.line > $CHAT_MESSAGE.max) return setPopup({msg: '상대방의 메세지를 기다려주세요.'})
        if($LINK.length > 3) return setPopup({ msg: `이미지는 한번에 3개까지 등록 가능합니다.\n현재 입력된 이미지 수 : ${$LINK.length}개` });
        socket.emit('CHAT_VIDEO', { video: $LINK })
        document.getElementById('message')?.focus()
        return openModal({})
    }

    return(<>
        <p className="fs_13"><span className="li c_blue">&bull;</span>동영상 재생 여부를 확인할 수 있습니다.</p>
        <div className="wrap_preview">
            {$LINK.slice(0, 3).map((e, i)=><div key={i} className="preview_map3">
                <video controls muted><source src={e} type='video/mp4'/>지원하지 않는 영상입니다</video>
            </div>)}
        </div>
        <p className="lh_26 fs_13"><span className="li c_blue">&bull;</span>동영상 주소(URL)를 입력해주세요. 공백, 콤마( , )로 구분</p>
        <div className="mg_b6"><Text_Area className="textarea scroll" maxRows={8} name='video' maxLength={2000} onChange={setInput} value={input.video}/></div>
        <div className="ta_c mg_t10">
            <button className="bt_3 c_green" onClick={()=>openModal({ menu: true })}>뒤로가기(취소)</button>
            <button className="bt_3 c_blue" onClick={sendVideo}>동영상 전송</button>
        </div>
    </>)
}