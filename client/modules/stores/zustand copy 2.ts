import { create } from "zustand";
import type { Popup, User, ChatMessage, RoomData, RoomMessage } from "types";

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
    initUser: (user : User)=> void;
    setUser: (data: Partial<User>)=> void;
}
export const storeUser = create<StoreUser>((set, get)=>({
    user: { id: null, name: null, level: 0, ip: null, location: null },
    initUser: (user) => set({ user }),
    setUser: (data) => set((state) => ({ user: { ...state.user, ...data } })),
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
type StoreRoom = {
    room: RoomData;
    roomUser: User[];
    message: ChatMessage[];
    setRoom: (data: RoomData)=> void;
    setRoomUser: (data: User[])=> void;
    setMessage: (data: ChatMessage)=> void;
    clear: ()=> void;
}
export const storeRoom = create<StoreRoom>((set)=>({
    room: { room: null }, roomUser: [], message: [],
    setRoom: (data) => set((state) => ({ room: { ...state.room, ...data } })),
    setRoomUser: (data) => set({ roomUser: data }),
    setMessage: (data: ChatMessage) => set(state => {
        const next = [...state.message, data];
        return { message: next.length > 100 ? next.slice(-20) : next };
    }),
    clear: ()=> set({ message: [] }),
}))