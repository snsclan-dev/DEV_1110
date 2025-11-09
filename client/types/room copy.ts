export type RoomMenu = 'info' | 'list' | 'chat' | 'messenger' | 'board';
export type RoomStatus = 'ROOM' | 'NAME' | 'WAIT' | 'CHAT';
export type Room = { // DB room table
    // num: number;
    room: string | null;
    // title: string;
    // note: string;
    // user_id: string;
    // status: number;
    // room_wait: number;
    // room_now: number;
    // room_max: number;
    // [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    [key: string]: number | string | null;
}
export type Message = { // 대화방(채팅) 메세지 관련 타입
    id?: string;
    name?: string;
    notice?: string;
    message?: string;
    image?: string[];
    video?: string[];
    status?: string;
}