import { RowDataPacket } from "mysql2";
import { Request, Response, Router } from "express";
import { asyncHandler, checkAdmin, pooling, transaction } from "config";
import { inputHandler } from "config/middlewares";
import { boardQuery, pagination } from "modules";
import type { RequestQuery, User } from "types";

const router = Router(); // /notice

router.get('/list', asyncHandler(async (req: Request, res: Response)=>{
    const { room, menu, category, page } = req.query as RequestQuery;
    console.log('/notice/list :', room, menu, category, page ); ///
    await transaction(async (conn)=>{
        const $SQL_COUNT = `SELECT COUNT(*) AS count FROM board WHERE room=?;`;
        const $COUNT = await pooling<RowDataPacket[]>(conn, $SQL_COUNT, [room])
        const $PAGING = pagination($COUNT[0].count, page, 4, 10);
        const $SQL_LIST = `SELECT B.*, U.id, U.name, U.level FROM board AS B LEFT JOIN user AS U ON B.user_id = U.id
            WHERE room=? ORDER BY updated DESC LIMIT ${$PAGING.viewList} OFFSET ${$PAGING.offset};`;
        const $LIST = await pooling<RowDataPacket[]>(conn, $SQL_LIST, [room])
        res.json({ code: 0, list: $LIST, paging: $PAGING })
    })
}))
router.use((req: Request, res, next) => {
    const { id, level } = req.user as User;
    if (!id) return res.json({ code: 1, msg: "로그인이 필요합니다." });
    if (!checkAdmin(level)) return res.json({ code: 1, msg: "운영자가 아닙니다." });
    next();
});
router.post('/write', inputHandler(), asyncHandler(async (req: Request, res: Response)=>{
    const test = await boardQuery({ type: "INSERT", table: "board", input: req.input });
    res.json({ code: 0, msg: "공지사항을 등록하였습니다." });
}))

router.post('/modify', inputHandler(), asyncHandler(async (req: Request, res: Response)=>{
    await boardQuery({ type: "UPDATE", table: "board", input: req.input });
    res.json({ code: 0, msg: "공지사항을 수정하였습니다." });
}))

export default router;