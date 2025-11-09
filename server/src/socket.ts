import "dotenv/config";
import { createAdapter } from "@socket.io/redis-adapter";

import { $REDIS } from "config/redis";
import { IO } from "config/socket";

import socket_dev from "api/socket/socket_dev";
import socket_app from "api/socket/socket_app";
import socket_room from "api/socket/socket_room";
import socket_chat from "api/socket/socket_chat";

const subClient = $REDIS.duplicate();
Promise.all([subClient.connect()]).then(() => {
    IO.adapter(createAdapter($REDIS, subClient));
});

socket_app(IO);
socket_room(IO);
socket_chat(IO);

if (process.env.NODE_ENV === 'development') socket_dev(IO);