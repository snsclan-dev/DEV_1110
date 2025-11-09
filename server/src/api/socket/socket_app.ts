import { Server } from "socket.io"
import { checkAdmin, pool, reqIp } from "config"
import { SOCKET_CREATE, SOCKET_DELETE, SOCKET_UPDATE, SOCKET_ROOM_USER, $SOCKET_STATE, ROOM_USER_UPDATE, checkInput } from "modules"
import type { SocketUser, User } from "types"
import { RowDataPacket } from "mysql2"

const socket_app = (IO: Server)=>{
    IO.on("connection", (socket) => {
        socket.on('SOCKET_CREATE', async ({ id, level }, cb)=>{ // store
            const $USER : User = { id, level, ip: reqIp(socket.handshake) }
            await SOCKET_CREATE(socket, $USER)
            cb({ code: 0 })
        })
        socket.on('SOCKET_LOCATION', async ({ location })=>{ // socket realtime location update
            const $SOCKET = await SOCKET_UPDATE(socket, { location: location ?? null });
            if($SOCKET && $SOCKET.room){ 
                await SOCKET_ROOM_USER(IO, socket)
                // const $USER = await SOCKET_ROOM_USER($SOCKET.room)
                // IO.to($SOCKET.room).emit('ROOM_USER', { user: $USER })
            }
        })
        socket.on('USER_LOCATION', async ({ id, location })=>{ // DB user login location update
            const $SQL_LOCATION = `UPDATE user SET login_location=? WHERE id=?;`; 
            await pool($SQL_LOCATION, [location, id]) // location: `${latitude},${longitude}`
        })
        socket.on('USER_NAME', async ({ name }, cb)=>{ // app state: 0(name), modify name
            const { level } = socket.user as SocketUser;
            if(!checkAdmin(level)){
                const $CHECK = checkInput({ name })
                if($CHECK.code !== 0) return cb($CHECK)
            }
            await SOCKET_UPDATE(socket, { name })
            cb({ code: 0 });
        })
        socket.on("disconnecting", (reason) => {
            for (const room of socket.rooms) {
                if (room !== socket.id) {
                    console.log('disconnecting :', room, socket.id);
                    // socket.to(room).emit("user has left", socket.id);
                }
            }
        });
        socket.on('disconnect', async (reason)=>{
            // IO.to('admin').emit('SOCKET_NOW', { socket: IO.sockets.sockets.size || 0 })
            // console.log('disconnect socket.user :', socket.user);
            // const { id, room, name, level, status } = socket.user as SocketUser;
            const { room, name, state } = socket.user as SocketUser;
            await SOCKET_DELETE(socket.id)
            if(state > $SOCKET_STATE['0_WAIT']) IO.to(room).emit("ROOM_MESSAGE", { status: 'LEAVE', name });
            await ROOM_USER_UPDATE(IO, socket)
        })
    })
}

export default socket_app;