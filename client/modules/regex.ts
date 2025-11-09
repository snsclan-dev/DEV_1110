import { useMemo } from "react";
import type { Popup } from "types";
import { checkAdmin } from "./systems";

export const $REGEX = {
    escape_check: /[`\\]/, 
    escape_replace: /[`\\]/gm,
    upload_image: new RegExp(`^\\s*|\/data\/${process.env.NEXT_PUBLIC_APP_NAME}\/(?:temp\/[\\d]{4}|images\/[^\\s]+)\/[^\\s]+?.(?:jpg|jpeg|png|gif|bmp|webp|svg)`, 'gmi'),
    url_image: /(http(s)?:\/\/[^\s]+?\.(bmp|png|gif|jpe?g|webp))/gi,
    url_video: /(http(s)?:\/\/[^\s]+?\.(mp4))/gi,
}
// client <=> server ----------
export const $REGEX_GUIDE = {
    // app
    id: '영문(소) 4자 이후, 숫자, 밑줄 (6~20)', name: '한글 2자 또는, 영문 4자 이후, 숫자, 밑줄 (2, 4~12)', email: '@앞 4자 이상 (4~50)', pass: '숫자 위 특수 문자, -_=+~. 가능 (10~20)', pass_code: '숫자 (6~8)',
    // chat
    chat_code: '대화방 참여 코드를 입력해 주세요. (20)',
    // room
    room_code: '대화방 이름(코드)을 입력해 주세요. (20)', room_title: '대화방 코드를 입력해 주세요. (4~20)', room_pass: '방 입장 비밀번호를 입력해 주세요. 한/영, 숫자 (4~10)', room_max: '방 참여자를 입력해 주세요 (2~99)',
    // board
    board_title: '글 제목을 입력해 주세요 (4~50)',
    image: '대표 이미지 등록 (0~200)',
    price: '1,000 이상 숫자만 입력해 주세요.',
    period: '이벤트 기간을 입력(선택)해 주세요.', // event
    link: '연결 주소(URL)를 입력해 주세요. (https만 가능)',
    tag: '태그를 입력해 주세요. 공백X, 콤마( , )로 구분, 각 태그는(2~10) (0~30)',
    note: '100자 이하로 입력해 주세요',
}
type Rule = { label?: string; length?: [number, number]; regex?: RegExp; check?: (input: number | string | boolean)=> boolean; msg?: string; invalid?: RegExp }
const $REGEX_INPUT = /[`\\]/g; // 금지 문자 설정
const $REGEX_RULES: Record<string, Rule> = {
    // app(user, register, login)
    id: { label: '아이디', length: [6, 16], regex: /^[a-z]{4}[a-z_\d]{2,16}$/ },
    email: { label: '이메일', length: [6, 50], regex: /^[\w._%+-]{4,}@[\w.-]+\.[a-zA-Z]{2,}$/ },
    name: { label: '별명(대화명)', length: [2, 12], regex: /^(?!.*(운영|관리|대표))([가-힣]{2}[가-힣\w]{0,14}|[a-zA-Z]{4}[가-힣\w]{0,12})$/, invalid: /운영|관리|대표/g },
    pass_code: { label: '본인 확인(인증) 번호', length: [6, 8], regex: /^[\d]{6,8}$/ },
    pass: { label: '비밀번호', length: [10, 20], regex: /^[\w!@#$%^&*()-=+~.]{10,20}$/ },
    pass_check: { label: '비밀번호 확인', length: [10, 20], regex: /^[\w!@#$%^&*()-=+~.]{10,20}$/ },
    pass_confirm: { check: (input) => Boolean(input), msg: '비밀번호가 일치하지 않습니다.' },
    // board
    board_title: { label: '글 제목', length: [4, 50] },
    // chat
    chat_code: { label: '대화방 참여 코드', length: [20, 20], regex: /^[\w_-]{20}$/ },
    // room
    room_code: { label: '방 참여 코드', length: [20, 20], regex: /^[\w_-]{20}$/ },
    room_title: { label: '방 이름',  length: [4, 20] },
    room_pass: { label: '방 비밀번호', length: [4, 10], regex: /^[가-힣\w]{4,10}$/ },
    note: { label: '방 내용(안내)', length: [0, 100] },
}
// code 변경 > server code: 1, client code: 9
const checkLength = (input: string, min: number, max: number, label?: string): Popup => {
    if(!input && min > 0) return { code: 9, msg: `${label} : 내용을 입력해 주세요.` }
    if(min === max && input.length !== min) return { code: 9, msg: `${label} : ${min}자가 아닙니다. (${min})`}
    if (min !== 0 && input.length < min) return { code: 9, msg: `${label} : ${min}자 이상 입력해 주세요. (${min}~${max})` };
    if (input && input.length > max) return { code: 9, msg: `${label} : ${max}자 이하로 입력해 주세요. (${min}~${max})` }
    return { code: 0 };
};
const checkRule = (key: string, value: number | string | boolean, admin = false): Popup => {
    const $RULE = $REGEX_RULES[key];
    if (!$RULE) return { code: 0 };
    if(typeof value === 'string'){
        const invalidInput = value.match($REGEX_INPUT) || [];
        if (invalidInput.length > 0) return { code: 9, msg: `${$RULE.label} : 허용되지 않는 문자가 포함되어 있습니다.`, note: `허용되지 않는 문자 : ${invalidInput.join(", ")}` };
        if (!admin && $RULE.invalid) {
            const invalid = value.match($RULE.invalid) || [];
            if (invalid.length > 0) return { code: 9, msg: `${$RULE.label} : 허용되지 않는 문자가 포함되어 있습니다.`, note: `허용되지 않는 문자 : ${invalid.join(", ")}` };
        }
        if ($RULE.length) {
            const $CHECK = checkLength(value, $RULE.length[0], $RULE.length[1], $RULE.label);
            if ($CHECK.code !== 0) return $CHECK;
        }
    }
    if (($RULE.check && !$RULE.check(value)) || (typeof value === 'string' && $RULE.regex && !$RULE.regex.test(value))){
        return { code: 9, msg: $RULE.label ? `${$RULE.label} : 양식에 맞게 입력해 주세요.` : $RULE.msg, note: $REGEX_GUIDE[key as keyof typeof $REGEX_GUIDE] ?? null };
    }
    return { code: 0 };
};
// ========== client <=> server
export const checkInput = (inputs: Record<string, string | boolean>, admin = false): Popup => {
    for (const [key, value] of Object.entries(inputs)) {
        const $FIND = checkRule(key, value, admin);
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