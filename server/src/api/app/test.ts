import { Request, Response, Router } from 'express';
import { pool } from 'config';
import { RowDataPacket } from 'mysql2';

const router = Router();

const data = `[
    {
        "app": "guide",
        "menus": [
        { "menu": "rule", "categories": ["rule"] },
        { "menu": "intro", "categories": ["intro"] }
        ]
    },
    {
        "app": "board",
        "menus": [
        { "menu": "notice", "categories": [] }
        ]
    }
]`;
router.get('/menu', async (req: Request, res: Response)=>{
    console.log('/menu 감지');
    
    // const sql = `SELECT * FROM app FOR JSON PATH;`;
    const sql1 = `SELECT app, menu, category FROM app;`;
    const $DATA1 = await pool<RowDataPacket[]>(sql1, [])
    const sql = `SELECT JSON_ARRAYAGG(JSON_OBJECT('app', app, 'menu', menu, 'category', category)) AS info FROM app;`;
    const $DATA = await pool<RowDataPacket[]>(sql, [])
    res.json({ code: 0, data: data });
})

export default router;