import { View_Char } from "components/app";
import { checkAdmin, checkManager, dateNow } from "modules/systems";
import type { User } from "types";

export const $USER_LEVEL = [ // user level(style)
    { num: 0, level_min: 0, level_max: 0, style: 'level_lgray', level_name: '손님' }, { num: 1, level_min: 1, level_max: 9, style: 'level_gray' },
    { num: 2, level_min: 10, level_max: 19, style: 'level_green' },
    { num: 3, level_min: 20, level_max: 39, style: 'level_blue' }, { num: 4, level_min: 40, level_max: 59, style: 'level_pink' }, { num: 5, level_min: 60, level_max: 79, style: 'level_purple'},
    { num: 8, level_min: 80, level_max: 89, style: 'level_black' }, { num: 9, level_min: 90, level_max: 99, style: 'level_orange' },
    { num: 100, level_min: 100, level_max: 100, style: 'level_orange', level_name: '관리' }, { num: 200, level_min: 200, level_max: 200, style: 'level_red', level_name: '운영' },
]
const $CHAT_STATUS = [
    { status: 0, style: 'level_lgray', name: '손님' },
    { status: 1, style: 'level_blue', name: '방장' },
    { status: 2, style: 'level_lgray', name: '손님' },
]
export const User_Level_View = ()=>{
    return $USER_LEVEL.map((e)=> <span key={e.num} className={e.style}>{e.level_name && e.level_name} {e.level_min} / {e.level_max}</span>)
}
export const User_Level = ({ level }: { level: number }) => {
    const $FIND = $USER_LEVEL.find((e) => e.level_min <= level && e.level_max >= level);
    if ($FIND) return <span className={$FIND.style}>{$FIND.level_name ?? level}</span>;
    return <span className="level_lgray">X</span>;
};
export const User_Group = ({ group_list }: { group_list: string })=>{
    const $USER_GROUP = group_list ? group_list.split(',') : []
    {$USER_GROUP.map((e, i)=> e && <button key={i} className="tag_pink">{e}</button>)}
    return <p className="fs_13 c_gray"><span className="mg_w">그룹</span>{$USER_GROUP.length ? $USER_GROUP.map((e, i)=> e && <button key={i} className="tag_pink">{e}</button>) : <span>없음</span>}</p>
}
export const User_Tag = ({ type, obj }: { type: string, obj: { user_position: string, user_title: string, user_tag: string} })=>{
    const { user_position, user_title, user_tag } = obj
    const $USER_POSITION = user_position ? user_position.split(',') : []
    const $USER_TITLE = user_title ? user_title.split(',') : []
    const $USER_TAG = user_tag ? user_tag.split(',') : []
    if(type === 'line') return(<>
        {$USER_POSITION.map((e, i)=> e && <button key={i} className="tag_orange">{e}</button>)}
        {$USER_TITLE.map((e, i)=> e && <button key={i} className="tag_blue">{e}</button>)}
        {$USER_TAG.map((e, i)=> e && <button key={i} className="tag_green">{e}</button>)}
    </>)
    if(type === 'block') return(<>
        <p className="box_input pd fs_13 c_gray mg_b6 align"><span className="mg_w">담당</span>{$USER_POSITION.length ? $USER_POSITION.map((e, i)=> e && <button key={i} className="tag_orange">{e}</button>) : <span>없음</span>}</p>
        <p className="box_input pd fs_13 c_gray mg_b6 align"><span className="mg_w">칭호</span>{$USER_TITLE.length ? $USER_TITLE.map((e, i)=> e && <button key={i} className="tag_blue">{e}</button>) : <span>없음</span>}</p>
        <p className="box_input pd fs_13 c_gray align"><span className="mg_w">태그</span>{$USER_TAG.length ? $USER_TAG.map((e, i)=> e && <button key={i} className="tag_green">{e}</button>) : <span>없음</span>}</p>
    </>)
    return null;
}
export const $USER_STATE = { '0_normal': 0, '1_wait': 1, '7_block': 7, '8_delete': 8, '9_delete_admin': 9, '10_delete_user': 10 } // 1: email auth
const $STATE: Record<string, { color: string, text: string }> = {
    0: { color: 'c_green', text: '정상 회원입니다.' }, 1: { color: 'c_gray', text: '이메일 인증 대기 회원입니다.' },
    7: { color: 'c_red', text: '이용이 정지(차단)된 회원입니다.' }, 8: { color: 'c_red', text: '탈퇴한 회원입니다.' }, 9: { color: 'c_red', text: '퇴출된 회원입니다.' },
}
export const userState = (obj: { blocked: string, state: number })=>{
    const { blocked, state } = obj;
    if(state >= $USER_STATE['7_block']) return state;
    if(blocked && blocked >= dateNow()) return $USER_STATE['7_block'];
    return state;
}
export const User_State = ({ obj }: { obj: { blocked: string, state: number }}) => {
    const { blocked, state } = obj; // level: login level
    const $STATE_NUM = userState({ blocked, state });
    const $SELECT = $STATE[$STATE_NUM];
    if (!$SELECT) return (<>
        <span className="c_red fwb">상태 오류</span>
        <View_Char char="vl" />
        state <span className="c_red fwb">{state || "UNDF"}</span>
        <View_Char char="vl" />
        blocked <span className="c_red fwb">{blocked || "UNDF"}</span>
    </>)
    return <span className={`fwb ${$SELECT?.color}`}>{$SELECT?.text}</span>;
};
export const User_Admin = ({ level }: { id: string, level: number, user: User }) => {
    if (checkAdmin(level)) return <span className="fs_13 c_orange fwb">⚙️ 운영자로 접속 중입니다.</span>;
    if (checkManager(level)) return <span className="fs_13 c_orange fwb">🔓 관리자로 접속 중입니다.</span>;
    return null;
};
export const User_Id = ({ id, level, user }: { id: string, level: number, user: User }) => {
    // obj
    if (!user.id || !user.level) return null;
    if (checkAdmin(level)) return "⭐";
    if (checkManager(user.level)) return (<span className="fs_13 c_orange fwb">{id}</span>)
    return (<span className="fs_13 c_gray fwb">{id.substring(0, 4)}*</span>)
};
export const User_Ip = ({ ip, level, user }: { ip: string, level: number, user: User }) => {
    if (!ip) return <span className="fs_13 c_lgray">X</span>;
    if (checkAdmin(level)) return "⭐";
    if (checkManager(user.level)) return (<span className="fs_13 c_orange fwb">{ip}</span>)
    const $IP = /(\d+)[.](\d+)[.](\d+)[.](\d+)/g;
    return (<span className="fs_13 c_blue">{ip.replace($IP, "🔒.🔒.$3.$4")}</span>)
};