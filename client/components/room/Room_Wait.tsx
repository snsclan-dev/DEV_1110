import { $REGEX_GUIDE, checkInput, socketData, storeApp, storeChat, storeUser, useFetch, useInput } from "modules"
import { checkAdmin } from "modules/systems";
import { Label_InputColor, Svg, Title } from "components/app";
import { $ROOM_STATUS } from "components/room";
import type { CodeData } from "types"

export const Room_Wait = ()=>{
    const { popup, setPopup, setConfirm } = storeApp((state)=> state)
    const { user, socket } = storeUser((state)=> state)
    const { room, roomUser, setRoomStatus } = storeChat((s)=> s)
    const [input, setInput] = useInput({ room_pass: '' })

    const $ADMIN = checkAdmin(user.level)
    const $HOST = room.user_id === user.id;
    const $MAX = room.room_max <= roomUser.room_now;
    const $DISABLED = !$ADMIN && (popup !== null || !$HOST && (!roomUser.room_host || $MAX))

    const clickModifyName = ()=>{
        socket.emit('UPDATE_NAME', (data: CodeData)=>{
            const $DATA = socketData(data)
            if($DATA) setRoomStatus($ROOM_STATUS['NAME_1'])
        })
    }
    const clickJoinAdmin = ()=> socket.emit('ADMIN_JOIN') // 관리자 모니터링
    const clickJoin = ()=>{
        const $ROOM_PASS = checkInput(input)
        if($ROOM_PASS.code !== 0) return setPopup($ROOM_PASS)
        // if(!$HOST){ ///
        //     if(!roomUser.room_host) return setPopup({ msg: '대화방에 참여할 수 없습니다.', note: <>방장이 <span className="c_red fwb">오프라인</span>입니다.</> })
        //     if($MAX) return setPopup({ msg: '대화방에 참여할 수 없습니다.', note: <><span className="c_red fwb">참여자 수</span>를 확인해주세요.</> })
        // }
        const $CONFIRM = async ()=>{
            const $DATA = await useFetch.post('/room/code', { room: room.room, room_pass: input.room_pass })
            if($DATA){
                socket.emit('ROOM_JOIN', (data: CodeData)=>{
                    const $DATA = socketData(data)
                    if($DATA) socket.emit('ROOM_USER', { num: room.num, room: room.room })
                })
            }
        }
        setConfirm({ msg: "대화방에 입장하시겠습니까?", confirm: $CONFIRM });
    }

    return(<div className="max_w60 pd_6">
        <Title>대기실</Title>
        
        <div className="box pd_6 mg_b20">
            <p className="pd_l3 fs_15 fwb">{room.title}</p>
            <div className="pd_h6"><hr /></div>
            <pre className="pd_l3">{room.note ? room.note : <span className="c_lgray">내용(안내) 없음</span>}</pre>
        </div>

        <div className="flex_between mg_b20">
            <div className="box pd_6 ta_c">
                <p className="fs_13 c_gray mg_b10">방장</p>
                <p className={`${roomUser.room_host ? 'c_green' : 'c_lgray'} fwb`}>{roomUser.room_host ? '온라인' : '오프라인'}</p>
            </div>
            <div className="box pd_6 ta_c">
                <p className="fs_13 c_gray mg_b10">대기실</p>
                <p className="c_green fwb">{roomUser.room_wait}</p>
            </div>
            <div className="box pd_6 ta_c">
                <p className="fs_13 c_gray mg_b10">참여자</p>
                <p className={`${$MAX ? 'c_red' : 'c_green'} fwb`}>{roomUser.room_now} / {room.room_max}</p>
            </div>
        </div>

        {$ADMIN && <p className="c_orange fwb mg_b6">☀️ 운영자로 접속 중입니다.</p>}
        {$HOST && <p className="c_green fwb mg_b6">⭐ 방장으로 접속 중입니다.</p>}

        <p className="align mg_b6"><Svg name='check' size={22} color='green'/><span className="fs_13 c_gray mg_l10">내 대화명 : </span>&nbsp;<span className="c_lblue fwb">{user.name}</span></p>

        <Label_InputColor label="입장 코드(암호)">{$REGEX_GUIDE.room_pass}</Label_InputColor>
        <input className="input mg_b6" type="text" name="room_pass" maxLength={10} placeholder="대화방 입장코드(암호)를 입력해 주세요" onChange={setInput} value={input.room_pass} onKeyDown={(e)=>{ if(e.key === 'Enter') clickJoin()}}/>

        <div className="ta_c pd_t2">
            <button className='bt_4 c_gray' onClick={clickModifyName}>대화명 수정</button>
            {/* <button className='bt_4 c_blue' onClick={clickJoin} disabled={$DISABLED}>{$HOST && '⭐ '}참여하기</button> */}
            <button className='bt_4 c_blue' onClick={clickJoin} disabled={$DISABLED}>{$ADMIN ? '☀️ ' : $HOST && '⭐ '}참여하기</button>
            <button className='bt_4 c_pink' onClick={clickJoin}>참여</button>
            {$ADMIN && <button className="bt_4 c_orange" onClick={clickJoinAdmin}>⚙️ 모니터링</button>}
        </div>
    </div>)
}