import React from "react";
import { createPortal } from "react-dom";

export const Loading = () => {
    return createPortal(<div className="layout_loading">
        <div className="loader"></div>
    </div>, document.body);
};
const Layer = ({ className, children }: { className: string; children: React.ReactNode }) => { // dom layer
    return createPortal(<div className={className}>
        <div className="wrap_modal pd_10">{children}</div>
    </div>, document.body);
};
export const Modal = ({ title = '', onClose, children }: { title?: string, onClose: ()=> void; children: React.ReactNode }) => {
    return (<Layer className="layout_modal">
        <div className="line w_80 pd_l3"><span className="c_gray fwb">{title && title}</span></div>
        <div className="line w_20 ta_r"><button className="bt_main" onClick={onClose}>닫기</button></div>
        <div className="modal_view">{children}</div>
    </Layer>);
};
export const Popup = ({ code = 0, msg = '', note, onClose }: { code?: number; msg: string; note?: string, onClose: ()=> void })=> {
    const $CODE_STATUS: Record<number, { status: string; color: string }> & { default: { status: string, color: string} } = {
        // server response > 3: 인증(로그인)
        0: {  status: '[ 성공 ]', color: 'c_green' }, 1: { status: '[ 확인 ]', color: 'c_red' }, 2: { status: '[ 서버 알림 ]', color: 'c_orange' }, 3: { status: '[ 인증 ]', color: 'c_blue' },
        // client notice popup
        7: { status: '[ 알림 ]', color: 'c_green' }, 8: { status: '[ 확인 ]', color: 'c_red' }, 9: { status: '[ 서버 알림 ]', color: 'c_orange' }, 
        default: { status: '[ 알림 ]', color: 'c_green' },
    }
    const $CODE = $CODE_STATUS[code ?? - 1] ?? $CODE_STATUS.default;

    return (<Layer className="layout_popup">
        <div className={`popup_status ${$CODE.color}`}><span className="fwb">{$CODE.status}</span></div>
        <pre className="modal_view">{msg}</pre>
        {note && <pre className="modal_view_note">{note}</pre>}
        <div className="ta_c">
            <button className="bt_popup" onClick={onClose}>확인 (닫기)</button>
        </div>
    </Layer>)
}
export const Confirm = ({ msg, confirm, onClose }: { msg: string; confirm: ()=> Promise<void> | boolean | void; onClose: ()=> void })=>{
    const $CHECK = React.useRef(msg);
    const clickConfirm = async ()=>{
        if(confirm) await confirm();
        if($CHECK.current !== msg) onClose();
    }

    return (<Layer className="layout_confirm">
        <pre className="modal_view">{msg}</pre>
        <div className="wrap_button">
            <button className="bt_3 c_blue" onClick={clickConfirm}>확인</button>
            <button className="bt_3 mg_l10 c_red" onClick={onClose}>취소 (닫기)</button>
        </div>
    </Layer>);
}