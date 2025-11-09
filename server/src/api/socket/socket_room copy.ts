import { Server } from "socket.io"
import { RowDataPacket } from "mysql2";
import { $FILE_UPLOAD, pool } from "config";
import { SOCKET_FIND, SOCKET_LIST, SOCKET_UPDATE, SOCKET_ROOM_USER } from "modules";
import type { CodeData, SocketUser, User } from "types";

// socket router
const socket_room = (IO: Server)=>{
    IO.on("connection", (socket) => {
        socket.on('ROOM', async ({ num, room })=>{ // Room_Info 대화방 정보
            // console.log('ROOM :', num, room);
            const $NUM = String(num);
            socket.join($NUM) // 대기실 참여
            socket.user = { ...socket.user, num: $NUM, room } as SocketUser // 세션 저장
            const $LIST = await SOCKET_ROOM_USER(room)
            // console.log('ROOM :', $LIST);///
            IO.to($NUM).emit('ROOM', $LIST)
            // IO.to($NUM).emit('ROOM', { list: $LIST.list, room: { room_wait: $LIST.room_wait, room_now: $LIST.room_now, status: $LIST.status } })
            // IO.to($NUM).emit('ROOM', { list: $LIST.list, room_wait: $LIST.room_wait, room_now: $LIST.room_now, status: $LIST.status })
        })
        socket.on('ROOM_ENTER', async ({ room, id, name }: { room: string, id: string, name: string }, cb: (res: CodeData)=> void)=>{
            const $LIST = await SOCKET_LIST()
            const $FIND = $LIST.find((e)=> e.room === room && e.name === name)
            if($FIND) return cb({ code: 1, msg: '이미 사용중인 대화명입니다.'})
            const $SQL_ROOM = `SELECT room FROM room WHERE room=?;`;
            const $ROOM = await pool<RowDataPacket[]>($SQL_ROOM, [room])
            if (!$ROOM.length) return cb({ code: 1, msg: "존재하지 않거나 삭제된 방입니다." });
            await SOCKET_UPDATE(socket.id, { room, id, name })
            cb({ code: 0, room: $ROOM[0].room });
        })
        socket.on('ROOM_JOIN_USER', async ({ num, room, name }, cb)=>{ // 유저 입장 status: 2
            const $SQL_ROOM = `SELECT room_max FROM room WHERE room=?;`;
            const $ROOM = await pool<RowDataPacket[]>($SQL_ROOM, [room])
            if(!$ROOM.length) return socket.emit('ALERT', { code: 1, msg: '대화방 정보가 없습니다.' })
            const $CHECK = await SOCKET_ROOM_USER(room)
            if($ROOM[0].room_max <= $CHECK.room.room_now) return socket.emit('ALERT', { code: 1, msg: '대화방에 참여할 수 없습니다. (참여자 수)\n방장만 참여가 가능합니다.' })
            await SOCKET_UPDATE(socket.id, { room, status: 2 })
            const $NUM = String(num)
            socket.leave($NUM) // 대기실 나가기
            socket.join(room)
            IO.to(room).emit('ROOM_STATUS', { status: 'JOIN', notice: `[ ${name} ]님이 입장하였습니다.`})
            cb({ code: 0 })
        })




        socket.on('ROOM_USER', async ({ num, room })=>{ // 대화방 참여자
            const $LIST = await SOCKET_ROOM_USER(room)
            if(num){
                const $NUM = String(num)
                IO.to($NUM).emit('ROOM_USER', $LIST)
            }
            IO.to(room).emit('ROOM_USER', $LIST)
        })



        // chat
        socket.on('CHAT_MESSAGE', async ({ message })=>{
            const $USER = await SOCKET_FIND(socket.id)
            if(!$USER) return socket.emit('ALERT', { code: 1, msg: '이용자 정보가 없습니다. 다시 접속해 주세요.'})
            const { room, id, name } = $USER;
            IO.to(room).emit('CHAT_MESSAGE', { id, name, message: message.substring(0, 100) });
        })
        socket.on('CHAT_IMAGE', async ({ image }) => {
            if(image.length > $FILE_UPLOAD.chat) return socket.emit('ALERT', {msg: `이미지는 최대 ${$FILE_UPLOAD.chat}개까지 동시에 전송이 가능합니다.`});
            const $USER = await SOCKET_FIND(socket.id)
            if(!$USER) return socket.emit('ALERT', { code: 1, msg: '이용자 정보가 없습니다. 다시 접속해 주세요.'})
            const { room, id, name } = $USER;
            IO.to(room).emit('CHAT_IMAGE', { id, name, image });
        })
        socket.on('CHAT_VIDEO', async ({ video }) => {
            if(video.length > $FILE_UPLOAD.chat) return socket.emit('ALERT', {msg: `동영상은 최대 ${$FILE_UPLOAD.chat}개까지 동시에 전송이 가능합니다.`});
            const $USER = await SOCKET_FIND(socket.id)
            if(!$USER) return socket.emit('ALERT', { code: 1, msg: '이용자 정보가 없습니다. 다시 접속해 주세요.'})
            const { room, id, name } = $USER;
            IO.to(room).emit('CHAT_VIDEO', { id, name, video });
        })
    })
}

export default socket_room;