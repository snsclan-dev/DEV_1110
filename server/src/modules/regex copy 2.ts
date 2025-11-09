// server <=> client
import fs from 'fs/promises';
import { checkError } from 'config/systems';
import type { Input, CodeData } from 'types';

export const $REGEX = {
    escape_check: /[`\\]/, 
    escape_replace: /[`\\]/gm,
    tag_image_file: new RegExp(`<img[^>]*src=["']?(\/data\/${process.env.APP_NAME}\/(images)\/)+[^>"']+["']?[^>]*>`, 'gmi'),
    tag_image_url: /<img[^>]*src=["']?((https?:\/\/|\/\/|\/)[^"'>\s]+)["']?[^>]*>/gmi, // group $1: url
    url_image: /^(http(s)?:\/\/|\/\/)[^\s]+?\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?.*)?$/gmi,
    url_image_file: /([^\/\s]+?\.(jpg|jpeg|png|gif|bmp|webp|svg))(?=\s|$)/i, // event filename.(ext)
    url_video: /((http(s)?:\/\/)+[^\]]*(\.(mp4)))/gmi,
    input_image: new RegExp(`(\/data\/${process.env.APP_NAME}\/temp\/[\\d]{4}\/)([^\\s]+?.(?:jpg|jpeg|png|gif|bmp|webp|svg))`, 'gmi'), // checkImage()
    editor_image_temp: new RegExp(`<img[^>]*src=["']?(\/data\/${process.env.APP_NAME}\/temp\/[\\d]{4}\/)([^>"']+)["']?[^>]*>`, 'gmi'), // checkEditor()
    editor_image_save: new RegExp(`<img[^>]*src=["']?(\/data\/${process.env.APP_NAME}\/images\/[^>"']+)["']+[^>]*>`, 'gmi'), // checkEditor()
    editor_image_folder: new RegExp(`\/${process.env.APP_NAME}\/temp\/`, 'gmi'), // checkEditor()
    editor_image_user: new RegExp(`\/${process.env.APP_NAME}\/temp\/[\\d]{4}\/`, 'gmi') // checkEditor() > admin user note
}
type Rule = { length?: [number, number]; regex?: RegExp; check?: (input: number | string | boolean)=> boolean; msg: string; }
const $REGEX_MSG = '양식에 맞게 입력해 주세요.';
const $REGEX_RULES: Record<string, Rule> = {
    // user, register, login
    id: { length: [6, 16], regex: /^[a-z]{4}[a-z_\d]{2,16}$/, msg: `아이디 : ${$REGEX_MSG}` },
    email: { length: [10, 50], regex: /^[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/, msg: `이메일 : ${$REGEX_MSG}` },
    name: { length: [2, 12], regex: /^(?!.*(운영|관리|대표))([가-힣]{2}[가-힣\w]{0,14}|[a-zA-Z]{4}[가-힣\w]{0,12})$/, msg: `별명(대화명) : ${$REGEX_MSG}` },
    pass_code: { length: [6, 8], regex: /^[\d]{6,8}$/, msg: `본인 확인(인증) 번호 : ${$REGEX_MSG}` },
    pass: { length: [10, 20], regex: /^[\w!@#$%^&*()-=+~.]{10,20}$/, msg: `비밀번호 : ${$REGEX_MSG}` },
    pass_check: { length: [10, 20], regex: /^[\w!@#$%^&*()-=+~.]{10,20}$/, msg: `비밀번호 확인 : ${$REGEX_MSG}` },
    pass_confirm: { check: (input) => Boolean(input), msg: '비밀번호가 일치하지 않습니다.' },
    // room
    room: { length: [20, 20], regex: /^[\w_-]{20}$/, msg: `방 참여 코드 : ${$REGEX_MSG}` },
    title: { length: [4, 20], msg: `대화방 제목 : ${$REGEX_MSG}` },
    room_pass: { length: [4, 10], regex: /^[가-힣\w]{4,10}$/ , msg: `방 입장 비밀번호 : ${$REGEX_MSG}` },
    note: { length: [0, 100], msg: `내용 : ${$REGEX_MSG}`, },
}
const checkLength = (input: string, min: number, max: number): CodeData => {
    if (min !== 0 && input.length < min) return {code: 8, msg: `${min}자 이상 입력해 주세요. (${min}~${max})`}
    if (input && input.length > max) return { code: 8, msg: `${max}자 이하로 입력해 주세요. (${min}~${max})` }
    return { code: 0 };
};
const checkRule = (key: string, input: string | null | undefined): CodeData => {
    const $RULE = $REGEX_RULES[key];
    if (!$RULE) return { code: 0 };
    if (input && $REGEX.escape_check.exec(input)) {
        return { code: 1, msg: `${$RULE.msg}\n사용할 수 없는 문자가 포함되었습니다.`, note: $REGEX.escape_check.exec(input)![0] };
    }
    if (!input) {
        if ($RULE.length && $RULE.length[0] > 0) {
            return { code: 1, msg: `${$RULE.msg}\n${$RULE.length[0]}자 이상 입력해 주세요.`, note: `${$RULE.length[0]}~${$RULE.length[1]}` };
        }
        return { code: 0 };
    }
    if ($RULE.length) {
        const lengthCheck = checkLength(input, $RULE.length[0], $RULE.length[1]);
        if (lengthCheck.code !== 0) return { code: 1, msg: `${$RULE.msg}\n${lengthCheck.msg}` };
    }
    if ($RULE.regex && !$RULE.regex.test(input)) return { code: 1, msg: $RULE.msg };
    if ($RULE.check && !$RULE.check(input)) return { code: 1, msg: $RULE.msg };
    return { code: 0 };
};
// 작업 추가: client url input escape check `'", body pass: editor, params 
export const checkInput = (inputs: Record<string, string | null | undefined>): Input => {
    const sanitizedInputs: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(inputs)) {
        if (value !== undefined && value !== null) {
            const result = checkRule(key, value);
            // if (result.code !== 0) return { code: result.code, msg: result.msg, note: result.note };
            if (result.code !== 0) return { ...result };
        }
        sanitizedInputs[key] = value === '' || value === undefined || value === null ? null : value;
    }
    return { code: 0, ...sanitizedInputs };
};
type Check = { folder: string, input: string, save?: string | null }
export const checkImage = async ({ folder, input, save = null }: Check): Promise<CodeData> =>{ // input image(thumbnail)
    if(input === save) return { code: 0, data: input }
    let $URL: string | null = null;
    try{
        if(input){
            const $FOLDER_TEMP = input.replace($REGEX.input_image, '$1');
            const $FOLDER_IMAGE = $FOLDER_TEMP.replace(/\/temp\//g, `/images/${folder}/`);
            const $FOLDER_USER = $FOLDER_TEMP.replace(/\/temp\/[\d]{4}\//g, `/images/${folder}/`);
            const $FOLDER = folder === 'profile' ? $FOLDER_USER : $FOLDER_IMAGE;
            const $FILE_NAME = input.replace($REGEX.input_image, '$2'); // file name
            try {
                await fs.access($FOLDER);
            } catch (err) {
                await fs.mkdir($FOLDER, { recursive: true });
            }
            await fs.rename($FOLDER_TEMP + $FILE_NAME, $FOLDER + $FILE_NAME);
            $URL = ($FOLDER + $FILE_NAME).replace(/\\+/g, '/');
        }
        
        // if(save && (!input || input !== save)){ // 비동기
        //     try {
        //         await fs.access(save);
        //         await fs.unlink(save);
        //     } catch (err) {
        //         checkError(err, '/modules/REGEX.js, checkImage > unlink')
        //     }
        // }
        if (save && (!input || input !== save)) { // 동기
            fs.access(save).then(() => fs.unlink(save)).catch(err => checkError(err, '/modules/REGEX.js, checkImage > unlink'));
        }
        return { code: 0, data: $URL }
    }catch(err){
        checkError(err, '/modules/regex.ts, checkImage');
        return { code: 1, msg:'이미지 등록(수정)이 실패하였습니다.' };
    }
}