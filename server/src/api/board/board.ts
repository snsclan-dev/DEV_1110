import { Request, Response, Router } from "express";
import { RowDataPacket } from "mysql2";
import { asyncHandler, pool, pooling, transaction } from "config";
import { inputHandler } from "config/middlewares";
import { boardQuery, pagination } from "modules";
import type { RequestQuery, User } from "types";

const router = Router(); // /board

router.get('/list', asyncHandler(async (req: Request, res: Response)=>{
    const { room, menu, category, page } = req.query as RequestQuery;
    await transaction(async (conn)=>{
        const $SQL_COUNT = `SELECT COUNT(*) AS count FROM board WHERE room=?;`;
        const $COUNT = await pooling<RowDataPacket[]>(conn, $SQL_COUNT, [room])
        const $PAGING = pagination($COUNT[0].count, page, 10, 10);
        const $SQL_LIST = `SELECT B.*, U.id, U.name, U.level FROM board AS B LEFT JOIN user AS U ON B.user_id = U.id
            WHERE room=? ORDER BY COALESCE(B.updated, B.created) DESC LIMIT ${$PAGING.viewList} OFFSET ${$PAGING.offset};`;
        const $LIST = await pooling<RowDataPacket[]>(conn, $SQL_LIST, [room])
        res.json({ code: 0, list: $LIST, paging: $PAGING })
    })
}))
router.get('/read', asyncHandler(async (req: Request, res: Response)=>{
    const { room, menu, category, num } = req.query as RequestQuery;
    console.log('/board/read :', room, menu, category, num ); ///
    await transaction(async (conn)=>{
        const $SQL_READ = `SELECT * FROM board WHERE num=?;`;
        const $READ = await pooling<RowDataPacket[]>(conn, $SQL_READ, [num])
        if(!$READ.length) return res.json({code: 1, msg: '없거나 삭제된 글입니다.'});
        res.json({ code: 0, read: $READ[0] });
    })
}))
router.post('/write', inputHandler, asyncHandler(async (req: Request, res: Response)=>{
    const { id, level } = req.user as User;
    // const { room, menu, category, board_title, image, editor, price, period } = req.input;
    // console.log('/write :', req.input); ///
    const $NUM = await boardQuery({ type: "INSERT", table: "board", input: req.input });
    // setTimeout(()=>{ res.json({code:0, msg: '글을 등록하였습니다.', num: $NUM }) }, 600)
    // res.json({ code: 0, msg: "글을 등록하였습니다." });
    res.json({ code: 0, msg: "글을 등록하였습니다.", num: $NUM });
}))

export default router;