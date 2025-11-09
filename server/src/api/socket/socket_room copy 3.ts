import { Server } from "socket.io"
import { RowDataPacket } from "mysql2";
import { checkAdmin, pool } from "config";
import { $SOCKET_STATE, SOCKET_LIST, SOCKET_UPDATE, SOCKET_ROOM_USER, ROOM_USER_UPDATE, SOCKET_UPDATE_TARGET, ROOM_BLOCK_CHECK } from "modules";
import type { SocketUser } from "types";

// socket router
const socket_room = (IO: Server)=>{
    IO.on("connection", (socket) => {
        socket.on('CHECK_ROOM', async ({ room }, cb)=>{
            const $SQL_ROOM = `SELECT num, room, title, note, user_id, room_pass, room_max, blocked, updated FROM room WHERE room=?;`;
            const $ROOM = await pool<RowDataPacket[]>($SQL_ROOM, [room])
            if(!$ROOM.length) return socket.emit('ALERT', { code: 1, msg: '대화방 정보가 없습니다.', note: '존재하지 않거나 삭제된 방입니다.' })
            const { blocked } = $ROOM[0];
            const $BLOCK = await ROOM_BLOCK_CHECK(socket.id, blocked)
            if($BLOCK.code !== 0) return cb($BLOCK)
            cb({ code: 0, room: $ROOM[0] });
        })
        socket.on('ROOM_ENTER', async ({ room, id, name }, cb)=>{
            const $SQL_NAME = `SELECT id, name FROM user WHERE name=?;`;
            const $NAME = await pool<RowDataPacket[]>($SQL_NAME, [name])
            if($NAME.length && $NAME[0].id !== id) return cb({ code: 1, msg: '이미 등록된 대화명입니다.' })
            if(!id){
                const $LIST = await SOCKET_LIST()
                const $FIND = $LIST.find(e => e.room === room && e.name === name)
                if($FIND) return cb({ code: 1, msg: '이미 사용중인 대화명입니다.'})
            }
            for (const $ROOM of socket.rooms) {
                if ($ROOM !== socket.id) {
                    socket.leave($ROOM); // 모든 방 나가기
                }
            }
            await SOCKET_UPDATE(socket, { room, id, name }) // 소켓 업데이트
            cb({ code: 0 });
        })
        socket.on('ROOM', async ({ num, room })=>{ // 대기실 입장 초기화
            const $NUM = String(num);
            socket.join($NUM);
            await SOCKET_UPDATE(socket, { num: $NUM })
            const $USER = await SOCKET_ROOM_USER(room)
            IO.to($NUM).emit('ROOM_USER', { user: $USER })
        })
        socket.on('ROOM_UPDATE', async ({ num, room })=>{ // room modify
            const $SQL_ROOM = `SELECT num, room, title, note, user_id, room_max, updated FROM room WHERE room=?;`;
            const $ROOM = await pool<RowDataPacket[]>($SQL_ROOM, [room])
            if($ROOM[0].num) IO.to(String($ROOM[0].num)).emit('ROOM', { room: $ROOM[0] })
        })
        socket.on('ADMIN_JOIN', async ()=>{ // 관리자 모니터링
            const { room, level } = socket.user as SocketUser;
            console.log(level);
            if(!checkAdmin(level)) return socket.emit('ALERT', { code: 1, msg: '모니터링 권한이 없습니다.' })
            socket.join(room)
            socket.emit('ROOM_MESSAGE', { status: 'ADMIN' })
            // cb({code: 0})
        })
        socket.on('ADMIN_LEAVE', (cb)=>{
            const { room } = socket.user as SocketUser;
            socket.leave(room)
            cb({code: 0})
        })
        socket.on('ROOM_JOIN', async (cb)=>{
            const { room, id, name } = socket.user as SocketUser;
            const $SQL_ROOM = `SELECT user_id, room_max, blocked FROM room WHERE room=?;`;
            const $ROOM = await pool<RowDataPacket[]>($SQL_ROOM, [room])
            if(!$ROOM.length) return socket.emit('ALERT', { code: 1, msg: '대화방 정보가 없습니다.', note: '존재하지 않거나 삭제된 방입니다.' })
            const { user_id, room_max, blocked } = $ROOM[0];
            const $BLOCK = await ROOM_BLOCK_CHECK(socket.id, blocked)
            if($BLOCK.code !== 0) return cb($BLOCK)
            const $USER = await SOCKET_ROOM_USER(room)
            if(user_id === id){
                const $SQL_UPDATE = `UPDATE room SET updated=NOW() WHERE room=?;`;
                await pool($SQL_UPDATE, [room])
                await SOCKET_UPDATE(socket, { state: $SOCKET_STATE['8_HOST'] })
            }else{
                if(room_max <= $USER.room_now) return socket.emit('ALERT', { code: 1, msg: '대화방에 참여할 수 없습니다.', note: '참여자 수를 확인해주세요.' })
                await SOCKET_UPDATE(socket, { state: $SOCKET_STATE['2_CHAT'] })
            }
            socket.join(room) // 방 참여
            IO.to(room).emit('ROOM_MESSAGE', { status: 'JOIN', name })
            await ROOM_USER_UPDATE(IO, socket)
            cb({ code: 0 })
        })
        socket.on('ROOM_USER', async ()=>{
            await ROOM_USER_UPDATE(IO, socket)
        })
        socket.on('ROOM_BLOCK', async ({ room, target_socket, target_name })=>{ // 차단
            await SOCKET_UPDATE_TARGET(target_socket, { num: '', room: '', state: $SOCKET_STATE['0_WAIT'] })
            socket.to(target_socket).emit('ROOM_BLOCK')
            IO.in(target_socket).socketsLeave(room);
            IO.to(room).emit('ROOM_MESSAGE', { status: 'BLOCK', name: target_name })
            await ROOM_USER_UPDATE(IO, socket)
        })
        socket.on('ROOM_LEAVE', async (cb)=>{
            const { room, name } = socket.user as SocketUser;
            socket.leave(room);
            await SOCKET_UPDATE(socket, { state: $SOCKET_STATE['0_WAIT'] });
            IO.to(room).emit(`ROOM_MESSAGE`, { status: 'LEAVE', name });
            await ROOM_USER_UPDATE(IO, socket)
            cb({ code: 0, msg: '채팅방을 나갔습니다.' });
        })
        // socket.on('ROOM_DELETE', async ({ num, room })=>{
        //     IO.socketsLeave(num); // 방 안의 모든 소켓 방에서 나가기
        //     IO.socketsLeave(room);
        //     const $USER = await SOCKET_ROOM_USER(room);
        //     for (const e of $USER.room_user) {
        //         await SOCKET_UPDATE(e.socket, { num: '', room: '', status: 0 });
        //     }
        //     IO.to(room).emit('ROOM_MESSAGE', { status: 'DELETE' })
        // })
    })
}

export default socket_room;