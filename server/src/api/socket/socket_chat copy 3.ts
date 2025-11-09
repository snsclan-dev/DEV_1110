import { Server } from "socket.io"
import { $FILE_UPLOAD } from "config";
import type { SocketUser } from "types";
import { $SOCKET_STATE, SOCKET_FIND, SOCKET_UPDATE } from "modules";

const socket_chat = (IO: Server)=>{
    IO.on("connection", (socket) => {
        socket.on('CHAT_CREATE', async ({ name }, cb)=>{
            await SOCKET_UPDATE(socket, { room: socket.id, name, state: $SOCKET_STATE['8_HOST'] });
            IO.to(socket.id).emit('ROOM_MESSAGE', { status: 'JOIN', name })
            cb({ code: 0 })
        })
        socket.on('CHAT_JOIN', async ({ room, name }, cb)=>{
            // const { id, level } = socket.user as SocketUser;
            const $FIND = await SOCKET_FIND(room);
            if(!$FIND || $FIND.state === $SOCKET_STATE['0_WAIT']) return cb({ code: 1, msg: '상대방을 찾을 수 없습니다.' })
            for (const $ROOM of socket.rooms) {
                if ($ROOM !== socket.id) {
                    socket.leave($ROOM); // 모든 방 나가기
                }
            }
            socket.join(room) // 1:1 채팅방 입장
            await SOCKET_UPDATE(socket, { room: room, name, state: $SOCKET_STATE['2_CHAT'] })
            IO.to(room).emit('ROOM_MESSAGE', { status: 'JOIN', name })
            cb({ code: 0 })
        })

        socket.on('CHAT_MESSAGE', async ({ message, image = [], video = [] })=>{
            const { room, id, name, level } = socket.user as SocketUser;
            if (!name) return socket.emit("ALERT", { code: 1, msg: "이용자 정보가 없습니다. 다시 접속해 주세요." });
            if (image.length > $FILE_UPLOAD.chat) return socket.emit("ALERT", { msg: `이미지는 최대 ${$FILE_UPLOAD.chat}개까지 동시에 전송이 가능합니다.` });
            if (video.length > $FILE_UPLOAD.chat) return socket.emit("ALERT", { msg: `동영상은 최대 ${$FILE_UPLOAD.chat}개까지 동시에 전송이 가능합니다.` });
            IO.to(room).emit('CHAT_MESSAGE', { id, name, level, message: message?.substring(0, 200), image, video });
        })
    })
}

export default socket_chat;