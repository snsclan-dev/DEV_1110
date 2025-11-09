import { Server } from 'socket.io';
import jwt, { JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { boardInputData, checkEditor, checkImage, checkInput, logger, telegram } from 'modules';
import type { User, EditorType } from 'types';

const { APP_NAME, JWT_KEY } = process.env;

const $REGEX_IP = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
export const reqIp = (req: any)=>{
    const $IP = req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip || req.address;
    if (!$IP) return null;
    return (Array.isArray($IP) ? $IP[0] : $IP).split(',')[0].replace(/[^0-9.]/gm, '');
}
export const reqUserIp = (req: Request, res: Response, next: NextFunction)=>{
    const $IP = reqIp(req);
    if (!$IP) return res.status(400).json({ code: 1, msg: "IP 정보를 확인할 수 없습니다." });
    if (!$REGEX_IP.test($IP)) return res.status(400).json({ code: 1, msg: "올바른 IP 형식이 아닙니다." });
    if(!req.user) (req as any).user = {};
    req.user!.ip = $IP;
    next()
}
export const reqUserToken = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.user?.ip || null;
    const token = req.headers.authorization?.split(' ')[1];
    const cookie = req.cookies?.[APP_NAME!];
    const check = cookie || token;
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
const checkFormat = (message: string, err: unknown)=>{
    if (err instanceof Error) return `${message}\n${err.stack || err.message}`;
    return `${message}\n${err}`;
}
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const $REQ = `Request URL: ${req.originalUrl}`;
    logger(`${$REQ}\n${err.message}\n${err.stack}`);
    res.status(err.status || 500).json({ code: 2, msg: "서버 오류가 발생했습니다.", note: `오류(코드): ${err.message}` });
}
export const socketErrorHandler = (IO: Server) => {
    IO.on("connection", (socket) => {
        const onBind = socket.on.bind(socket); // socket.on 자체를 가로채서 모든 handler를 자동 wrap
        socket.on = (event: string, handler: (...args: any[]) => void) => {
            const $REQ = `Socket Event: ${event}`;
            const wrap = async (...args: any[]) => {
                try {
                    await handler(...args);
                } catch (err) {
                    logger(checkFormat($REQ, err))
                    socket.emit("ALERT", { code: 2, msg: '소켓 오류가 발생했습니다.', note: err instanceof Error ? err.message : '오류(코드): SOCKET_ERROR' });
                }
            };
            return onBind(event, wrap);
        };
    });
};
// export const inputHandler = async (req: Request, res: Response, next: NextFunction) => { // post: req.body
// export const inputHandler = ({ editorType = 'BOARD' }: { editorType?: EditorType })=>{
export const inputHandler = (editorType: EditorType = 'BOARD')=>{
    return async (req: Request, res: Response, next: NextFunction) => {
        if(process.env.NODE_ENV === 'development') console.log('inputHandler :', req.body); ///
        const $CHECK_INPUT = checkInput(req.body);
        if($CHECK_INPUT.code !== 0) return res.json($CHECK_INPUT);
        const { room, type, image, refImage, editor, refEditor } = $CHECK_INPUT;
        const $CHECK_IMAGE = await checkImage({ folder: room, image: image, refImage: refImage });
        if($CHECK_IMAGE.code !== 0) return res.json($CHECK_IMAGE);
        const $CHECK_EDITOR = await checkEditor({ editorType: editorType, folder: room, editor: editor, refEditor: refEditor });
        if($CHECK_EDITOR.code !== 0) return res.json($CHECK_EDITOR);
        // req.input = { ...$CHECK_INPUT, image: $CHECK_IMAGE.data, note: $CHECK_EDITOR.data };
        // req.input = boardInputData(req.body)
        req.input = { ...boardInputData(req.body), user_id: req.user?.id, user_ip: req.ip }
        next();
    }
}