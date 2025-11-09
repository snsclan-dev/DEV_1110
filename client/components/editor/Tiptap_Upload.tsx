import { Editor } from "@tiptap/react";
import { ChangeEvent, useState } from "react";
import { storeApp, storeUser, useFetch } from "modules";
import { $FILE_UPLOAD } from "modules/systems";
import { Li } from "components/app";

export const Tiptap_Upload = ({ upload, editor, openModal }: { upload: 1|2|3|4|5, editor: Editor, openModal: (modal: Record<string, any>)=> void })=>{
    const { user } = storeUser((s)=>s)
    const { setPopup, setLoading } = storeApp((s)=>s)
    const [preView, setPreView] = useState<string[]>([]); // image preview
    const [file, setFile] = useState<File[]>([]); // image files

    const imageView = (e: ChangeEvent<HTMLInputElement>)=> {
        const files = e.target.files;
        if (!files) return;
        const viewArr: string[] = [];
        if (files.length > upload) return setPopup({ msg: `이미지는 최대 ${upload}개까지 동시에 선택이 가능합니다.` });
        const $FILE = Array.from(files)
        setFile($FILE);
        $FILE.forEach((file, i)=>{
            if(file.type.split('/')[0] !== 'image'){
                setLoading(false);
                return setPopup({ msg: "이미지만 등록이 가능합니다." });
            }
            if(file.size > $FILE_UPLOAD.fileSize){
                setLoading(false);
                return setPopup({ msg: `이미지는 최대 ${$FILE_UPLOAD.maxSize}MB까지 등록이 가능합니다.` });
            }
            const reader = new FileReader();
            reader.onload = () => {
                if(typeof reader.result === 'string'){
                    viewArr[i] = reader.result;
                    setPreView([...viewArr]);
                }
            }
            reader.readAsDataURL(files[i]);
        })
    }
    const onChangeImage = (e: ChangeEvent<HTMLInputElement>)=>{
        setLoading(true);
        imageView(e);
        setLoading(false);
    };
    const openFile = ()=> {
        if (!user.id) return setPopup({ msg: "로그인이 필요합니다." });
        setPreView([]);
        setFile([]);

        const fileInput = document.getElementById("file") as HTMLInputElement | null;
        if (fileInput) {
            fileInput.value = "";
            fileInput.click();
        }
    }
    const sendImage = async ()=>{
        if (!user.id) return setPopup({ msg: "로그인이 필요합니다." });
        const form = new FormData();
        if (!file.length) return setPopup({ msg: "이미지를 선택해 주세요." });
        if(file.length) {
            if (file.length > upload) return setPopup({ msg: `이미지는 최대 ${upload}개 / ${$FILE_UPLOAD.maxSize}MB 까지 선택이 가능합니다.` });
            for (let i = 0; i < file.length; i++){
                form.append("fileUpload", file[i]);
            }
        }
        const $DATA = await useFetch.post('/upload/image/temp', form)
        if($DATA) $DATA.image.forEach((e: string) => editor.commands.setImage({ src: e }) );
        setFile([]);
        openModal({});
    }

    return(<>
        <Li>이미지 등록은 최대 <span className="c_blue fwb">{upload}개 / {$FILE_UPLOAD.maxSize}MB</span> 까지 선택이 가능합니다.</Li>

        <div className="wrap_preview bg mg_b10" onClick={openFile}>
            {!preView.length && <p className="placeholder c_gray fwb">이미지를 선택해 주세요 (클릭)</p>}
            {preView.map((e, i) => <div key={i} className={`preview_map${upload}`}><img src={e} alt="preview"/></div>)}
        </div>

        <input id="file" className="none" type="file" name="fileUpload" accept="image/*" multiple onChange={onChangeImage}/>

        <div className="ta_c pd_h2">
            <button className="bt_main c_green" onClick={()=>openModal({ preview_image: true })}>주소(URL) 입력</button>
            <button className="bt_main c_blue" onClick={sendImage}>이미지 등록</button>
        </div>
    </>)
}