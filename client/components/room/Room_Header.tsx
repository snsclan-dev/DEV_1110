import { useState } from "react";
import { Kakao_Map, storeApp, storeChat, storeUser, useFetch, useModal } from "modules";
import { checkAdmin } from "modules/systems";
import { Char, Label, Modal, Svg, View_Distance } from "components/app";
import { $ROOM_STATUS, Room_Create } from "components/room";
import type { User } from "types";
import { $SOCKET_STATE } from "components/chat";

export const Room_Header = ({ monitor = false, clickStatus }: { monitor?: boolean, clickStatus: (data: string)=> void })=>{
    const { setPopup, setConfirm } = storeApp((s)=>s)
    const { user, socket } = storeUser((s)=>s)
    const { room, roomUser, roomStatus, clear } = storeChat((s)=> s)
    const { modal, openModal, closeModal } = useModal()
    const [slide, setSlide] = useState(false);

    const $USER = roomUser.room_user.sort((a, b) => { // 참여자 정렬
        if (a.name === user.name) return -1;
        if (b.name === user.name) return 1;
        return b.level - a.level; // 나머지 level 내림차순 정렬
    });

    const userStyle = (e: User)=>{
        if(checkAdmin(e.level)) return { border: 'room_user_admin', color: 'c_orange' }
        if(e.name === user.name) return { border: 'room_user_host', color: 'c_blue' }
        return { border: 'room_user', color: 'c_gray' }
    }
    const clickHome = ()=>{
        setConfirm({ msg: '처음 화면으로 이동하시겠습니까?\n작업을 모두 종료하고 확인을 눌러주세요.', confirm: ()=> location.replace('/') })
    }
    const clickBlock = (obj: User)=>{
        const $CONFIRM = async ()=>{
            const $DATA = await useFetch.post('/room/block', { room: room.room, targetSocketId: obj.socketId })
            if($DATA){
                socket.emit('ROOM_BLOCK', { room: room.room, targetSocketId: obj.socketId, target_name: obj.name })
                closeModal()
            }
        }
        setConfirm({ msg: <><p>차단은 해제할 수 없습니다.</p><p>[ <span className="c_red fwb">{obj.name}</span> ]님을 차단하시겠습니까?</p></>, confirm: $CONFIRM })

    }
    const clickInvite = ()=>{
        navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/chat/room/${room.room}`)
        return setPopup({ msg: "대화방 주소(URL)가 복사되었습니다." });
    }
    const Chat_Profile = ({ obj }: { obj: User })=>{
        return(<>
            <p className="input"><Label label="대화명"><span className="fwb">{obj.name}</span>{obj.state === $SOCKET_STATE['8_HOST'] && <span className="c_blue fwb"> (⭐방장)</span>}</Label></p>
            {obj.name !== user.name && <p className="input"><Label label="나와의 거리"><View_Distance type="text" location1={user.location!} location2={obj.location!}/></Label></p>}
            <div className="ta_c mg_t6">
                <button className="bt_3 c_red">내보내기 (차단)</button>
            </div>
        </>)
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

    return(<>
        {modal.menu && <Modal title="" onClose={closeModal}><Chat_Menu/></Modal>}
        {modal.modify && <Modal title='대화방 설정' onClose={closeModal}><Room_Create onClose={closeModal}/></Modal>}
        {modal.profile && <Modal title="참여자 정보" onClose={closeModal}><Chat_Profile obj={modal.data}/></Modal>}
        
        {/* <div className="layout_header">
            <div className="header_max">
                <div className="header_menu_svg" onClick={clickHome}><Svg name="home" size={24} color="blue" /></div>
                <div className="header_menu" onClick={()=>setSlide(!slide)}>참여자</div>
                <div className="header_menu_svg" onClick={()=>openModal({ menu: true })}><Svg name="menu" size={24} color="blue" /></div>
            </div>
        </div> */}

        {/* <div className="layout_max pd_6"><Kakao_Map user={roomUser.room_user}/></div> */}
        {checkAdmin(user.level) && <div className="layout_max pd_6"><Kakao_Map user={roomUser.room_user}/></div>}

        {roomStatus >= $ROOM_STATUS['CHAT_3'] && <div className="layout_max pd_6">
            <div className="box pd_10 mg_b10">
                <div className="room_user" onClick={()=>openModal({ menu: true })}>
                    <Svg name="menu" size={24} color="blue" />
                </div>
                {/* {$USER.map((e)=> <div key={e.name} className={`${userStyle(e).border} fs_13 fwb`} onClick={()=>clickBlock(e)}> */}
                {$USER.map((e)=> <div key={e.name} className={`${userStyle(e).border} fs_13 fwb`} onClick={()=>openModal({ profile: true, data: e })}>
                    {/* <p className="lh_26 fs_13 fwb ellipsis"> */}
                        {e.state === $SOCKET_STATE['8_HOST'] && <span className="mg_r2">⭐</span>}<span className={userStyle(e).color}>{e.name}</span>
                        {e.name === user.name ? <span className="room_user_me mg_l6">나</span> : <><Char char="vl_1"/><View_Distance location1={user.location!} location2={e.location!}/></>}
                    {/* </p> */}
                </div>)}
            </div>
        </div>}
    </>)
}