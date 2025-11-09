import cookies from "js-cookie";
import { create, StateCreator } from "zustand";
import { io, Socket } from "socket.io-client";
import { socketData, getDistance } from "modules";
import { $APP_STATUS } from "components/app";
import type { Popup, CodeData, User, ChatMessage, RoomData, RoomMessage } from "types";

const $SOCKET_OPTION = { auth: { token: cookies.get(process.env.NEXT_PUBLIC_APP_NAME!) }, path: '/socket/', transports: ['websocket'], withCredentials: true, autoConnect: false, };
const $SOCKET: Socket = io(process.env.NEXT_PUBLIC_SERVER_SOCKET, $SOCKET_OPTION); // development

type Position = { id: number | null;  latitude: number | null; longitude: number | null; }
const $POSITION: Position = { id: null, latitude: null, longitude: null } // id: watchPosition id
const geoLocation = (set: Parameters<StateCreator<StoreUser>>[0], user: User): void => {
    const startWatching = (highAccuracy: boolean) => {
        if ($POSITION.id !== null) {
            navigator.geolocation.clearWatch($POSITION.id); // 중복 방지
            $POSITION.id = null;
        }
        $POSITION.id = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            if ($POSITION.latitude === null && $POSITION.longitude === null) {
                set((state) => ({ user: { ...state.user, location: { latitude, longitude } } })) // client location
                if (user.id) $SOCKET.emit('USER_LOCATION', { id: user.id, location: `${latitude},${longitude}` }) // DB user login location update
            }
            // 거리 계산 (이전 위치와 현재 위치)
            if ($POSITION.latitude !== null && $POSITION.longitude !== null) {
                const $DISTANCE = getDistance({ latitude: $POSITION.latitude, longitude: $POSITION.longitude }, { latitude, longitude });
                if ($DISTANCE < 10) return; // 10m 이내이면 위치 업데이트하지 않음
                if ($DISTANCE >= 1000 && highAccuracy) { // 1km 이상 거리일 때 highAccuracy가 true라면 재등록
                    $POSITION.latitude = latitude;
                    $POSITION.longitude = longitude;
                    startWatching(false); // 정확도 낮게 재등록
                    return;
                }
                if ($DISTANCE < 1000 && !highAccuracy) { // 1km 미만 거리일 때 highAccuracy가 false라면 재등록
                    $POSITION.latitude = latitude;
                    $POSITION.longitude = longitude;
                    startWatching(true); // 정확도 높게 재등록
                    return;
                }
            }
            $POSITION.latitude = latitude;
            $POSITION.longitude = longitude;
            const location = { latitude, longitude };
            $SOCKET.emit('SOCKET_LOCATION', { location }); // socket user realtime location update
        }, (err: GeolocationPositionError) => {
            set((state) => ({ user: { ...state.user, location: null } })) // location off
            storeApp.setState({ state: $APP_STATUS['0_NAME'] })
            $SOCKET.emit('SOCKET_LOCATION', { location: null });
        }, { enableHighAccuracy: highAccuracy, maximumAge: 30000, timeout: 15000 });
    };
    startWatching(false); // 초기화
};
// 권한 상태 감지 로직
const changeLocation = async (set: Parameters<StateCreator<StoreUser>>[0], user: User)=>{
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
    const changeGeo = ()=>{
        $POSITION.latitude = null; $POSITION.longitude = null;
        geoLocation(set, user);
    }
    if (permissionStatus.state === 'granted') changeGeo();
    if (permissionStatus.state === 'prompt') geoLocation(set, user); // 사용자 선택을 대기하고 허용 시 자동으로 위치 갱신
    permissionStatus.onchange = () => {
        if (permissionStatus.state === 'granted') changeGeo();
    };
}
type Menu = { tab: 'MENU' | 'CHAT' | 'MESSENGER' | 'BOARD'; chat: boolean; messenger: boolean; board: boolean; }
type StoreApp = {
    state: number; // 0: name, 1: room, 
    menu: Menu;
    loading: boolean;
    modal: any;
    popup: Popup | null;
    confirm: Popup | null;
    editorView: boolean;
    setState: (state: number)=> void;
    setMenu: (data: Partial<Menu>)=> void;
    setLoading: (time: number | boolean) => void;
    setModal: (data: any)=>void;
    setPopup: (data: Popup | null)=> void;
    setConfirm: (data: Popup | null) => void;
    seteditorView: (data: boolean)=> void;
}
export const storeApp = create<StoreApp>((set)=> ({
    state: 0, menu: { tab: 'MENU', chat: false, messenger: false, board: false }, loading: false, modal: null, popup: null, confirm: null, editorView: false,
    setState: (num)=> set({ state: num }),
    setMenu: (data)=> set((state)=> ({ menu: { ...state.menu, ...data } })),
    setLoading: (time = true)=>{
        if(time) set({ loading: true });
        if(!time) return set({ loading: false });
        if(typeof time === 'number') setTimeout(() => set({ loading: false }), time);
    },
    setModal: (data)=>{ set({ modal: data }) },
    setPopup: (data)=>{ set({ popup: data }) },
    setConfirm: (data)=>{ set({ confirm: data }) },
    seteditorView: (data)=>{ set({ editorView: data }) },
}))
export type StoreUser = {
    user: User;
    socket: Socket;
    initUser: (user : User)=> void;
    // getSocket: ()=> void;
    setUser: (data: Partial<User>)=> void;
}
export const storeUser = create<StoreUser>((set, get)=>({
    user: { id: null, name: null, level: 0, ip: null, location: null }, socket: $SOCKET,
    initUser: (user) => set({ user }),
    setUser: (data) => set((state) => ({ user: { ...state.user, ...data } })),
    // getSocket: () => {
    //     const { user } = get();
    //     $SOCKET.connect();
    //     $SOCKET.on('connect', () => {
    //         set({ socket: $SOCKET });
    //         $SOCKET.emit('SOCKET_CREATE', { id: user.id, level: user.level }, (data: CodeData) => {
    //             const $DATA = socketData(data);
    //             if(!$DATA) return storeApp.getState().setPopup({ code: 2, msg: '서버가 응답하지 않습니다.', note: '오류(코드): CLIENT_SOCKET_CREATE' });
    //             changeLocation(set, user)
    //         });
    //     });
    //     $SOCKET.on('disconnect', (reason) => {
    //         storeApp.getState().setPopup({ code: 2, msg: '서버와 연결이 끊어졌습니다.', note: '오류(코드): CLIENT_SOCKET_DISCONNECT' });
    //     });
    // },
}))
type StoreChat = {
    room: RoomData;
    roomStatus: string | RoomMessage;
    roomUser: User[];
    message: ChatMessage[];
    setRoom: (data: RoomData)=> void;
    setRoomStatus: (data: string | RoomMessage)=> void;
    setRoomUser: (data: User[])=> void;
    setMessage: (data: ChatMessage)=> void;
    clear: ()=> void;
}
export const storeChat = create<StoreChat>((set)=>({
    room: { room: '', private: [] }, roomStatus: 'WAIT', roomUser: [], message: [],
    setRoom: (data) => set((state) => ({ room: { ...state.room, ...data } })),
    setRoomStatus: (data) => set({ roomStatus: data }),
    setRoomUser: (data) => set({ roomUser: data }),
    setMessage: (data: ChatMessage) => set(state => {
        const next = [...state.message, data];
        return { message: next.length > 100 ? next.slice(-20) : next };
    }),
    clear: ()=> set({ message: [] }),
}))