import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import parse from 'html-react-parser';
import { storeApp, useModal } from "modules";
import { Modal, Modal_Image } from "components/app";
import { Tiptap_Svg, Tiptap_Upload, Tiptap_Preview_Media, Tiptap_Link } from "components/editor";
import './tiptap.css'

// tiptap extensions
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextAlign from '@tiptap/extension-text-align'
import Bold from '@tiptap/extension-bold'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Strike from '@tiptap/extension-strike'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import { TaskList, TaskItem } from '@tiptap/extension-list'
import { Dropcursor, Gapcursor, UndoRedo } from '@tiptap/extensions'
// custom extensions
import { Video } from './Tiptap_Video';

export const Editor_View = ({ view, value }: { view?: 'comment', value: string })=>{
    const { editorView } = storeApp((s)=>s)
    const { modal, openModal, closeModal } = useModal()

    const style = ()=>{
        if(editorView) return 'tiptap_note_expand'
        if(view === 'comment') return 'tiptap_comment'
        return 'tiptap_note'
    }
    const onClickImage = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if(target instanceof HTMLImageElement) openModal({ image: target.src });
    };

    return(<>
        {modal.image && <Modal_Image src={modal.image} onClose={closeModal}></Modal_Image>}
        <div className={`tiptap ${style()}`} onClick={onClickImage}>{parse(value || '')}</div>
    </>)
}
export const Editor = ({ id = 'editor', upload, value }: { id?: string, upload: 1 | 3 | 5, value?: string }) => {
    const { modal, openModal, closeModal } = useModal()

    const editor = useEditor({
        extensions: [ Document, Paragraph, Text, TextStyle, Bold, TaskList, TaskItem, HorizontalRule, Strike, Dropcursor, Gapcursor, UndoRedo, Video,
            Image.configure({ inline: true }),
            Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
            TextAlign.configure({ types: ['paragraph'] }),
            Color.configure({ types: ['textStyle'] }),
        ],
        content: value,
        immediatelyRender: false,
        // enablePasteRules: [Link],
    });
    const { isBold, isStrike, isTaskList, isAlignLeft, isAlignCenter, isAlignRight }: any = useEditorState({
        editor, selector: ({ editor }) => {
            if (!editor) return {};
            return {
                isBold: editor.isActive('bold'),
                isStrike: editor.isActive('strike'),
                isTaskList: editor.isActive('taskList'),
                isAlignLeft: editor.isActive({ textAlign: 'left' }),
                isAlignCenter: editor.isActive({ textAlign: 'center' }),
                isAlignRight: editor.isActive({ textAlign: 'right' }),
            };
        },
    });
    
    if(!editor) return null
    return (<>
        {modal.link && <Modal title='주소(링크) 입력' onClose={closeModal}><Tiptap_Link editor={editor} onClose={closeModal}/></Modal>}
        {modal.upload_image && <Modal title='이미지 등록(파일)' onClose={closeModal}><Tiptap_Upload upload={upload} editor={editor} openModal={openModal}/></Modal>}
        {(modal.preview_image || modal.preview_video) && <Modal title={modal.preview_image ? '이미지 등록(URL)' : '동영상 등록(URL)'} onClose={closeModal}>
            <Tiptap_Preview_Media mediaType={modal.preview_image ? 'image' : 'video'} editor={editor} openModal={openModal}/>
        </Modal>}

        <div className="box">
            <div className="box_gray tiptap_toolbar pd_l3">
                <button className="bt_tool" onClick={()=>openModal({ upload_image: true })}><Tiptap_Svg name="image" /></button>
                <button className="bt_tool" onClick={()=>openModal({ preview_video: true })}><Tiptap_Svg name="video" /></button>
                <button className="bt_tool" onClick={()=>openModal({ link: true })}><Tiptap_Svg name="link" /></button>

                <button className="bt_tool" onClick={()=>editor.chain().focus().toggleBold().run()}><Tiptap_Svg name='bold' color={isBold ? 'black' : 'gray'}/></button>
                <button className="bt_tool"><input className='input_color' type="color" onInput={event => editor.chain().focus().setColor(event.currentTarget.value).run()} data-testid="setColor"/></button>
                <button className="bt_tool" onClick={() => editor.chain().focus().unsetColor().unsetBold().unsetStrike().run()} data-testid="unsetColor"><Tiptap_Svg name='color_reset'/></button>

                <button className="bt_tool" onClick={()=>editor.chain().focus().toggleTextAlign('left').run()}><Tiptap_Svg name='align_left' color={isAlignLeft ? 'black' : 'gray'}/></button>
                <button className="bt_tool" onClick={()=>editor.chain().focus().toggleTextAlign('center').run()}><Tiptap_Svg name='align_center' color={isAlignCenter ? 'black' : 'gray'}/></button>
                <button className="bt_tool" onClick={()=>editor.chain().focus().toggleTextAlign('right').run()}><Tiptap_Svg name='align_right' color={isAlignRight ? 'black' : 'gray'}/></button>

                <button className="bt_tool" onClick={()=>editor.chain().focus().setHorizontalRule().run()}><Tiptap_Svg name='hr'/></button>
                <button className="bt_tool" onClick={()=>editor.chain().focus().toggleTaskList().run()}><Tiptap_Svg name='check_list' color={isTaskList ? 'black' : 'gray'}/></button>
                <button className="bt_tool" onClick={()=>editor.chain().focus().toggleStrike().run()}><Tiptap_Svg name='strike' color={isStrike ? 'black' : 'gray'}/></button>
            </div>

            <EditorContent id={id} className="tiptap_editor" editor={editor} />
        </div>
    </>);
};