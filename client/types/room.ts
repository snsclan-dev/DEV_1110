import { User } from "./app";

export type RoomMenu = 'CHAT' | 'MESSENGER' | 'BOARD';
export type RoomData = { // DB room table
    room: string | null;
    [key: string]: any;
}
export type RoomUser = {
    room_user: User[];
    room_wait: number;
    room_now: number;
    room_host: number;
}
export type RoomMessage = 'WAIT' | 'CHAT' | 'ADMIN' | 'CREATE' | 'JOIN' | 'LEAVE' | 'BLOCK' | 'DELETE' | 'END';
export type ChatMessage = { // 대화방(채팅) 메세지 관련 타입
    id: string;
    name: string;
    level: number;
    notice?: string;
    message?: string;
    image?: string[];
    video?: string[];
    status?: RoomMessage;
}