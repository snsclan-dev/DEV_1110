import { Request, Response, Router } from "express";
import { RowDataPacket } from "mysql2";
import { asyncHandler, checkAdmin, pool, pooling, transaction, userUpdate } from "config";
import { checkInput, pagination, randomString, ROOM_COUNT, SOCKET_FIND, SOCKET_LIST, SOCKET_ROOM_USER } from "modules";
import { $ROOM_COUNT, ROOM_LIST } from "modules/room";
import type { RequestQuery, User } from "types";

const router = Router();

// router.use((req: Request, res, next)=>{
//     const { id, level } = req.user as User;
//     if (!id) return res.json({ code: 9, msg: "로그인이 필요합니다." });
//     if (!checkAdmin(level)) return res.json({ code: 1, msg: "운영자가 아닙니다." });
//     next();
// })
router.get('/check/:room', asyncHandler(async (req: Request, res: Response)=>{
    const { id, level } = req.user as User;
    const { room } = req.params
    console.log('/check :', room);
    // const $SQL_ROOM = `SELECT num, room, title, note, user_id, room_max, blocked, updated FROM room WHERE room=?;`;
    const $SQL_ROOM = `SELECT num, room, title, note, user_id, room_max, blocked, updated FROM room WHERE room_code=?;`;
    const $ROOM = await pool<RowDataPacket[]>($SQL_ROOM, [room])
    if(!$ROOM.length) return res.json({ code: 1, msg: '대화방 정보가 없습니다.', note: '존재하지 않거나 삭제된 방입니다.' })
    res.json({ code: 0, room: $ROOM[0] })
}))


