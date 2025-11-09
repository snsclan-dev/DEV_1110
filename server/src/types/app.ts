export type Location = {
    latitude: number;
    longitude: number;
}
export interface User { // client = server
    id: string | null;
    name?: string | null;
    level: number;
    ip: string | null;
    location?: Location | null;
}
export interface SocketUser extends User {
    // socket: string; // socket.id
    socketId: string; // socket.id
    num: string; // 대기실
    room: string; // 대화방
    state: number; // 0: 대기, 1: 참여, 2: 방장
}
export type CodeData = {
    code: number;
    [key: string]: any;
}