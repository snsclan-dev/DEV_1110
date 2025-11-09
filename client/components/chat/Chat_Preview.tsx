import { useMemo } from "react";
import { $REGEX, onErrorImage, socket, storeApp, Text_Area, useInput } from "modules"
import { Li } from "components/app";
import { $CHAT_MESSAGE } from "components/chat"

type Preview = {
    mediaType: 'image' | 'video';
    openModal: (modal: Record<string, any>) => void;
}
export const Chat_Preview_Media = ({ mediaType, openModal }: Preview)=>{
    const { setPopup } = storeApp((state)=>state)
    const [input, setInput] = useInput({ link: '' });
    const $TYPE = { image: '이미지', video: '동영상' }[mediaType]

    const $LINK = useMemo(() => {
        return Array.from(new Set(
            input.link.split(/[\s,]+/).map(e => e.trim()).map(e => {
            const match = e.match(mediaType === 'image' ? $REGEX.url_image : $REGEX.url_video); // 이미지 URL 추출
            return match ? match[0] : null;
            }).filter(Boolean) as string[] // null제거
        )).slice(0, 3) // 최대 3개
    }, [mediaType, input.link]);

    const sendMedia = ()=>{
        if($CHAT_MESSAGE.line > $CHAT_MESSAGE.max) return setPopup({msg: '상대방의 메세지를 기다려주세요.'})
        socket.emit('CHAT_MESSAGE', mediaType === 'image' ? { image: $LINK } : { video: $LINK })
        document.getElementById('message')?.focus()
        return openModal({})
    }

    return(<div>
        <Li>{$TYPE} 표시 여부를 확인할 수 있습니다.</Li>
        <Li>우회 접속 중이 아닌 상태에서 확인해 주세요.</Li>
        
        <div className="wrap_preview mg_b20">
            {mediaType === 'image' && $LINK.map((e, i)=>(<div key={i} className="preview_map3">
                <img src={e} alt="preview" onError={onErrorImage}/>
            </div>))}
            {mediaType === 'video' && $LINK.map((e, i)=><div key={i} className="preview_map3">
                <video controls muted><source src={e} type='video/mp4'/>지원하지 않는 영상입니다</video>
            </div>)}
        </div>

        <Li>{$TYPE} 주소(URL)를 입력해주세요. 공백, 콤마( , )로 구분</Li>
        <div className="mg_b10"><Text_Area className="textarea scroll" maxRows={8} name='link' maxLength={2000} onChange={setInput} value={input.link}/></div>
        <div className="ta_c pd_t3">
            <button className="bt_3 c_green" onClick={()=>openModal({ menu: true })}>뒤로가기(취소)</button>
            <button className="bt_3 c_blue" onClick={sendMedia}>{$TYPE} 전송</button>
        </div>
    </div>)
}