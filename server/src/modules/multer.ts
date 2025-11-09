import { Request } from 'express';
import path from 'path';
import fs from 'fs/promises';
import multer, { FileFilterCallback, StorageEngine } from 'multer';
import { $FILE_UPLOAD, checkAdmin, dateFormat } from 'config';
import { User } from 'types';

// 폴더 경로 생성 함수
const folderPath = async (req: Request): Promise<string> => {
    const $URL = req.url.split('/');
    const $FOLDER_NAME = $URL[$URL.length - 1];
    const $FOLDER_PATH = path.join('/', process.env.FOLDER!, process.env.APP_NAME!, $FOLDER_NAME, dateFormat('YYMM'));
    const $FOLDER_USER = path.join('/', process.env.FOLDER!, process.env.APP_NAME!, 'temp', $FOLDER_NAME);
    try {
        if ($FOLDER_NAME === 'user') {
            await fs.access($FOLDER_USER).catch(async () => { await fs.mkdir($FOLDER_USER, { recursive: true }); });
            return $FOLDER_USER;
        }
        await fs.access($FOLDER_PATH).catch(async () => { await fs.mkdir($FOLDER_PATH, { recursive: true }); });
        return $FOLDER_PATH;
    } catch (err) {
        // checkError(err as Error, 'modules/multer.ts, folderPath');
        throw err;
    }
};

const storage = multer.diskStorage({
    destination: async (req: Request, file, cb) => {
        try {
            const $FOLDER_PATH = await folderPath(req);
            cb(null, $FOLDER_PATH);
        } catch (err) {
            cb(err as Error, '');
        }
    },
    filename: (req: Request, file, cb) => {
        const { id, level } = req.user as User;
        const $FILE_NAME = Math.random().toString(36).substring(2, 8);
        const $USER = checkAdmin(level) ? process.env.APP_NAME!.toUpperCase() : id;
        cb(null, `${dateFormat('YYMMDD_HHmmSSS')}_${$FILE_NAME}-${$USER}.${file.mimetype.split('/')[1]}`);
    },
});

const fileFilter = async (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const { id } = req.user || {};
    if (file.mimetype.split('/')[0] !== 'image') return cb(new Error('FILE_TYPE'));
    const $REGEX_ID = new RegExp(`${id}`);
    try {
        const $FOLDER_PATH = await folderPath(req);
        const $DIR = await fs.readdir($FOLDER_PATH);
        const $FILE = $DIR.filter(e => e.split('_')[0] === dateFormat('YYMMDD') && $REGEX_ID.test(e));
        if ($FILE.length >= $FILE_UPLOAD.temp) return cb(new Error ('FILE_LENGTH'));
        cb(null, true);
    } catch (err) {
        // checkError(err as Error, 'modules/multer.ts, fileFilter');
        cb(err as Error);
    }
};

const upload = multer({
    storage: storage as StorageEngine,
    fileFilter: (req, file, cb) => {
        // multer의 fileFilter는 async를 지원하지 않으므로, Promise로 래핑
        fileFilter(req, file, cb);
    },
    limits: { files: 5, fileSize: $FILE_UPLOAD.fileSize }
}).array('fileUpload');

export default upload;