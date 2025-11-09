import { Char, Hr, Svg, View_Count } from "components/app";
import { User_Level } from "components/user";
import { checkAdmin } from "modules/systems";
import { ReactNode } from "react";
import { BoardData, User } from "types/app";

// export const $BOARD_STATE = { '0_normal': 0, '1_notice': 1, '2_period': 2, '3_period_end': 3, '4_price': 4, '6_report': 6, '7_view': 7, '8_delete': 8, '9_delete_admin': 9, '10_delete_data': 10 }
export const $BOARD_STATE = { '0_normal': 0, '1_notice': 1, '3_price': 3, '6_report': 6, '7_view': 7, '8_delete': 8, '9_delete_admin': 9, '10_delete_data': 10 }
export const $BOARD_REPORT = 5;
const $STATE: Record<number, { label: string, style: string, text: string }> = {
    0: { label: '정상', style: 'green', text: '정상 게시물입니다.', },
    1: { label: '공지', style: 'orange', text: '중요 알림 게시물입니다.', },
    3: { label: '구매', style: 'pink', text: '구매(낙찰) 성공!', }, // comment
    6: { label: '신고', style: 'red', text: '신고된 게시물입니다.', },
    7: { label: '숨김', style: 'pink', text: '숨겨진 게시물입니다.', },
    8: { label: '삭제', style: 'red', text: '삭제된 게시물입니다.', },
    9: { label: '관리', style: 'red', text: '규칙 위반으로 삭제되었습니다.', },
};
export const Board_Info = ({ obj, user, onClick }: { obj: BoardData, user: User, onClick?: ()=>void }) => {
    return (<>
        <div className="board_view_title bg pd_hw6-10 mg_b6">{obj.title}</div>
        <div className="board_view_writer">
            <p className="fs_13"><User_Level level={obj.level}/>{obj.name}</p>
            <p className="fs_13 c_gray">
                등록<span className="c_black mg_l4">{obj.created.substring(2, 16)}</span>
                {obj.updated && <><Char char="vl"/>수정<span className="c_green mg_l4">{obj.updated.substring(2, 16)}</span></>}
            </p>
        </div>
        <div className='line w_90 fs_13 c_gray'>
            번호<span className="c_black mg_l4">{obj.num}</span><Char char="vl"/>
            댓글 <View_Count count={obj.comment}/><Char char='vl'/>좋아요 <View_Count count={obj.count_like}/><Char char='vl'/>조회 <View_Count count={obj.count_hit}/>
        </div>
        {(checkAdmin(user.level) || obj.user_id === user.id) && <div className='line w_10 ta_r' onClick={onClick}><Svg name="menu" color="blue"/></div>}
        <div className='line w_10 ta_r' onClick={onClick}><Svg name="menu" color="orange"/></div>
    </>);
};
export const Board_State = ({ type, state }: { type: string; state: number }) => {
    const $FIND = $STATE[state];
    if (type === "list") return null;
    if (type === "read") return null;
    if (type === "comment") return null;
    if (type === "modal") return(<div className={`box_board_state bg_${$FIND.style} mg_b10`}><button className="tag_green">정상</button><span className={`c_${$FIND.style} mg_l6`}>{$FIND.text}</span></div>);
    return null;
};