import { createClient } from "redis";
import { telegram } from "modules";

export const $REDIS = createClient({
    url: `redis://localhost:${process.env.REDIS_PORT}`, password: process.env.APP_PASS,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error(`[ REDIS RETRY ] 최대 연결 시도 실패! (${10})\n프로세스를 종료합니다.`);
                telegram({ msg: `[ REDIS RETRY ] 최대 연결 시도 실패! (${10})\n프로세스를 종료합니다.` });
                process.exit(1);
                // return null
            }
            console.log(`[ REDIS RETRY ] 재연결 시도 ${retries}`);
            return 3000; // 재연결 시간 3초
        },
    },
});

const conn = async () => {
    if (!$REDIS.isOpen) { // 중복 연결 방지
        try {
            await $REDIS.connect();
            console.log("[ REDIS ] connected!");
        } catch (err) {
            console.log("[ REDIS ] connect error!");
        }
    }
};
conn();

$REDIS.on('error', (err) => { console.log(`[ REDIS ] ON ERROR!\n${err}`) });