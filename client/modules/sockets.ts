import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
import { storeApp } from "./stores/zustand";
import { getLocation } from "./utils/location";
import type { CodeData, Popup, User } from "types";

const $SOCKET_OPTION = { auth: { token: Cookies.get(process.env.NEXT_PUBLIC_APP_NAME!) }, path: '/socket/', transports: ['websocket'], withCredentials: true, autoConnect: false, };
export const socket: Socket = io(process.env.NEXT_PUBLIC_SERVER_SOCKET, $SOCKET_OPTION); // development

export const socketConn = (user: User, setPopup: (data: Popup | null)=> void)=>{ // header
    socket.connect();
    socket.on("connect", () => {
        socket.emit("SOCKET_CREATE", { id: user.id, level: user.level }, (data: CodeData) => {
            const $DATA = socketData(data);
            if (!$DATA) return setPopup({ code: 2, msg: "서버가 응답하지 않습니다.", note: "오류(코드): CLIENT_SOCKET_CREATE" });
            getLocation(user) // 위치 서비스 핸들러
        });
    });
    socket.on("disconnect", () => {
        setPopup({ code: 2, msg: "서버와 연결이 끊어졌습니다.", note: "오류(코드): CLIENT_SOCKET_DISCONNECT" });
    });
}
export const socketData = (data: CodeData) =>{ // socket response data
    const { setPopup } = storeApp.getState()
    if(process.env.NODE_ENV === 'development') console.log('SOCKET DATA :', data);
    const { code, msg } = data;
    if(msg) setPopup(data);
    if(code > 0) return null;
    return data;
}