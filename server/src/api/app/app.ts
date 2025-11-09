import { Request, Response, Router } from "express";
import jwt from 'jsonwebtoken';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { RowDataPacket } from "mysql2";
import { $USER_STATE, asyncHandler, checkManager, dateFormat, pool, pooling, transaction } from "config";
import { checkInput, telegram } from "modules";
import type { User } from "types";

const router = Router();

router.get('/store', (req: Request, res: Response)=>{ // storeUser
    const { id, name, level, ip } = req.user as User;
    res.json({ code: 0, user: { id, name, level, ip } })
})
router.post('/login', asyncHandler(async (req: Request, res: Response)=>{
    const { ip } = req.user as User;
    const { input_id, input_pass } = req.body;
    const $CHECK = checkInput({ id: input_id, pass: input_pass })
    if($CHECK.code) return res.json($CHECK)
    if(!ip) return res.json({ code: 1, msg: 'IP 정보를 확인할 수 없습니다...' })
    await transaction(async (conn)=>{
        const $SQL = `SELECT id, name, level, pass, pass_salt, blocked, state, login_ip FROM user WHERE id=?;`;
        const $LOGIN = await pooling<RowDataPacket[]>(conn, $SQL, [input_id])
        if(Array.isArray($LOGIN)){
            // if(!$LOGIN.length) return res.json({code:1, msg:'회원이 아니거나 아이디 또는 비밀번호가 틀립니다.'});
            if (!$LOGIN.length) return res.json({ code: 1, msg:'로그인 실패.', note: "회원이 아니거나 아이디 또는 비밀번호가 틀립니다." });
            // if($LOGIN[0].state === $USER_STATE['1_wait']) return res.json({code:1, msg:'이메일 인증이 필요합니다.'});
        }
        const { id, name, level, pass, pass_salt, blocked, state, login_ip } = $LOGIN[0];
        const hashPass = pbkdf2Sync(input_pass, pass_salt, Number(process.env.CRYPTO_ITERATIONS), Number(process.env.CRYPTO_KEYSIZE), 'sha512').toString('hex');
        if(hashPass === pass) {
            const $LOGIN_IP = login_ip ? login_ip.split(',') : [];
            const $CHECK_IP = $LOGIN_IP.some((e: string)=> e === ip )
            if(!$CHECK_IP){
                if($LOGIN_IP.length >= 5) $LOGIN_IP.pop()
                $LOGIN_IP.unshift(ip)
            }
            if(state >= $USER_STATE['8_delete']) return res.json({code:1, msg:'탈퇴 또는 강제 퇴출된 회원입니다.'});
            if(state === $USER_STATE['7_block']) return res.json({code:1, msg:'이용이 중지된 회원입니다.'});
            if(blocked){
                if(blocked > dateFormat('YYYY-MM-DD HH:mm:ss')) return res.json({code:1, msg:`이용 규칙 위반으로 이용이 중지되었습니다.\n해제 : ${blocked}`});
                await pooling(conn, 'UPDATE user SET blocked=NULL WHERE id=?;', [input_id])
            }
            const $SQL_UPDATE = `UPDATE user SET logined=1, updated=now(), login_ip=? WHERE id=?;`;
            await pooling(conn, $SQL_UPDATE, [$LOGIN_IP.join(), input_id])
            const token = jwt.sign({ id, name, level, ip }, process.env.JWT_KEY!, { algorithm:"HS512", expiresIn: '1d' });
            res.cookie(process.env.APP_NAME!, token, {
                path: '/', maxAge: 1000 * 60 * 60 * 24 , // 1day
                httpOnly: process.env.NODE_ENV === 'production', secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV! === 'production' ? 'none' : 'lax'
            });
            if(checkManager(level)) telegram({ msg: `[ 관리자 로그인 ]\n${name} ( ${id} )\n${ip}` });
            res.json({ code: 0 });
        }else{
            if(checkManager(level)) telegram({ msg: `[ 관리자 로그인 실패 ]\n${name} ( ${id} )\n${ip}` });
            res.json({ code: 1, msg:'로그인 실패.', note: "회원이 아니거나 아이디 또는 비밀번호가 틀립니다." });
        }
    })
}));
router.post('/register', asyncHandler(async (req: Request, res: Response)=>{
    const { pass, pass_check } = req.body;
    const { ip } = req.user as User;
    const $CHECK = checkInput({ ...req.body, pass_confirm: pass === pass_check });
    if($CHECK.code) return res.json($CHECK)
    const { id, name, email, pass_code } = $CHECK;
    await transaction(async (conn)=>{
        const $SQL_FIND = `SELECT id, name, email FROM user WHERE (id LIKE ? OR name LIKE ? OR email LIKE ? OR login_ip LIKE ?);`;
        const $FIND = await pooling(conn, $SQL_FIND, [id, name, email, ip])
        if(Array.isArray($FIND) && $FIND.length){
            if($FIND[0].id === id || $FIND[0].email === email) return res.json({code:1, msg:'이미 존재하는 아이디 또는 이메일입니다.'});
            if($FIND[0].name === name) return res.json({code:1, msg:'이미 사용중인 별명입니다.'});
        }
        const pass_salt = randomBytes(16).toString('hex');
        const iterations = parseInt(process.env.CRYPTO_ITERATIONS!, 10);
        const keySize = parseInt(process.env.CRYPTO_KEYSIZE!, 10);
        const $PASS_CODE = pbkdf2Sync(String(pass_code), pass_salt, iterations, keySize, 'sha512').toString('hex');
        const hashPass = pbkdf2Sync(pass, pass_salt, iterations, keySize, 'sha512').toString('hex');
        const $SQL_INSERT = `INSERT INTO user(id, email, name, pass, pass_salt, pass_code) VALUES(?, ?, ?, ?, ?, ?);`;
        await pooling(conn, $SQL_INSERT, [id, email, name, hashPass, pass_salt, $PASS_CODE])
        const $SQL_INSERT_INFO = `INSERT INTO user_info(id) VALUES(?);`;
        await pooling(conn, $SQL_INSERT_INFO, [id])
        if(process.env.NODE_ENV === 'production'){
            telegram({ msg: `[ 회원 가입 ]\n${name} ( ${id} )\n${email}` });
            // mailer(id, email, pass_salt)
        }
        res.json({ code:0, msg:'회원가입이 완료되었습니다.' });
    })
}))
router.get('/logout', asyncHandler(async (req: Request, res: Response)=> {
    const { id } = req.user as User;
    if(id){
        const $SQL_LOGOUT = `UPDATE user SET logined=0 WHERE id=?;`;
        await pool($SQL_LOGOUT, [id])
    }
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.cookie(process.env.APP_NAME!, '', { maxAge: 0 });
    res.clearCookie(process.env.APP_NAME!);
    res.json({code: 0});
}));
// error router send telegram...
router.get('/error', (req, res)=>{

})

export default router;