import { Server } from "socket.io";
import { $REDIS } from "config/redis";
import type { SocketUser, User } from "types";

const $REDIS_USER = `${process.env.APP_NAME!.toUpperCase()}_USER`;

export const $SOCKET_STATE = { '0_WAIT': 0, '8_HOST': 1, '2_CHAT': 2 } // 0: 대기, 1: 방장(온라인), 2: 채팅(참여자)
// export const $SOCKET_STATE = { '1_WAIT': 1, '2_CHAT': 2, '3_HOST': 3 } // 1: 대기실, 2: 채팅중(참여자), 3: 방장(온라인), 

export const SOCKET_LIST = async (): Promise<SocketUser[]> => {
    try{
        const $LIST = await $REDIS.HVALS($REDIS_USER);
        return $LIST.map((e)=>JSON.parse(e));
    } catch (err) {
        throw new Error('오류(코드): SOCKET_LIST');
    }
};
export const SOCKET_CREATE = async (socketId: string, user: User)=>{
    const $SOCKET_USER = { socket: socketId, num: '', room: '', status: $SOCKET_STATE['0_WAIT'] }
    try{
        const $CREATE = { ...$SOCKET_USER, ...user }
        await $REDIS.HSET($REDIS_USER, socketId, JSON.stringify($CREATE));
    }catch(err){
        throw new Error('오류(코드): SOCKET_CREATE');
    }
}
export const SOCKET_FIND = async (socketId: string): Promise<SocketUser | null> => {
    try {
        const $FIND = await $REDIS.HGET($REDIS_USER, socketId);
        if(!$FIND) return null;
        return JSON.parse($FIND);
    } catch (err) {
        throw new Error('오류(코드): SOCKET_FIND');
    }
};
export const SOCKET_UPDATE = async (socketId: string, obj: Partial<SocketUser>)=>{
    try{
        const $FIND = await SOCKET_FIND(socketId);
        if(!$FIND) return null;
        const $UPDATE = { ...$FIND, ...obj }
        await $REDIS.HSET($REDIS_USER, socketId, JSON.stringify($UPDATE))
        return $UPDATE;
    }catch(err){
        throw new Error('오류(코드): SOCKET_UPDATE');
    }
}
export const SOCKET_DELETE = async (socketId: string)=>{
    const $FIND = await SOCKET_FIND(socketId);
    if(!$FIND) return null;
    await $REDIS.HDEL($REDIS_USER, socketId)
}
export const SOCKET_RESET = async (IO: Server)=>{
    try{
        const $SOCKET: string[] = [];
        const $SIDS = IO.sockets.adapter.sids;
        $SIDS.forEach((_, sid)=> $SOCKET.push(sid));
        const $LIST = await $REDIS.HGETALL($REDIS_USER)
        const $DELETE = Object.keys($LIST).filter((sid)=> !$SOCKET.includes(sid))
        await Promise.all($DELETE.map((sid) => SOCKET_DELETE(sid)));
    }catch(err){
        throw new Error('오류(코드): SOCKET_RESET');
    }
}
export const SOCKET_ROOM_USER = async (room: string)=>{ // DB: room_wait, room_now, room_host
    const $LIST = await SOCKET_LIST();
    const $WAIT = $LIST.filter((e)=> e.room === room && e.status === $SOCKET_STATE['0_WAIT']);
    const $HOST = $LIST.filter((e)=> e.room === room && e.status === $SOCKET_STATE['8_HOST']);
    // const $CHAT = $LIST.filter((e)=> e.room === room && e.status > $SOCKET_STATE['0_WAIT']);
    const $CHAT = $LIST.filter((e)=> e.room === room && e.status === $SOCKET_STATE['2_CHAT']);
    // return { list: $CHAT, room: { room_wait: $WAIT.length, room_now: $CHAT.length, room_host: $HOST.length ? 1 : 0 } };
    return { room_user: $CHAT, room_wait: $WAIT.length, room_now: $CHAT.length, room_host: $HOST.length ? 1 : 0 };
}