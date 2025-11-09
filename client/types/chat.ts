export type ChatName = string | null;
export type RoomMessage = 'WAIT' | 'CHAT' | 'ADMIN' | 'CREATE' | 'JOIN' | 'LEAVE' | 'BLOCK' | 'DELETE' | 'END';
export type RoomData = { // DB room table
    room: string | null;
    [key: string]: any;
}
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