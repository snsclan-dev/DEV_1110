import { Server, Socket } from "socket.io";
import { $REDIS } from "config/redis";
import type { SocketUser, User } from "types";

const $REDIS_USER = `${process.env.APP_NAME!.toUpperCase()}_USER`;

export const $SOCKET_STATE = { '0_WAIT': 0, '1_FIND': 1, '2_CHAT': 2, '8_HOST': 8, '9_ADMIN': 9 } // 0: 대기, 2: 채팅(참여자), 8: 방장(온라인)

export const SOCKET_LIST = async (): Promise<SocketUser[]> => {
    try{
        const $LIST = await $REDIS.HVALS($REDIS_USER);
        return $LIST.map((e)=>JSON.parse(e));
    } catch (err) {
        throw new Error('오류(코드): SOCKET_LIST');
    }
};
export const SOCKET_CREATE = async (socket: Socket, user: User)=>{
    const $SOCKET_USER = { socket: socket.id, num: '', room: '', state: $SOCKET_STATE['0_WAIT'] }
    // socket.user = { num: '', room: '', status: $SOCKET_STATE['0_WAIT'], level: user.level } as SocketUser;
    socket.user = { level: user.level } as SocketUser;
    try{
        const $CREATE = { ...$SOCKET_USER, ...user }
        await $REDIS.HSET($REDIS_USER, socket.id, JSON.stringify($CREATE));
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
export const SOCKET_USER = (socket: Socket, obj: Partial<SocketUser>)=>{ 
    socket.user = { ...socket.user, ...obj } as SocketUser;
}
export const SOCKET_UPDATE = async (socket: Socket, obj: Partial<SocketUser>)=>{
    const { location, ...rest } = obj;
    socket.user = { ...socket.user, ...rest } as SocketUser; // 세션 저장
    try{
        const $FIND = await SOCKET_FIND(socket.id);
        if(!$FIND) return null;
        const $UPDATE = { ...$FIND, ...obj }
        await $REDIS.HSET($REDIS_USER, socket.id, JSON.stringify($UPDATE))
        return $UPDATE;
    }catch(err){
        throw new Error('오류(코드): SOCKET_UPDATE');
    }
}
export const SOCKET_UPDATE_TARGET = async (socketId: string, obj: Partial<SocketUser>)=>{
    try{
        const $FIND = await SOCKET_FIND(socketId);
        if(!$FIND) return null;
        const $UPDATE = { ...$FIND, ...obj }
        await $REDIS.HSET($REDIS_USER, socketId, JSON.stringify($UPDATE))
        return $UPDATE;
    }catch(err){
        throw new Error('오류(코드): SOCKET_TARGET_UPDATE');
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
    const $WAIT = $LIST.filter((e)=> e.room === room && e.state === $SOCKET_STATE['0_WAIT']);
    const $HOST = $LIST.filter((e)=> e.room === room && e.state === $SOCKET_STATE['8_HOST']);
    const $CHAT = $LIST.filter((e)=> e.room === room && e.state > $SOCKET_STATE['1_FIND']);
    return { room_user: $CHAT, room_wait: $WAIT.length, room_host: $HOST.length, room_now: $HOST.length ? $CHAT.length - 1 : $CHAT.length };
}
export const ROOM_USER_UPDATE = async (IO: Server, socket: Socket)=> {
    const { num, room } = socket.user as SocketUser;
    const $ROOM = await SOCKET_ROOM_USER(room);
    IO.to(room).emit('ROOM_USER', { user: $ROOM });
    IO.to(num).emit('ROOM_USER', { user: $ROOM });
}
export const ROOM_BLOCK_CHECK = async (socketId: string, blocked: string) => {
    const $BLOCK_LIST = blocked ? blocked.split(",") : [];
    if ($BLOCK_LIST.length) {
        const $FIND = await SOCKET_FIND(socketId);
        if ($FIND) {
            const $BLOCK = $BLOCK_LIST.some((e: string) => e === $FIND.ip);
            if ($BLOCK) return { code: 1, msg: "참여할 수 없는 채팅방입니다. (차단)" };
        }
    }
    return { code: 0 };
};