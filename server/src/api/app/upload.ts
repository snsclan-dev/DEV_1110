import express, { Request, Response, Router } from 'express';
import { $FILE_UPLOAD } from 'config/systems';
import upload from 'modules/multer';
import { User } from 'types';

const router = Router();

const multerError: express.ErrorRequestHandler = (err, req, res, next) => {
    if (err.message === "FILE_TYPE") return res.json({ code: 1, msg: "이미지 형식이 아닙니다." });
    if (err.message === "FILE_LENGTH") return res.json({ code: 1, msg: "이미지 업로드 허용 개수를 초과하였습니다.\n하루(0시) 마다 초기화 됩니다." });
    if (err.code === "LIMIT_FILE_SIZE") return res.json({ code: 1, msg: `이미지 용량(${$FILE_UPLOAD.maxSize}MB)이 초과되었습니다.` });
    // res.status(500).json({ code: 1, msg: "업로드 중 오류가 발생했습니다." });
    res.json({ code: 2, msg: "업로드 중 오류가 발생했습니다." });
};
router.post('/image/:folder', upload, (req: Request, res: Response)=>{ // folder: image upload temp
    const { id } = req.user as User, { folder } = req.params; // folder: temp 5, chat 3
    // if (!id) return res.json({ code: 1, msg: "로그인이 필요합니다." });
    const images: string[] = [];
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length > ($FILE_UPLOAD as any)[folder]) {
        return res.json({ code: 1, msg: `사진은 최대 ${($FILE_UPLOAD as any)[folder]}장까지 동시에 등록이 가능합니다.` });
    }
    for (const e of files) {
        if (e.size > $FILE_UPLOAD.fileSize) return res.json({ code: 1, msg: `이미지 용량(${$FILE_UPLOAD.maxSize}MB)이 초과되었습니다.` });
        images.push(e.path.replace(/[\\]/g, '/'));
    }
    res.json({ code: 0, image: images });
})

// Multer 에러 핸들러 등록 (업로드 라우트 뒤)
router.use(multerError);

export default router;