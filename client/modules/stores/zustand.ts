import { create } from "zustand";
import type { Popup, User, ChatMessage, ChatName, RoomData } from "types";

type StoreApp = {
    // status: number; // 0: name, 1: room, 
    loading: boolean;
    popup: Popup | null;
    confirm: Popup | null;
    editorView: boolean;
    // setStatus: (status: number)=> void;
    setLoading: (time: number | boolean) => void;
    setPopup: (data: Popup | null)=> void;
    setConfirm: (data: Popup | null) => void;
    seteditorView: (data: boolean)=> void;
}
export const storeApp = create<StoreApp>((set)=> ({
    loading: false, popup: null, confirm: null, editorView: false,
    // setStatus: (num)=> set({ status: num }),
    setLoading: (time = true)=>{
        if(time) set({ loading: true });
        if(!time) return set({ loading: false });
        if(typeof time === 'number') setTimeout(() => set({ loading: false }), time);
    },
    setPopup: (data)=>{ set({ popup: data }) },
    setConfirm: (data)=>{ set({ confirm: data }) },
    seteditorView: (data)=>{ set({ editorView: data }) },
}))
export type StoreUser = {
    user: User;
    initUser: (user : User)=> void;
    setUser: (data: Partial<User>)=> void;
}
export const storeUser = create<StoreUser>((set)=>({
    user: { id: null, name: null, level: 0, ip: null, location: null },
    initUser: (user) => set({ user }),
    setUser: (data) => set((state) => ({ user: { ...state.user, ...data } })),
}))
type StoreChat = {
    room: RoomData;
    roomUser: User[];
    message: ChatMessage[];
    setRoom: (data: RoomData)=> void;
    setRoomUser: (data: User[])=> void;
    setMessage: (data: ChatMessage)=> void;
    clear: ()=> void;
}
type Chat = {
    chat: { name: ChatName, status: number };
    setChat: (data: { name?: ChatName, status?: number} )=> void;
}
export const storeChat = create<StoreChat & Chat>((set)=>({
    chat: { name: null, status: 0 }, room: { room: null }, roomUser: [], message: [],
    setChat: (data) => set((state) => ({ chat: { ...state.chat, ...data } })),
    setRoom: (data) => set((state) => ({ room: { ...state.room, ...data } })),
    setRoomUser: (data) => set({ roomUser: data }),
    setMessage: (data: ChatMessage) => set(state => {
        const next = [...state.message, data];
        return { message: next.length > 100 ? next.slice(-20) : next };
    }),
    clear: ()=> set({ message: [] }),
}))
export const storeRoom = create<StoreChat>((set)=>({
    room: { room: null, status: 0 }, roomUser: [], message: [],
    setRoom: (data) => set((state) => ({ room: { ...state.room, ...data } })),
    setRoomUser: (data) => set({ roomUser: data }),
    setMessage: (data: ChatMessage) => set(state => {
        const next = [...state.message, data];
        return { message: next.length > 100 ? next.slice(-20) : next };
    }),
    clear: ()=> set({ message: [] }),
}))