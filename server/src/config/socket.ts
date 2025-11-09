import { Server } from "socket.io";
import app from './express';
import { $SYSTEM_CORS, checkError } from "./systems";
import { socketErrorHandler } from "./middlewares";

const { NODE_ENV, APP_NAME, PORT_SOCKET, JWT_KEY } = process.env;

const SOCKET_SERVER = app.listen(Number(PORT_SOCKET), '0.0.0.0', (err)=>{
    if(err) throw checkError(err, 'SOCKET ON ERROR');
    console.log(`[ ${APP_NAME} ] SOCKET ON : ${PORT_SOCKET} / MODE : ${NODE_ENV}`);
})

export const IO = new Server(SOCKET_SERVER , {
    cors: { origin: Array.isArray($SYSTEM_CORS), methods: ["GET", "POST"], credentials: true },
    path: '/socket/', transports: ["websocket"],
    pingInterval: 10000, pingTimeout: 5000
});

// middlewares
socketErrorHandler(IO);

// IO.use((socket, next) => {
//     try {
//         // 여기에 글로벌 로직이 들어갈 수 있음 (예: 공통 로깅)
//         return next();
//     } catch (err) {
//         const error = new Error("소켓 서버 오류");
//         (error as any).data = { code: 500, msg: "Socket server error" };
//         return next(error);
//     }
// })
// IO.use((socket, next)=>{
//     const $TOKEN = socket.handshake.auth.token;
//     console.log('TOKEN :', $TOKEN);
//     next()
//     // try{
//     //     const decoded = verify($REQ.token, JWT_KEY!)
//     //     socket.data.jwtDecode = decoded;
//     //     console.log('decoded :', decoded);
//     //     next()
//     // }catch(err: unknown){
//     //     console.log('decoded error');
//     // }
// })