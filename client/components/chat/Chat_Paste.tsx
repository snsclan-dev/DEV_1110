import { onErrorImage, socket, storeApp } from "modules";
import { $FILE_UPLOAD } from "modules/systems";
import { Li } from "components/app";
import { $CHAT_MESSAGE } from "components/chat";

type PasteData = {
    data: { image?: string[]; video?: string[]; text?: string; };
    setInput: (input: { message: string }) => void;
    closeModal: () => void;
};
export const Chat_Paste_Media = ({ data, setInput, closeModal }: PasteData) => {
    const { setPopup } = storeApp((s) => s);

    const $IMAGE = Array.isArray(data.image) && data.image.length > 0;
    const $VIDEO = Array.isArray(data.video) && data.video.length > 0;

    const sendMedia = () => {
        if ($CHAT_MESSAGE.line > $CHAT_MESSAGE.max) return setPopup({ msg: "상대방의 메세지를 기다려주세요." });
        if ($IMAGE) socket.emit("CHAT_MESSAGE", { image: data.image });
        if ($VIDEO) socket.emit("CHAT_MESSAGE", { video: data.video });
        document.getElementById("message")?.focus();
        return closeModal();
    };
    const pasteText = () => {
        setInput({ message: data.text || "" });
        document.getElementById("message")?.focus();
        return closeModal();
    };

    return (<>
        <Li>{$IMAGE ? "이미지 표시 여부(차단)를 확인할 수 있습니다." : "동영상 재생 여부(차단)를 확인할 수 있습니다."}</Li>
        <Li>우회 접속, 로그인 중이 아닌 상태에서 확인해 주세요.</Li>
        <Li>최대 <span className="c_blue fwb">{$FILE_UPLOAD.chat}</span>개의 {$IMAGE ? "이미지" : "동영상"}만 붙여넣기가 가능합니다.</Li>
        
        <div className="wrap_preview mg_b10">
            {$IMAGE && data.image?.map((src, i) => (<div key={i} className="preview_map3">
                <img src={src} alt="preview" onError={onErrorImage}/>
            </div>))}
            {$VIDEO && data.video?.map((src, i) => (<div key={i} className="preview_map3">
                <video controls muted><source src={src} type="video/mp4" />지원하지 않는 영상입니다</video>
            </div>))}
        </div>
        <div className="ta_c pd_h2">
            <button className="bt_main c_blue" onClick={sendMedia}>{$IMAGE ? "이미지 전송" : "동영상 전송"}</button>
            <button className="bt_main c_green mg_l6" onClick={pasteText}>문자만 붙여넣기</button>
        </div>
    </>);
};