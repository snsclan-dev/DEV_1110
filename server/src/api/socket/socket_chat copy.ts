import { Server } from "socket.io"
import { $FILE_UPLOAD } from "config";
import { SOCKET_FIND } from "modules";

const socket_room = (IO: Server)=>{
    IO.on("connection", (socket) => {
        socket.on('CHAT_MESSAGE_TOTAL', async ({ message, image = [], video = [] })=>{
            const $USER = await SOCKET_FIND(socket.id)
            if (!$USER) return socket.emit("ALERT", { code: 1, msg: "이용자 정보가 없습니다. 다시 접속해 주세요." });
            if (image.length > $FILE_UPLOAD.chat) return socket.emit("ALERT", { msg: `이미지는 최대 ${$FILE_UPLOAD.chat}개까지 동시에 전송이 가능합니다.` });
            if (video.length > $FILE_UPLOAD.chat) return socket.emit("ALERT", { msg: `동영상은 최대 ${$FILE_UPLOAD.chat}개까지 동시에 전송이 가능합니다.` });
            const { room, id, name } = $USER;
            IO.to(room).emit('CHAT_MESSAGE', { id, name, message: message?.substring(0, 200), image, video });
        })
        socket.on('CHAT_MESSAGE', async ({ message })=>{
            const $USER = await SOCKET_FIND(socket.id)
            if(!$USER) return socket.emit('ALERT', { code: 1, msg: '이용자 정보가 없습니다. 다시 접속해 주세요.'})
            const { room, id, name } = $USER;
            IO.to(room).emit('CHAT_MESSAGE', { id, name, message: message.substring(0, 100) });
        })
        socket.on('CHAT_IMAGE', async ({ image }) => {
            console.log('CHAT_IMAGE :', image);
            
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