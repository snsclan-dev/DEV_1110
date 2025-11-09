import https from 'https';
import { logger } from './winston';

const { NODE_ENV, TELEGRAM_DEV_TOKEN, TELEGRAM_BOT_TOKEN, TELEGRAM_DEV_ID, APP_NAME } = process.env;

const $API_DEV = `https://api.telegram.org/bot${TELEGRAM_DEV_TOKEN}/sendMessage`;
const $API_BOT = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

export const telegram1 = ({ id=null, msg }: { id?: string | null; msg: string })=>{
    if(NODE_ENV === 'production'){
        const $DATA = JSON.stringify({ chat_id: id ? id : TELEGRAM_DEV_ID, text: id ? msg : `[ ${APP_NAME?.toUpperCase()} ]\n${msg}` });
        const $OPTION = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength($DATA) } };
        const req = https.request(id ? $API_BOT: $API_DEV, $OPTION);
        req.on('error', (err) => console.log(`Telegram Https Error\n${err}`));
        req.write($DATA);
        req.end();
    }else{
        console.log(id ? msg : `[ ${APP_NAME?.toUpperCase()} ]\n${msg}`)
    }
}
export const telegram = async ({ id = null, msg }: { id?: string | null; msg: string }): Promise<void> =>{
    if(NODE_ENV !== 'production'){
        return console.log(id ? msg : `[ ${APP_NAME?.toUpperCase()} ]\n${msg}`);
    }else{
        const $DATA = JSON.stringify({ chat_id: id ? id : TELEGRAM_DEV_ID, text: `[ ${APP_NAME?.toUpperCase()} ]\n${msg}` });
        const $OPTION = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength($DATA) } };
        await new Promise<void>((resolve, reject)=>{
            const $REQ = https.request(id ? $API_BOT: $API_DEV, $OPTION, (res)=>{
                res.on('data', () => {}); // consume response
                res.on('end', () => resolve());
            });
            $REQ.on('error', (err) =>{
                reject(new Error('오류(코드): TELEGRAM_REQUEST', { cause: err }));
            });
            $REQ.write($DATA);
            $REQ.end();
        })

    }
}