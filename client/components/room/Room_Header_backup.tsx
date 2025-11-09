import { useState } from "react";
import { storeApp, storeChat, storeUser, useModal } from "modules";
import { checkAdmin } from "modules/systems";
import { Modal, Svg, View_Distance } from "components/app";
import { Room_Board, Room_Info, Room_Messenger } from "components/room";
import type { RoomMenu, User } from "types";
import { storeRoom } from "modules/zustand";

export const Room_Header = ({ monitor = false, clickStatus }: { monitor?: boolean, clickStatus: (data: string)=> void })=>{
    const { setPopup, setConfirm } = storeApp((s)=>s)
    const { user } = storeUser((s)=>s)
    const { room, roomUser, clear } = storeChat((s)=> s)
    const { count } = storeRoom((s)=> s)
    const { modal, openModal, closeModal } = useModal()
    const [tab, setTab] = useState<RoomMenu>('CHAT')
    const [slide, setSlide] = useState(false);

    const userStyle = (e: User)=>{
        if(checkAdmin(e.level)) return 'c_orange'
        if(e.status === 1) return 'c_blue'
        return 'c_gray'
    }

    const $TAB: { menu: RoomMenu; label: string }[] = [
        { menu: 'CHAT', label: '대화방(채팅)' }, { menu: 'MESSENGER', label: '메신저' }, { menu: 'BOARD', label: '게시판' }
    ]

    const clickHome = ()=>{
        setConfirm({ msg: '처음 화면으로 이동하시겠습니까?\n작업을 모두 종료하고 확인을 눌러주세요.', confirm: ()=> location.replace('/') })
    }
    const clickInvite = ()=>{
        navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/chat/room/${room.room}`)
        return setPopup({ msg: "대화방 주소(URL)가 복사되었습니다." });
    }
    const Chat_Menu = ()=>{
        return(<div className='wrap_flex_bt mg_t6'>
            {room.user_id === user.id && <>
                <button className="flex_bt c_green" onClick={clickInvite}>대화방 주소 공유</button>
                <button className="flex_bt c_orange" onClick={()=>openModal({ modify: true })}>대화방 설정</button>
            </>}
            <button className="flex_bt c_gray" onClick={()=>{ clear(); closeModal() }}>대화 내용 삭제</button>
            {monitor ? <button className="flex_bt c_red" onClick={()=>{ clickStatus('ADMIN_LEAVE'); closeModal() }}>모니터링 종료</button> :
                <button className="flex_bt c_red" onClick={()=>{ clickStatus('LEAVE'); closeModal() }}>대화방 나가기</button>
            }
        </div>)
    }

    return(<div className="layout_header">
        {modal.info && <Modal title="" onClose={closeModal}><Chat_Menu/></Modal>}
        {modal.menu && <Modal title="" onClose={closeModal}><Chat_Menu/></Modal>}
        {modal.modify && <Modal title='대화방 설정' onClose={closeModal}><Room_Info onClose={closeModal}/></Modal>}

        <Room_Messenger tab={tab === 'MESSENGER'}/>
        <Room_Board tab={tab === 'BOARD'}/>

        <div className="menu_slide" data-state={slide ? 'open' : 'closed' } >
            <p className="flex_col room_user c_red fwb" onClick={()=>setSlide(false)}>닫기</p>
            {roomUser.room_user.map((e)=> <div key={e.name} className="flex_col room_user">
                <p className={`lh_26 ${userStyle(e)} fwb ellipsis`}>{checkAdmin(e.level) ? '☀️ ' : e.status === 1 && '⭐ '}{e.name}</p>
                {e.name !== user.name && <p className="lh_26"><View_Distance location1={user.location!} location2={e.location!}/></p>}
            </div>)}
        </div>

        <div className="header_max">
            <div className="header_menu_svg" onClick={clickHome}><Svg name="home" size={24} color="blue" /></div>
            <div className="header_menu" onClick={()=>setSlide(!slide)}>참여자</div>
            {$TAB.map((e)=> <div key={e.menu} className="header_menu" onClick={()=>setTab(e.menu)}>{e.label} [{count[e.menu]}]</div>)}
            <div className="header_menu_svg" onClick={()=>openModal({ menu: true })}><Svg name="menu" size={24} color="blue" /></div>
        </div>
    </div>)
}

