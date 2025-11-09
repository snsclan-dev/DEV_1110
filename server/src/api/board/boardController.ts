import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import { asyncHandler, pooling, transaction } from "config";
import type { User } from "types";
import { checkImage, checkInput, checkEditor, pagination } from "modules";

type Params = {
    room: string;
    menu: string;
    category: string;
    page: string | number;
}
export const boardList = async (req: Request, res: Response)=>{
    const { room, menu, category, page } = req.query, { id } = req.user as User;
    const $DATA = await getList({ room, menu, category, page } as Params)
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.cookie(process.env.APP_NAME!, '', { maxAge: 0 });
    res.clearCookie(process.env.APP_NAME!);
    res.json({ code: 0, $DATA })
}
export const getList = async ({ room, menu, category, page }: Params)=>{
    await transaction(async (conn)=>{
        const $SQL_COUNT = `SELECT COUNT(*) AS count FROM board WHERE room=?;`;
        const $COUNT = await pooling<RowDataPacket[]>(conn, $SQL_COUNT, [room])
        const $PAGING = pagination($COUNT[0].count, page, 4, 10);
        const $SQL_LIST = `SELECT * FROM board WHERE room=? ORDER BY updated DESC LIMIT ${$PAGING.viewList} OFFSET ${$PAGING.offset};`;
        const $LIST = await pooling<RowDataPacket[]>(conn, $SQL_LIST, [room])
        return { list: $LIST, paging: $PAGING }
    })
}
export const boardWrite = async (req: Request, res: Response)=>{
    const { room, menu, category, editor } = req.body;
    const $CHECK = checkInput(req.body)
    if($CHECK.code !== 0) return res.json($CHECK)
    const { board_title, price, period, image, tag, state } = $CHECK;
    // const $IMAGE = await checkImage({ folder: room, input: image as string });
    // if($IMAGE.code) return res.json($IMAGE)
    const $EDITOR = await checkEditor({ type: "board", folder: room, editor: editor });
    if($EDITOR.code) return res.json($EDITOR);

    const $DATA = await getWrite({ room, menu, category } as Params)
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.cookie(process.env.APP_NAME!, '', { maxAge: 0 });
    res.clearCookie(process.env.APP_NAME!);
    res.json({ code: 0, $DATA })
}
export const getWrite = async ({ room, menu, category }: Params)=>{
    await transaction(async (conn)=>{
        const $SQL_WRITE = `INSERT INTO ${room}(room, menu, category, user_id, title, image, price, period, note, tag, state, user_ip) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        await pooling(conn, $SQL_WRITE, [room, menu, category])
        const $NUM = await pooling<RowDataPacket[]>(conn, `SELECT LAST_INSERT_ID() AS num;`, [])
        if(!$NUM.length) return { code: 2, msg: '게시판 글 등록 오류!' }
        if($NUM.length){
            setTimeout(()=>{
                return { code:0, msg: '글을 등록하였습니다.', num: $NUM[0].num } 
            }, 600)
            // const $URL = `${process.env.APP_URL}/${room}/read/${menu}/${category}/${$NUM[0].num}`;
            // telegram({ msg: `[ 새로운 글 알림 ] ${$INFO.app_name} > ${$INFO.menu_name} > ${$INFO.category_name} > ${$NUM[0].num}\n${board_title}\n${$URL}`})
        }
    })
}