import { Kakao_Map, socketData, storeApp, storeChat, storeUser, useModal } from "modules";
import { checkAdmin } from "modules/systems";
import { Char, Label, Modal, Svg, View_Distance } from "components/app";
import type { CodeData, User } from "types";

export const Private_Header = ({ monitor = false }: { monitor?: boolean })=>{
    const { setPopup, setConfirm } = storeApp((s)=>s)
    const { user, socket } = storeUser((s)=>s)
    const { room, setRoom, roomUser, setRoomStatus, clear } = storeChat((s)=> s)
    const { modal, openModal, closeModal } = useModal()

    const $USER = roomUser.sort((a, b) => { // 참여자 정렬
        if (a.name === user.name) return -1;
        if (b.name === user.name) return 1;
        return b.level - a.level; // 나머지 level 내림차순 정렬
    });

    const userStyle = (e: User)=>{
        if(checkAdmin(e.level)) return { border: 'room_user_admin', color: 'c_orange' }
        if(e.name === user.name) return { border: 'room_user_host', color: 'c_blue' }
        return { border: 'room_user', color: 'c_gray' }
    }
    const clickCopy = ()=>{
        navigator.clipboard.writeText(`대화방 코드 : ${socket.id}\n\n대화방 초대 링크(주소)\n${process.env.NEXT_PUBLIC_APP_URL}/chat/${socket.id}`)
        return setPopup({ msg: "대화방 초대 링크(주소)가 복사되었습니다." });
    }
    const clickStatus = (status: string)=>{
        if(status === 'ADMIN_LEAVE'){
            socket.emit('ADMIN_LEAVE', (data: CodeData)=>{
                const $DATA = socketData(data)
                if($DATA) setRoomStatus('WAIT'); clear();
            })
        }
        if(status === 'LEAVE'){
            const $CONFIROM = ()=>{
                socket.emit('ROOM_LEAVE', (data: CodeData)=>{
                    const $DATA = socketData(data)
                    if($DATA){
                        setRoom({ room: '' })
                        setRoomStatus('WAIT'); clear();
                    }
                })
            }
            setConfirm({ msg: '대화방을 나가시겠습니까?', confirm: $CONFIROM})
        }
    }
    const Chat_Menu = ()=>{
        return(<div className='wrap_flex_bt'>
            {room.room === socket.id && <button className="flex_bt c_green" onClick={clickCopy}>대화방 주소 공유</button>}
            <button className="flex_bt c_gray" onClick={()=>{ clear(); closeModal() }}>대화 내용 삭제</button>
            {monitor ? 
                <button className="flex_bt c_red" onClick={()=>{ clickStatus('ADMIN_LEAVE'); closeModal() }}>모니터링 종료</button> : 
                <button className="flex_bt c_red" onClick={()=>{ clickStatus('LEAVE'); closeModal() }}>대화방 나가기</button>
            }
        </div>)
    }
    const Chat_Profile = ({ obj }: { obj: User })=>{
        return(<>
            <p className="input mg_b10"><Label label="대화명"><span className="fwb">{obj.name}</span>{obj.state === 1 && <span className="c_blue fwb"> (⭐방장)</span>}</Label></p>
            {obj.name !== user.name && <p className="input mg_b10"><Label label="나와의 거리"><View_Distance type="text" location1={user.location!} location2={obj.location!}/></Label></p>}
            <div className="ta_c pd_t3">
                <button className="bt_3 c_red">내보내기 (차단)</button>
            </div>
        </>)
    }

    return(<>
        {modal.menu && <Modal title="" onClose={closeModal}><Chat_Menu/></Modal>}
        {/* {modal.modify && <Modal title='대화방 설정' onClose={closeModal}><Room_Create onClose={closeModal}/></Modal>} */}
        {modal.profile && <Modal title="참여자 정보" onClose={closeModal}><Chat_Profile obj={modal.data}/></Modal>}
        
        {/* <div className="layout_max pd_6"><Kakao_Map user={roomUser.room_user}/></div> */}
        {checkAdmin(user.level) && <div className="layout_max pd_6"><Kakao_Map user={roomUser}/></div>}

        <div className="layout_max pd_6">
            <div className="box pd_10 mg_b10">
                <div className="room_user" onClick={()=>openModal({ menu: true })}>
                    <Svg name="menu" size={24} color="blue" />
                </div>
                {/* {$USER.map((e)=> <div key={e.name} className={`${userStyle(e).border} fs_13 fwb`} onClick={()=>clickBlock(e)}> */}
                {$USER.map((e)=> <div key={e.name} className={`${userStyle(e).border} fs_13 fwb`} onClick={()=>openModal({ profile: true, data: e })}>
                    {e.state === $SOCKET_STATE['8_HOST'] && <span className="mg_r2">⭐</span>}<span className={userStyle(e).color}>{e.name}</span>
                    {e.name === user.name ? <span className="room_user_me mg_l6">나</span> : <><Char char="vl_1"/><View_Distance location1={user.location!} location2={e.location!}/></>}
                </div>)}
            </div>
        </div>
    </>)
}