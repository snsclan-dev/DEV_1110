import { Server } from "socket.io"
import { RowDataPacket } from "mysql2";
import { pool } from "config";
import { $SOCKET_STATE, SOCKET_LIST, SOCKET_UPDATE, SOCKET_ROOM_USER } from "modules";
import type { CodeData, SocketUser } from "types";

// socket router
const socket_room = (IO: Server)=>{
    IO.on("connection", (socket) => {
        socket.on('CHECK_ROOM', async ({ room }, cb)=>{
            const $SQL_ROOM = `SELECT num, room, title, note, user_id, room_pass, room_max, updated FROM room WHERE room=?;`;
            const $ROOM = await pool<RowDataPacket[]>($SQL_ROOM, [room])
            if(!$ROOM.length) return socket.emit('ALERT', { code: 1, msg: '대화방 정보가 없습니다.', note: '존재하지 않거나 삭제된 방입니다.' })
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
            socket.user = { id, name } as SocketUser; // 세션 등록
            await SOCKET_UPDATE(socket.id, { room, id, name })
            cb({ code: 0 });
        })
        socket.on('ROOM', async ({ num, room })=>{ // 대기실 입장 초기화
            const $NUM = String(num);
            socket.join($NUM);
            socket.user = { ...socket.user, num: $NUM, room } as SocketUser // 세션 저장
            await SOCKET_UPDATE(socket.id, { num: $NUM, room }) // 레디스 저장
            const $USER = await SOCKET_ROOM_USER(room)
            IO.to($NUM).emit('ROOM_USER', { code: 0, user: $USER })
        })
        socket.on('ROOM_UPDATE', async ({ num, room })=>{ // room modify
            const $SQL_ROOM = `SELECT num, room, title, note, user_id, room_max, updated FROM room WHERE room=?;`;
            const $ROOM = await pool<RowDataPacket[]>($SQL_ROOM, [room])
            if($ROOM[0].num) IO.to(String($ROOM[0].num)).emit('ROOM', { room: $ROOM[0] })
        })
        socket.on('ROOM_JOIN', async (cb)=>{
            const { id, num, room, name } = socket.user as SocketUser;
            console.log('socket user 세션 :', socket.user);
            const $SQL_ROOM = `SELECT user_id, room_max FROM room WHERE room=?;`;
            const $ROOM = await pool<RowDataPacket[]>($SQL_ROOM, [room])
            if(!$ROOM.length) return socket.emit('ALERT', { code: 1, msg: '대화방 정보가 없습니다.', note: '존재하지 않거나 삭제된 방입니다.' })
            socket.join(room) // 방 참여
            const $USER = await SOCKET_ROOM_USER(room)
            if($ROOM[0].user_id === id){
                const $SQL_UPDATE = `UPDATE room SET updated=NOW() WHERE room=?;`;
                await pool($SQL_UPDATE, [room])
                await SOCKET_UPDATE(socket.id, { room, status: $SOCKET_STATE['8_HOST'] })
            }else{
                if($ROOM[0].room_max <= $USER.room_now) return socket.emit('ALERT', { code: 1, msg: '대화방에 참여할 수 없습니다.', note: '대화방 참여자가 가득 찼습니다.' })
                await SOCKET_UPDATE(socket.id, { room, status: $SOCKET_STATE['2_CHAT'] })
            }
            IO.to(room).emit('ROOM_MESSAGE', { status: 'JOIN', id, name })
            // IO.to(room).emit('ROOM_MESSAGE', { status: 'JOIN', id }) // 나중에 클라이언트에서 처리하자
            cb({ code: 0 })
        })

        socket.on('ROOM_JOIN_HOST', async ({ num, room, name }, cb)=>{ // 방장 입장 status: 1
            // const $CHECK = await SOCKET_ROOM_USER(room)
            // if($CHECK.host) return socket.emit('ALERT', { code: 1, msg: '대화방에 참여할 수 없습니다. (방장 중복)\n방장은 한명만 입장할 수 있습니다.' })
            const $SQL_UPDATE = `UPDATE chat SET updated=NOW() WHERE room=?;`;
            await pool($SQL_UPDATE, [room])
            socket.join(room) // 방 참여
            await SOCKET_UPDATE(socket.id, { room, status: $SOCKET_STATE['8_HOST'] })
            IO.to(room).emit('ROOM_MESSAGE', { status: 'JOIN', notice: `방장 [ ${name} ]님이 입장하였습니다.`})
            cb({ code: 0 })
        })
        socket.on('ROOM_JOIN_USER', async ({ num, room, name }, cb)=>{ // 유저 입장 status: 2
            const $SQL_ROOM = `SELECT room_max FROM room WHERE room=?;`;
            const $ROOM = await pool<RowDataPacket[]>($SQL_ROOM, [room])
            if(!$ROOM.length) return socket.emit('ALERT', { code: 1, msg: '대화방 정보가 없습니다.', note: '존재하지 않거나 삭제된 방입니다.' })
            const $USER = await SOCKET_ROOM_USER(room)
            if($ROOM[0].room_max <= $USER.room_now) return socket.emit('ALERT', { code: 1, msg: '대화방에 참여할 수 없습니다.', note: '대화방 참여자가 가득 찼습니다.' })
            socket.join(room) // 방 참여
            await SOCKET_UPDATE(socket.id, { room, status: $SOCKET_STATE['2_CHAT'] })
            IO.to(room).emit('ROOM_MESSAGE', { status: 'JOIN', notice: `[ ${name} ]님이 입장하였습니다.`}) // 나중에 클라이언트에서 처리하자
            cb({ code: 0 })
        })
        socket.on('ROOM_USER', async ({ num, room })=>{
            const $USER = await SOCKET_ROOM_USER(room);
            IO.to(String(num)).emit('ROOM_USER', { code: 0, user: $USER });
        })
        socket.on('ROOM_LEAVE', async ({ room, name }, cb)=>{
            socket.leave(room);
            const $USER = await SOCKET_UPDATE(socket.id, { room: '', status: $SOCKET_STATE['0_WAIT'] });
            if($USER) IO.to($USER.num).emit(`ROOM_MESSAGE`, { status: 'LEAVE', notice: `[ ${name} ]님이 채팅방을 나갔습니다.` });
            // IO.to(room).emit(`ROOM_MESSAGE`, { status: 'LEAVE', notice: `[ ${name} ]님이 채팅방을 나갔습니다.` });
            cb({ code: 0, msg: '채팅방을 나갔습니다.' });
        })

    })
}

export default socket_room;