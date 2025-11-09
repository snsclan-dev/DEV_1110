import { storeApp, storeChat, storeUser } from "modules"
import { socket } from "modules/sockets"
import { CodeData } from "types"

export const App_Dev = ()=>{
    const { setPopup, status } = storeApp((s)=>s)
    const { user } = storeUser((s)=>s)
    const { chat, room, roomUser } = storeChat((s)=>s)

    const clickStore = ()=>{
        console.log('store user :', user);
        console.log('store chat :', { chat, room: room, roomUser});
        console.log('socket id :', socket.id);
    }
    const clickSocket = ()=>{
        socket.emit('user')
    }
    const clickSocketClear = ()=>{
        socket.emit('SOCKET_REFRESH', (data: CodeData)=>{
            if(!data.code) setPopup({msg: data.msg})
        })
    }
        
    return(<div className="dev_footer fs_13 align ">
        <span className="mg_w1 c_pink fwb">개발 모드</span>
        <button className="btm_30">로그인 : {user.id ? user.id : 'X'}</button>
        <button className="btm_30">별명 : {user.name}</button>
        <button className="btm_30">대화명 : {chat.name}</button>
        <button className="btm_30">STATUS : {status}</button>
        <button className="btm_30" onClick={clickStore}>STORE</button>
        <button className="btm_30" onClick={clickSocket}>{socket?.id ? socket.id : '소켓 없음'} : {socket?.id?.length}</button>
        <button className="btm_30" onClick={clickSocketClear}>소켓 삭제</button>
    </div>)
}