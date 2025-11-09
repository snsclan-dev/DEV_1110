import { Server } from 'socket.io';
import { SOCKET_LIST, SOCKET_RESET } from 'modules';

// dev
const socket_dev = (IO: Server) => {
    IO.on("connection", (socket) => {

        socket.onAny((eventName) => {
            console.log(`[ ${process.env.APP_NAME} : socket ] event request:`, eventName);
        });

        socket.on('user', async () => {
            const $LIST = await SOCKET_LIST();
            console.log('이용자 목록 :', $LIST);
            console.log('socket.user :', socket.user);
            console.log('참여 :', socket.rooms);
            console.log('소켓 :', IO.sockets.sockets.size || 0, '등록된 이용자 :', $LIST.length);
            console.log('---------------------------------------');
        })
        socket.on('SOCKET_REFRESH', async (cb) => {
            await SOCKET_RESET(IO)
            const $LIST = await SOCKET_LIST();
            console.log('소켓 정리 후 목록 :', $LIST);
            console.log('---------------------------------------');
            cb({code: 0, msg: '동기화 완료'})
        })
    })
}

export default socket_dev;