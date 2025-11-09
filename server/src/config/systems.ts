import dayjs from 'dayjs';
import { Request } from 'express';
import { logger, telegram } from 'modules';
import 'dayjs/locale/ko'

const { APP_URL, APP_HOST } = process.env;

// export const $SYSTEM_CORS = [APP_URL!, APP_HOST!];
export const $SYSTEM_CORS = [APP_URL, APP_HOST].filter((v): v is string => Boolean(v));
export const $FILE_UPLOAD = { maxSize: 10, fileSize: 10 * 1024 * 1024, chat: 3, temp: 100 }; // upload

const $REGEX_IP = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
export const checkIp = (req: Request) => {
    const reqIp = req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip;
    if (!reqIp) return null;
    const $IP = (Array.isArray(reqIp) ? reqIp[0] : reqIp).split(',')[0].replace(/[^0-9.]/gm, '');
    if (!$REGEX_IP.test($IP)) return null;
    return $IP;
};
export const checkError = (err: unknown, note: string): void => {
    if (err instanceof Error) {
        const $ERR = `${note}\n${err.stack || err.message}\n----------\n${err}`;
        if (process.env.NODE_ENV === 'production') {
            logger($ERR);
            telegram({ msg: `오류 알림 : ${$ERR}` });
        } else {
            console.log(`----------\n[ checkError ]\n${$ERR}\n----------`);
        }
    } else {
        console.error(`----------\n[ checkError ]\n${note}\n----------`, err);
    }
}
export const dateFormat = (format='YYYY-MM-DD HH:mm:ss') => {
    return dayjs().format(format)
}
export class CustomError extends Error {
    constructor(message: string, originalError?: unknown) {
        if(originalError instanceof Error){
            super(`오류(코드): ${message}`);
            this.stack = originalError.stack || (new Error()).stack;
        }else{
            super(message);
            Error.captureStackTrace(this, this.constructor);
        }
        this.name = "CustomError";
    }
}
