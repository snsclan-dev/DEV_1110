import { Editor } from "@tiptap/react";
import { Li } from "components/app";
import { $REGEX, onErrorImage, storeApp, Text_Area, useInput } from "modules"
import { useMemo } from "react";

type Preview = {
    mediaType: 'image' | 'video';
    editor: Editor;
    openModal: (modal: Record<string, any>) => void;
}
export const Tiptap_Preview_Media = ({ mediaType, editor, openModal }: Preview)=>{
    const { setPopup } = storeApp((state)=>state)
    const [input, setInput] = useInput({link: ''})
    const $LABEL = { image: '이미지', video: '동영상' }[mediaType]
    const $IMAGE = mediaType === 'image'

    const $LINK = useMemo(() => {
        return Array.from(new Set(
            input.link.split(/[\s,]+/).map(e => e.trim()).map(e => {
            const match = e.match($IMAGE ? $REGEX.url_image : $REGEX.url_video); // 이미지 URL 추출
            return match ? match[0] : null;
            }).filter(Boolean) as string[] // null제거
        )).slice(0, $IMAGE ? 5 : 3) // 최대 5 : 3개
    }, [mediaType, input.link]);

    const sendMedia = ()=>{
        if($LINK.length > ($IMAGE ? 5 : 3)) return setPopup({ msg: `${$IMAGE ? '이미지는 한번에 5개' : '동영상은 한번에 3개'}까지 등록 가능합니다.\n현재 입력된 이미지 수 : ${$LINK.length}개` });
        if($IMAGE){
            $LINK.forEach(e => editor.commands.setImage({ src: e, alt: 'image' }) );
        }else{
            const $FILTER = $LINK.filter(e => /\.(mp4|webm|ogg)$/i.test(e));
            if($FILTER.length !== $LINK.length) return setPopup({ msg: '지원하지 않는 동영상 형식이 포함되어 있습니다.\n(MP4, WEBM, OGG만 지원)' });
            const $VIDEO = $FILTER.map(link => ({ type: 'video', attrs: { src: link, muted: true } }));
            editor.commands.insertContent($VIDEO);
        }
        editor.commands.focus();
        return openModal({})
    }

    return(<>
        <Li>{$LABEL} 표시 여부를 확인할 수 있습니다.</Li>
        <Li>우회 접속 중이 아닌 상태에서 확인해 주세요.</Li>
        
        <div className="wrap_preview mg_b6">
            {$IMAGE && $LINK.map((e, i)=>(<div key={i} className="preview_map5">
                <img src={e} alt="preview" onError={onErrorImage}/>
            </div>))}
            {mediaType === 'video' && $LINK.map((e, i)=><div key={i} className="preview_map3">
                <video controls muted><source src={e} type='video/mp4'/>지원하지 않는 영상입니다</video>
            </div>)}
        </div>

        <Li>{$LABEL} 주소(URL)를 입력해주세요. 공백, 콤마( , )로 구분</Li>

        <div className="mg_b10"><Text_Area className="textarea scroll" maxRows={8} name='link' maxLength={2000} onChange={setInput} value={input.link}/></div>
        <div className="ta_c pd_h2">
            {$IMAGE && <button className="bt_main c_green" onClick={()=>openModal({ upload_image: true })}>뒤로가기(취소)</button>}
            <button className="bt_main c_blue" onClick={sendMedia}>{$LABEL} 등록</button>
        </div>
    </>)
}