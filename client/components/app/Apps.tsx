import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { onErrorImage } from "modules";

export const $LOCATION_MSG = { msg: '위치 정보(권한)가 차단되었습니다.\n위치 정보를 허용한 후, 새로고침을 해 주세요.', note: '브라우저 설정에서 권한을 다시 허용해 주세요.' } // setPopup location message

export const Loading = () => {
    return createPortal(<div className="layout_loading">
        <div className="loader"></div>
    </div>, document.body);
};
const Layer = ({ className, onClose, children }: { className: string; onClose?: ()=> void; children: ReactNode }) => { // dom layer
    return createPortal(<div className={className} onClick={onClose}>
        <div className="wrap_modal">{children}</div>
    </div>, document.body);
};
export const Layout = ({ onClose, children }: { onClose?: ()=>void, children?: ReactNode })=>{ // overlay
    return createPortal(<div className="layout_tab">
        {children}
    </div>, document.body)
}
export const Modal = ({ title = '', onClose, children }: { title?: string, onClose: ()=> void; children: ReactNode }) => {
    return (<Layer className="layout_modal">
        <div className="flex flex_align pd_6 bg">
            <div className="flex_1 pd_l8"><span className="fs_13 fwb">{title && title}</span></div>
            <div className="ta_r"><button className="bt_close c_red" onClick={onClose}>닫기</button></div>
        </div>
        <div className="modal_view">{children}</div>
    </Layer>);
};
export const Modal_Image = ({src, onClose}: { src: string, onClose: ()=> void })=>{
    return(<div className="layout_image" onClick={onClose}>
        <div className="wrap_image"><img src={src} alt="image view" onError={onErrorImage}/></div>
    </div>)
}
export const Modal_Video = ({src, onClose}: { src: string, onClose: ()=> void })=>{
    return(<div className="layout_video">
        <div className="pd_10 ta_r" onClick={onClose}>
            <button className="bt_3 c_red" onClick={onClose}>닫기</button>
        </div>
        <video controls muted autoPlay><source src={src} type='video/mp4'/>지원하지 않는 영상입니다</video>
    </div>)
}
const $CODE_STATUS: Record<number, { status: string; color: string }> & { default: { status: string, color: string} } = {
    // server response
    0: { status: '[ 성공 ]', color: 'green' }, 1: { status: '[ 확인 ]', color: 'orange' }, 2: { status: '[ 오류 ]', color: 'red' }, 
    // client popup(blue)
    9: { status: '[ 알림 ]', color: 'blue' }, default: { status: '[ 알림 ]', color: 'blue' },
} 
export const Popup = ({ code, msg, note, onClose }: { code?: number, msg: ReactNode, note?: ReactNode, onClose: ()=> void })=> {
    const $CODE = $CODE_STATUS[code ?? - 1] ?? $CODE_STATUS.default;
    return (<Layer className="layout_popup" onClose={onClose}>
        <div className={`popup_status c_${$CODE.color} bg_${$CODE.color}`}>{$CODE.status}</div>
        <pre className="modal_view">{msg}</pre>
        {note && <pre className="modal_view_note bg">{note}</pre>}
        <div className="ta_c pd_h10">
            <button className="bt_popup" onClick={onClose}>확인</button>
        </div>
    </Layer>)
}
export const Confirm = ({ msg, note, confirm, onClose }: { msg: ReactNode; note?: ReactNode; confirm?: ()=> Promise<void> | void; onClose: ()=> void })=>{
    const clickConfirm = async ()=>{
        if(confirm) await confirm();
        return onClose();
    }
    return (<Layer className="layout_confirm">
        <div className="popup_status c_blue bg_blue">[ 선택 ]</div>
        <pre className="modal_view">{msg}</pre>
        {note && <pre className="modal_view_note bg">{note}</pre>}
        <div className="ta_c pd_h10">
            <button className="bt_main c_blue" onClick={clickConfirm}>확인</button>
            <button className="bt_main c_red" onClick={onClose}>닫기</button>
        </div>
    </Layer>);
}
export const Message = ({ code, msg, note, children }: { code?: number, msg?: ReactNode, note?: ReactNode, children?: ReactNode })=>{
    const $CODE = $CODE_STATUS[code ?? - 1] ?? $CODE_STATUS.default;
    return(<div className="layout_message">
        {code !== undefined && <div className={`popup_status c_${$CODE.color} bg_${$CODE.color}`}>{$CODE.status}</div>}
        {msg && <pre className="modal_view">{msg}</pre>}
        {note && <pre className="modal_view_note bg">{note}</pre>}
        {children && <div className="wrap_message">{children}</div>}
    </div>)
}