router.get('/list/:page', asyncHandler(async (req: Request, res: Response)=>{
    const { id, level } = req.user as User, { page } = req.params;
    const $SQL_VIEW = checkAdmin(level) ? '' : `WHERE R.user_id=?`;
    await transaction(async (conn)=>{
        const $SQL_COUNT = `SELECT COUNT(*) AS count FROM room AS R ${$SQL_VIEW};`;
        const $COUNT = await pooling<RowDataPacket[]>(conn, $SQL_COUNT, [id])
        const $PAGING = pagination($COUNT[0].count, page, 4, 10);
        const $SQL_LIST = `SELECT R.*, U.name, U.level FROM room AS R LEFT JOIN user AS U ON R.user_id = U.id ${$SQL_VIEW} ORDER BY user_id, updated DESC LIMIT ${$PAGING.viewList} OFFSET ${$PAGING.offset};`
        const $LIST = await pooling<RowDataPacket[]>(conn, $SQL_LIST, [id])
        const $REDIS = await SOCKET_LIST()
        const $DATA = ROOM_LIST($LIST, $REDIS)
        res.json({ code: 0, list: $DATA, paging: $PAGING });
    })
}))
// router.get('/info/:room', async (req: Request, res: Response)=>{
//     const { id, ip, level } = req.user as User, { room } = req.params;
//     const $SQL_INFO = `SELECT * FROM room WHERE room=?`;
//     const $INFO = await pool<RowDataPacket[]>($SQL_INFO, [room]);
//     if (!$INFO.length) return res.json({ code: 1, msg: "존재하지 않거나 삭제된 방입니다." });
//     const $USER = await SOCKET_ROOM_USER(room)
//     const $ROOM = { ...$INFO[0], ...$USER.room }
//     res.json({ code: 0, room: $ROOM });
// })
router.post('/code', async (req, res)=>{ // check room join code
    const { room, room_pass } = req.body
    const $CHECK = checkInput({ room_pass: room_pass })
    if($CHECK.code !== 0) return res.json($CHECK)
    const $SQL_PASS = `SELECT room_pass FROM room WHERE room=?;`;
    const $PASS = await pool<RowDataPacket[]>($SQL_PASS, [room])
    if($PASS[0].room_pass !== room_pass) return res.json({ code: 1, msg: '대화방 비밀번호가 틀립니다.' })
    res.json({code: 0})
})
router.post('/create', asyncHandler(async (req: Request, res: Response)=>{
    const { id, level } = req.user as User;
    if(!id) return res.json({ code: 1, msg: '로그인이 필요합니다. '})
    const $CHECK = checkInput(req.body)
    if($CHECK.code !== 0) return res.json($CHECK)
    const { title, note, room_pass } = $CHECK;
    await transaction(async (conn)=>{
        const $SQL_COUNT = `SELECT COUNT(*) AS count FROM room WHERE user_id=?;`;
        const $COUNT = await pooling<RowDataPacket[]>(conn, $SQL_COUNT, [id]);
        const $LEVEL = ROOM_COUNT(level);
        if (!checkAdmin(level) && $COUNT[0].count >= $LEVEL.create) return res.json({ code: 1, msg: `대화방 만들기는 최대 ${$LEVEL.create}개까지 가능합니다.`, note: `현재 만들어진 방은 ${$COUNT[0].count}개 입니다.` });
        const $SQL_CREATE = `INSERT INTO room(room, title, note, user_id, room_max, room_pass) VALUES(?, ?, ?, ?, ?, ?);`;
        await pooling(conn, $SQL_CREATE, [randomString(20), title, note, id, $LEVEL.max, room_pass]);
        res.json({ code: 0, msg: "채팅방을 만들었습니다." });
    })
}))
router.post('/modify', asyncHandler(async (req: Request, res: Response)=>{
    const { id, level } = req.user as User;
    console.log(req.body);///
    if(!id) return res.json({ code: 1, msg: '로그인이 필요합니다. '})
    const $CHECK = checkInput(req.body)
    if($CHECK.code !== 0) return res.json($CHECK)
    const { room, title, note, room_pass, user_id } = $CHECK;
    if (!checkAdmin(level) && user_id !== id) return res.json({ code: 1, msg: "방장이 아닙니다." });
    const $SQL_MODIFY = `UPDATE room SET title=?, note=?, room_pass=? WHERE room=?;`;
    await pool($SQL_MODIFY, [title, note, room_pass, room])
    res.json({ code: 0, msg: "채팅방이 수정되었습니다." });
}))
router.post('/block', asyncHandler(async (req: Request, res: Response)=>{
    const { id, level } = req.user as User, { room, target_socket, host_id, name } = req.body;
    const $FIND = await SOCKET_FIND(target_socket)
    if(!$FIND) return res.json({ code: 1, msg: '해당하는 사용자 정보가 없습니다.'})
    // if(!checkAdmin(user_level)){
    //     if(host_id !== login_id) return res.json({code: 1, msg: '방장이 아닙니다.'})
    //     if(host_id === $FIND.id || $FIND.name === name) return res.json({ code: 1, msg: '방장(본인)은 차단할 수 없습니다.'})
    // }
    // if(checkAdmin($FIND.level)) return res.json({ code: 1, msg: '관리자는 차단할 수 없습니다.'})
    await transaction(async (conn)=>{
        const $SQL_BLOCK = `SELECT user_id, blocked FROM room WHERE room=?;`;
        const $BLOCK = await pooling<RowDataPacket[]>(conn, $SQL_BLOCK, [room])
        const { user_id, blocked } = $BLOCK[0];
        if (user_id !== id) return res.json({ code: 1, msg: "방장이 아닙니다." });
        if (user_id === $FIND.id) return res.json({ code: 1, msg: "본인은 차단할 수 없습니다." });
        const $BLOCK_LIST = blocked ? blocked.split(',') : [];
        if ($BLOCK_LIST.length > $ROOM_COUNT.block) return res.json({ code: 1, msg: "차단 목록이 가득 찼습니다." });
        const $INPUT = $FIND.id ? [ $FIND.id, $FIND.ip ] : [ $FIND.ip ]
        const $FILTER = $INPUT.filter((e)=> !$BLOCK_LIST.includes(e))
        if($FILTER.length){
            const $SQL_UPDATE = `UPDATE room SET blocked=? WHERE room=?;`;
            await pooling(conn, $SQL_UPDATE, [$BLOCK_LIST.concat($FILTER).join(','), room])
        }
        // res.json({ code: 0, msg: `[ ${$FIND.name} ]님을 차단하였습니다.` });
        res.json({ code: 0 });
    })
}))

export default router;