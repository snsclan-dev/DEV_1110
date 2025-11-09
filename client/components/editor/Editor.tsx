import { Editor } from "@tiptap/react";
import { $REGEX } from "modules"

interface EditorElement extends HTMLElement {
    editor: Editor;
}
// client <=> server ----------
type EditorType = 'USER' | 'BOARD' | 'COMMENT' | 'MESSENGER';
type EditorCheck = { type: EditorType; text: number; line: number; html: number; image: number; video: number; }
const $EDITOR_CHECK: EditorCheck[] = [ // check length
    { type: 'USER', text: 1000, line: 500, html: 50000, image: 10, video: 1 }, // admin user note
    { type: 'BOARD', text: 10000, line: 1000, html: 50000, image: 30, video: 10 },
    { type: 'COMMENT', text: 1000, line: 100, html: 10000, image: 3, video: 3 },
    { type: 'MESSENGER', text: 5000, line: 100, html: 50000, image: 10, video: 5 }, // messenger
]
// export const checkEditor = ({ type, editorId = 'editor' }: EditorCheck)=>{
export const checkEditor = ({ editorType, editorId = 'editor' }: { editorType: EditorType, editorId?: string })=>{
    const $EDITOR = document.querySelector(`#${editorId} .ProseMirror`) as EditorElement;
    if (!$EDITOR) return { code: 9, msg: "에디터를 찾을 수 없습니다." };
    const $CHECK = $EDITOR_CHECK.find((e)=> e.type === editorType)
    if (!$CHECK) return { code: 9, msg: "에디터 타입이 올바르지 않습니다." };
    const $TEXT = $EDITOR.editor.getText(), $HTML = $EDITOR.editor.getHTML()
    if ($TEXT.replace(/\s+/g, "").length < 6) return { code: 9, msg: "내용을 6자 이상 입력해 주세요." };
    if ($TEXT.length > $CHECK.text || $HTML.length > $CHECK.html) return { code: 9, msg: "내용이 너무 많습니다." };
    
    const $FIND_IMAGE = $HTML.match($REGEX.url_image)?.length || 0;
    const $FIND_VIDEO = $HTML.match($REGEX.url_video)?.length || 0;

    if($FIND_IMAGE > $CHECK.image) return { code: 9, msg: <>
        <p>이미지(파일 + 태그)는 최대 <span className="c_blue fwb">{$CHECK.image}</span>개까지 등록이 가능합니다.</p>
        <p>현재 등록된 이미지 <span className="c_red fwb">{$FIND_IMAGE}</span>개</p>
    </>};
    if($FIND_VIDEO > $CHECK.video) return { code: 9, msg: <>
        <p>영상(파일 + 태그)는 최대 <span className="c_blue fwb">{$CHECK.video}</span>개까지 등록이 가능합니다.</p>
        <p>현재 등록된 영상 <span className="c_red fwb">{$FIND_VIDEO}</span>개</p>
    </>};

    if($CHECK.line){
        const $LINE = ($HTML.match(/<p>/g) || []).length;
        if($LINE > $CHECK.line) return { code: 9, msg: <><p>최대 <span className="c_green fwb">[ {$CHECK.line} ]</span>줄까지 입력이 가능합니다.</p><p>현재 <span className="c_red fwb">[ {$LINE} ]</span>줄 입력되었습니다.</p></> };
    }

    return { code: 0, editor: $EDITOR.editor.commands, data: $HTML.replace(/(<p><\/p>){3,}/g, '<p></p><p></p>')} // editor: clearContent()
}