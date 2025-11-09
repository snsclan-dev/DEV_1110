import fs from 'fs/promises';
import { $REGEX } from './regex';
import { checkError } from 'config';
import type { CodeData } from 'types';

// client <=> server ----------
type EditorType = 'USER' | 'BOARD' | 'COMMENT' | 'MESSENGER';
type EditorCheck = { type: EditorType; text: number; line: number; html: number; image: number; video: number; }
const $EDITOR_CHECK: EditorCheck[] = [ // check length
    { type: 'USER', text: 1000, line: 500, html: 50000, image: 10, video: 1 }, // admin user note
    { type: 'BOARD', text: 10000, line: 1000, html: 50000, image: 30, video: 10 },
    { type: 'COMMENT', text: 1000, line: 100, html: 10000, image: 3, video: 3 },
    { type: 'MESSENGER', text: 5000, line: 100, html: 50000, image: 10, video: 5 }, // messenger
]
// ========== client <=> server
type Editor = { editorType: EditorType; folder: string; editor: string; refEditor?: string | null }
export const checkEditor = async ({ editorType, folder, editor, refEditor = null }: Editor): Promise<CodeData>=>{ // 객체로 받음 확인
    const $CHECK = $EDITOR_CHECK.find((e)=> e.type === editorType)
    if (!$CHECK) return { code: 2, msg: "해당 정보가 없습니다.", note: '오류(코드): SERVER_EDITOR_CHECK' };
    const $INPUT = editor?.replace(/<[^>]*>/g, ''); // 태그 제거
    console.log(editor, $INPUT);
    
    if (!$INPUT || $INPUT.replace(/\s+/g, "").length < 6) return { code: 1, msg: "내용: 6자 이상 입력해 주세요." };
    if ($INPUT.length > $CHECK.text || editor.length > $CHECK.html) return { code: 1, msg: "내용(HTML)이 너무 많습니다." };

    // check image length count
    const $FIND_IMAGE = editor.match($REGEX.tag_image_url)?.length || 0;
    const $FIND_VIDEO = editor.match($REGEX.url_video)?.length || 0;

    if($FIND_IMAGE > $CHECK.image) return { code: 1, msg: `이미지(파일 + 태그)는 최대 [ ${$CHECK.image} ]개까지 등록이 가능합니다.\n현재 등록된 이미지 [ ${$FIND_IMAGE} ]개`};
    if($FIND_VIDEO > $CHECK.video) return { code: 1, msg: `영상(파일 + 태그)는 최대 [ ${$CHECK.video} ]개까지 등록이 가능합니다.\n현재 등록된 영상 [ ${$FIND_VIDEO} ]개`};

    const $MATCH_IMAGE_TEMP = editor.match($REGEX.editor_image_temp) ?? [];
    const $MATCH_IMAGE_INPUT = editor.match($REGEX.editor_image_save) ?? [];
    const $MATCH_IMAGE_SAVE = refEditor ? refEditor.match($REGEX.editor_image_save) ?? [] : [];
    const $ARR_IMAGE_INPUT: string[] = [], $ARR_IMAGE_SAVE = [];
    try{
        for (const e of $MATCH_IMAGE_TEMP) {
            const $FOLDER_TEMP = e.replace($REGEX.editor_image_temp, '$1');
            const $FOLDER_IMAGE = editorType === 'USER' ? $FOLDER_TEMP.replace($REGEX.editor_image_user, `/${process.env.APP_NAME}/images/${folder}/user/`) :
                $FOLDER_TEMP.replace($REGEX.editor_image_folder, `/${process.env.APP_NAME}/images/${folder}/`);
            const $FILE_NAME = e.replace($REGEX.editor_image_temp, '$2'); // file name
            $ARR_IMAGE_INPUT.push($FOLDER_IMAGE + $FILE_NAME);

            await fs.access($FOLDER_IMAGE).then(()=>{
                return fs.rename($FOLDER_TEMP + $FILE_NAME, $FOLDER_IMAGE + $FILE_NAME)
            }).catch(async ()=>{
                await fs.mkdir($FOLDER_IMAGE, { recursive: true });
                return fs.rename($FOLDER_TEMP + $FILE_NAME, $FOLDER_IMAGE + $FILE_NAME)
            })
        }
        for (const e of $MATCH_IMAGE_INPUT) {
            $ARR_IMAGE_INPUT.push(e.replace($REGEX.editor_image_save, '$1'));
        }
        for (const e of $MATCH_IMAGE_SAVE) {
            $ARR_IMAGE_SAVE.push(e.replace($REGEX.editor_image_save, '$1'));
        }
        const $MODIFY_IMAGE = $ARR_IMAGE_SAVE.filter(e => !$ARR_IMAGE_INPUT.includes(e));
        for (const e of $MODIFY_IMAGE) {
            await fs.access(e).then(()=> fs.unlink(e)).catch((err)=> checkError(err, 'modules/editor.ts, checkEditor() unlink') )
        }
        const $HTML_REPLACE = editorType === 'USER' ? 
            editor.replace($REGEX.editor_image_user, `/${process.env.APP_NAME}/images/${folder}/user/`) :
            editor.replace($REGEX.editor_image_folder, `/${process.env.APP_NAME}/images/${folder}/`)

        const $DATA = $HTML_REPLACE.replace(/(<p><\/p>){3,}/g, '<p></p><p></p>')
        return { code: 0, data: $DATA };
    }catch(err){
        checkError(err, 'modules/editor.ts, checkEditor()');
        return { code: 1, msg: "에디터 이미지 등록(수정)이 실패하였습니다." };
    }
}