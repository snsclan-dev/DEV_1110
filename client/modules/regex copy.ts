// client <=> server
import { useMemo } from "react";
import type { Popup } from "types";

export const $REGEX = {
    escape_check: /[`\\]/, 
    escape_replace: /[`\\]/gm,
    upload_image: new RegExp(`^\\s*|\/data\/${process.env.NEXT_PUBLIC_APP_NAME}\/(?:temp\/[\\d]{4}|images\/[^\\s]+)\/[^\\s]+?.(?:jpg|jpeg|png|gif|bmp|webp|svg)`, 'gmi'),
    url_image: /(http(s)?:\/\/[^\s]+?\.(bmp|png|gif|jpe?g|webp))/gi,
    url_video: /(http(s)?:\/\/[^\s]+?\.(mp4))/gi,
}
export const $REGEX_GUIDE = {
    id: '영문(소) 4자 이후, 숫자, 밑줄 (6~20)', name: '한글 2자 또는, 영문 4자 이후, 숫자, 밑줄 (2, 4~12)', email: '가입 인증 이메일이 발송됩니다. (10~50)', pass: '숫자 위 특수 문자, -_=+~. 가능 (10~20)', pass_code: '숫자 (6~8)',

    board_list_title: '글 제목을 입력해 주세요 (4~100)',
    room_title: '방 제목을 입력해 주세요 (4~20)',
    image: '대표 이미지 등록 (0~200)',
    price: '1,000 이상 숫자만 입력해 주세요.',
    period: '이벤트 기간을 입력(선택)해 주세요.', // event
    link: '연결 주소(URL)를 입력해 주세요. (https만 가능)',
    tag: '태그를 입력해 주세요. 공백X, 콤마( , )로 구분, 각 태그는(2~10) (0~30)',

    note: '100자 이하로 입력해 주세요',
    chat_title: '대화방 제목을 입력해 주세요. (4~20)',
    room: '방 참여 코드를 입력해 주세요. (20)',
    room_pass: '방 입장 비밀번호를 입력해 주세요. 한/영, 숫자 (4~10)',
    room_max: '방 참여자를 입력해 주세요 (2~99)',
}
type Rule = { label?: string; length?: [number, number]; regex?: RegExp; check?: (input: number | string | boolean)=> boolean; msg?: string; }
const $REGEX_MSG = '양식에 맞게 입력해 주세요.';
const $REGEX_RULES: Record<string, Rule> = {
    // user, register, login
    id: { label: '아이디', length: [6, 16], regex: /^[a-z]{4}[a-z_\d]{2,16}$/, msg: `아이디 : ${$REGEX_MSG}` },
    email: { label: '이메일', length: [10, 50], regex: /^[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/, msg: `이메일 : ${$REGEX_MSG}` },
    name: { label: '별명(대화명)', length: [2, 12], regex: /^(?!.*(운영|관리|대표))([가-힣]{2}[가-힣\w]{0,14}|[a-zA-Z]{4}[가-힣\w]{0,12})$/, msg: `별명(대화명) : ${$REGEX_MSG}` },
    pass_code: { label: '본인 확인(인증) 번호', length: [6, 8], regex: /^[\d]{6,8}$/, msg: `본인 확인(인증) 번호 : ${$REGEX_MSG}` },
    pass: { label: '비밀번호', length: [10, 20], regex: /^[\w!@#$%^&*()-=+~.]{10,20}$/, msg: `비밀번호 : ${$REGEX_MSG}` },
    pass_check: { label: '비밀번호 확인', length: [10, 20], regex: /^[\w!@#$%^&*()-=+~.]{10,20}$/, msg: `비밀번호 확인 : ${$REGEX_MSG}` },
    pass_confirm: { check: (input) => Boolean(input), msg: '비밀번호가 일치하지 않습니다.' },
    // room
    room: { label: '방 참여 코드', length: [20, 20], regex: /^[\w_-]{20}$/ },
    title: { label: '방 제목',  length: [4, 20], msg: `대화방 제목 : ${$REGEX_MSG}` },
    room_pass: { label: '방 비밀번호', length: [4, 10], regex: /^[가-힣\w]{4,10}$/ , msg: `방 입장 비밀번호 : ${$REGEX_MSG}` },
    note: { label: '방 내용(안내)', length: [0, 100], msg: `내용 : ${$REGEX_MSG}`, },
}
const checkLength = (input: string, min: number, max: number, label?: string): Popup => {
    if(!input && min > 0) return { code: 9, msg: `${label} : 내용을 입력해 주세요.` }
    if(min === max && input.length !== min) return { code: 9, msg: `${min}자가 아닙니다. (${min})`}
    if (min !== 0 && input.length < min) return { code: 9, msg: `${min}자 이상 입력해 주세요. (${min}~${max})` };
    if (input && input.length > max) return { code: 9, msg: `${max}자 이하로 입력해 주세요. (${min}~${max})` }
    return { code: 0 };
};
const checkRule = (key: string, value: number | string | boolean): Popup => {
    const $RULE = $REGEX_RULES[key];
    if (!$RULE) return { code: 0 };
    if ($RULE.length && typeof value === 'string') {
        const lengthCheck = checkLength(value, $RULE.length[0], $RULE.length[1], $RULE.label);
        // if (lengthCheck.code !== 0) return { code: 9, msg: `${$RULE.msg}\n${lengthCheck.msg}` };
        if (lengthCheck.code !== 0) return lengthCheck;
    }
    // if ($RULE.check && !$RULE.check(value)) return { code: 9, msg: $RULE.msg };
    // if (typeof value === 'string' && $RULE.regex && !$RULE.regex.test(value)) return { code: 9, msg: $RULE.msg };
    if (($RULE.check && !$RULE.check(value)) || (typeof value === 'string' && $RULE.regex && !$RULE.regex.test(value))){
        // return { code: 9, msg: `${$RULE.label} : 양식에 맞게 입력해 주세요.`, note: $REGEX_GUIDE[key as keyof typeof $REGEX_GUIDE] ?? null };
        return { code: 9, msg: $RULE.label ? `${$RULE.label} : 양식에 맞게 입력해 주세요.` : $RULE.msg, note: $REGEX_GUIDE[key as keyof typeof $REGEX_GUIDE] ?? null };
    }
    return { code: 0 };
};
export const checkInput = (inputs: Record<string, string | boolean>): Popup => {
    for (const [key, value] of Object.entries(inputs)) {
        const $FIND = checkRule(key, value);
        if ($FIND.code !== 0) return $FIND;
    }
    return { code: 0 };
};
const checkInputColor = (name: string, value: string): boolean => {
    const $RULE = $REGEX_RULES[name];
    if (!$RULE) return true;
    if ($RULE.length) {
        const [min, max] = $RULE.length;
        if (value.length < min || value.length > max) return false;
    }
    if ($RULE.regex && !$RULE.regex.test(value)) return false;
    if ($RULE.check && !$RULE.check(value)) return false;
    return true;
};
type InputColor = Record<string, string>;
export const useInputColor = (input: InputColor) => {
    const inputClass = useMemo(() => {
        const result: InputColor = {};
        for (const [key, value] of Object.entries(input)) {
            result[key] = checkInputColor(key, value) ? "c_green" : "c_red";
        }
        return result;
    }, [input]);
    return inputClass;
};