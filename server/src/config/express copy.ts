import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';

import { $SYSTEM_CORS } from './systems';
import { reqUserIp, reqUserToken, asyncHandler } from './middlewares';

const { NODE_ENV, APP_NAME, FOLDER } = process.env;

const app = express();
app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: $SYSTEM_CORS, credentials: true, exposedHeaders: '*' }));

// middleware (순서 주의)
app.use(reqUserIp); // app.use('/api', reqUserIp) 로 경로 좁힘
app.use(reqUserToken);
app.use(asyncHandler);

// dev
app.use((req: Request, res: Response, next: NextFunction) => {
    if (NODE_ENV === 'development') {
        console.log(`[ ${APP_NAME} ] client request :`, req.url);
    }
    next();
});

app.use(`/${FOLDER}/${APP_NAME}`, express.static(path.join('/', FOLDER!, APP_NAME!))); // public
app.use(`/${FOLDER}/${APP_NAME}/chat`, express.static(path.join('/', FOLDER!, APP_NAME!, 'chat')));
app.use(`/${FOLDER}/${APP_NAME}/video`, express.static(path.join('/', FOLDER!, APP_NAME!, 'video')));

app.use(`/${FOLDER}/${APP_NAME}`, (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user?.id) {
            res.status(403).send('<center><h1>403 Forbidden</h1></center><hr><center>nginx</center>');
            return; // 함수 종료만 하고 값을 반환하지 않음
        }
        next();
    },
    express.static(path.join('/', FOLDER!, APP_NAME!))
);

export default app;