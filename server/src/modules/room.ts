import { RowDataPacket } from "mysql2"
import { $SOCKET_STATE } from "./sockets"
import { SocketUser } from "types"

export const $ROOM_COUNT = { block: 100 } // 차단 최대 인원

export const ROOM_COUNT = (level: number)=>{
    // const $COUNT = Math.floor(level / 2)
    if(level <= 3) return { create: 2, max: 2 } // 방 생성 1개, 최대 참여자 2명
    if(level <= 5) return { create: 3, max: 3 }
    if(level <= 10) return { create: 4, max: 5 }
    return { create: 5, max: 10 }
}
export const ROOM_LIST = (mysql: RowDataPacket[], redis: SocketUser[])=>{ // 채팅방 목록 접속자 수 표시
    return mysql.map((e)=>{ 
        const $WAIT = redis.filter((r)=> r.room === e.room && r.state === $SOCKET_STATE['0_WAIT'])
        const $HOST = redis.filter((r)=> r.room === e.room && r.state === $SOCKET_STATE['8_HOST'])
        const $NOW = redis.filter((r)=> r.room === e.room && r.state > $SOCKET_STATE['0_WAIT'])
        return { ...e, room_wait: $WAIT.length,  room_host: $HOST.length, room_now: $NOW.length }
    })
}