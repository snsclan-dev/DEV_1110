import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { logger, telegram } from 'modules';
import { User } from 'types';

const { APP_NAME, JWT_KEY } = process.env;

const $REGEX_IP = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const reqIp = (req: any)=>{
    const $IP = req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip || req.address;
    if (!$IP) return null;
    return (Array.isArray($IP) ? $IP[0] : $IP).split(',')[0].replace(/[^0-9.]/gm, '');
}
export const reqUserIp = (req: Request, res: Response, next: NextFunction)=>{
    const $IP = req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip;
    if (!$IP) return res.status(400).json({ code: 1, msg: "IP 정보를 확인할 수 없습니다." });
    const checkIp = (Array.isArray($IP) ? $IP[0] : $IP).split(',')[0].replace(/[^0-9.]/gm, '');
    if (!$REGEX_IP.test(checkIp)) return res.status(400).json({ code: 1, msg: "올바른 IP 형식이 아닙니다." });
    if(!req.user) (req as any).user = {};
    // (req as any).user.ip = $IP;
    if(req.user) req.user.ip = checkIp;
    next()
}
export const reqUserToken = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.user?.ip || null;
    const token = req.headers.authorization?.split(' ')[1];
    const cookie = req.cookies?.[APP_NAME!];
    const check = cookie || token;
    // console.log(req.headers);///
    if (!check || check === 'undefined') {
        req.user = { id: null, level: 0, ip: ip } as User;
        return next();
    }
    jwt.verify(check, JWT_KEY as string, (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if (err) {
            req.user = { id: null, name: null, level: 0, ip: ip };
        } else {
            req.user = decoded as User;
        }
        next();
    });
};
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    }
};
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const $URL = `Request URL: ${req.originalUrl}`;
    if (err instanceof Error) {
        const $ERR = `${$URL}\n${err.stack ? err.stack : `Message: ${err.message}`}`;
        if (process.env.NODE_ENV === "production") {
            logger($ERR);
            telegram({ msg: `오류 알림 : ${$ERR}` });
        } else {
            console.log(`[ ERROR ] ----------------------------------------\n${$ERR}\n--------------------------------------------------`);
        }
    } else {
        console.log(`[ ERROR ] ----------------------------------------\n${err}\n--------------------------------------------------`);
    }
    // res.status(err.status || 500).json({ code: err.code || 2, msg: err.msg || "서버 오류가 발생했습니다." });
    res.status(err.status || 500).json({ code: 2, msg: err.msg });
}






// export const multerError: express.ErrorRequestHandler = (err, req, res, next) => {
//     checkError(err, "main/upload.ts, /image");
//     if (err.message === "FILE_TYPE") {
//         res.json({ code: 1, msg: "이미지 형식이 아닙니다." });
//         return;
//     }
//     if (err.message === "FILE_LENGTH") {
//         res.json({ code: 1, msg: "이미지 업로드 허용 개수를 초과하였습니다.\n하루(0시) 마다 초기화 됩니다." });
//         return;
//     }
//     if (err.code === "LIMIT_FILE_SIZE") {
//         res.json({ code: 1, msg: `이미지 용량(${$FILE_UPLOAD.maxSize}MB)이 초과되었습니다.` });
//         return;
//     }
//     res.status(500).json({ code: 1, msg: "업로드 중 오류가 발생했습니다." });
// };

