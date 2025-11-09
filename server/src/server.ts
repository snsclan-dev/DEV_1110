import "dotenv/config";
import app from "config/express";
import { errorHandler } from "config";

import router_app from "api/app/app";
import router_upload from "api/app/upload";

import router_room from "api/room/room";
import router_notice from "api/board/notice";
import router_board from "api/board/board";

const { PORT_SERVER, NODE_ENV, APP_NAME } = process.env;

// dev test
import router_test from "api/app/test";
app.use('/api/test', router_test)


app.use('/api/app', router_app)
app.use('/api/upload', router_upload)

app.use('/api/room', router_room)

// board
app.use('/api/notice', router_notice)
app.use('/api/board', router_board)

app.use(errorHandler);

app.listen(Number(PORT_SERVER!), '0.0.0.0', () => {
    console.log(`[ ${APP_NAME} ] SERVER ON : ${PORT_SERVER} / MODE : ${NODE_ENV}`);
});
