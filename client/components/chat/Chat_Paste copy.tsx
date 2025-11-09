import { storeApp, storeUser } from "modules";
import { $FILE_UPLOAD } from "modules/systems";
import { $CHAT_MESSAGE } from "components/room";
import { Li_Item, Li } from "components/app";

// image
type PasteImage = {
    data: { text?: string; image?: string[] };
    setInput: (input: { message: string })=> void;
    closeModal: ()=> void;
}
export const Chat_Paste_Image = ({ data, setInput, closeModal }: PasteImage)=>{
    const { setPopup } = storeApp((s)=>s)
    const { socket } = storeUser((s)=>s)

    const sendImage = ()=>{
        if($CHAT_MESSAGE.line > $CHAT_MESSAGE.max) return setPopup({msg: '상대방의 메세지를 기다려주세요.'})
        socket.emit('CHAT_MESSAGE', { image: data.image })
        document.getElementById('message')?.focus()
        return closeModal()
    }
    const pasteText = ()=>{
        setInput({ message: data.text || '' });
        document.getElementById('message')?.focus()
        return closeModal()
    }

    return(<>
        <Li color="c_blue">이미지 표시 여부를 확인할 수 있습니다.</Li>
        <Li color="c_blue">최대 <span className="c_blue fwb">{$FILE_UPLOAD.chat}개</span>의 이미지만 붙여넣기가 가능합니다.</Li>
        <Li_Item label=">" color="c_blue">우회 접속 중이 아닌 상태에서 확인해 주세요.</Li_Item>
        <div className="wrap_preview">
            {data.image?.map((e, i)=><div key={i} className="preview_map3"><img src={e} alt="preview"/></div>)}
        </div>
        <div className="ta_c mg_t10">
            <button className="bt_3 c_blue" onClick={sendImage}>이미지 전송</button>
            <button className="bt_3 c_green mg_l6" onClick={pasteText}>문자만 붙여넣기</button>
        </div>
    </>)
}
// video
type PasteVideo = {
    data: { text?: string; video: string[] };
    setInput: (input: { message: string })=> void;
    closeModal: ()=> void;
}
export const Chat_Paste_Video = ({ data, setInput, closeModal }: PasteVideo)=>{
    const { setPopup } = storeApp((s)=>s)
    const { socket } = storeUser((s)=>s)

    const sendVideo = ()=>{
        if($CHAT_MESSAGE.line > $CHAT_MESSAGE.max) return setPopup({msg: '상대방의 메세지를 기다려주세요.'})
        socket.emit('CHAT_MESSAGE', { video: data.video })
        document.getElementById('message')?.focus()
        return closeModal()
    }
    const pasteText = ()=>{
        setInput({ message: data.text || '' });
        document.getElementById('message')?.focus()
        return closeModal()
    }

    return(<>
        <Li color="c_blue">동영상 재생 여부를 확인할 수 있습니다.</Li>
        <Li color="c_blue">최대 <span className="c_blue fwb">{$FILE_UPLOAD.chat}개</span>의 동영상만 붙여넣기가 가능합니다.</Li>
        <Li_Item label=">" color="c_blue">우회 접속 중이 아닌 상태에서 확인해 주세요.</Li_Item>
        <div className="wrap_preview">
            {data.video?.map((e, i)=><div key={i} className="preview_map3">
                <video controls muted><source src={e} type='video/mp4'/>지원하지 않는 영상입니다</video>
            </div>)}

        </div>
        <div className="ta_c mg_t10">
            <button className="bt_3 c_blue" onClick={sendVideo}>동영상 전송</button>
            <button className="bt_3 c_green mg_l6" onClick={pasteText}>문자만 붙여넣기</button>
        </div>
    </>)
}