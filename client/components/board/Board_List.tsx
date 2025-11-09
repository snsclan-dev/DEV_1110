import Link from "next/link"
import { Pagination, useListPage, useModal } from "modules"
import { Message, Title, View_Count, View_Date } from "components/app"
import { User_Level } from "components/user"
import type { BoardParams } from "types"

type BoardList = { params: BoardParams, like?: boolean; hit?: boolean; }
export const Board_List = ({ params, like=true, hit=true }: BoardList)=>{
    const { modal, openModal, closeModal } = useModal()
    const { list, paging, setPage } = useListPage({ url: '/board/list', room: 'room', menu: 'user', category: 'free' })
    // const { list, paging, setPage } = useListPage({ url: '/board/list', room: 'CuZaNNVGcjvMx9qa44Qe', menu: 'user', category: 'free' })

    return(<div className="max_w100">

        <Title title="공지 및 안내사항"><button className="bt_34 c_orange fwb">글쓰기</button></Title>

        {list.length ? <>
            <div className="layout_board_label pd_w6 fs_12 c_gray">
                <div className="wrap_board_title fa_c"><span className="board_label_none">제목</span></div>
                <div className="wrap_board_info">
                    <p className="board_list_name ta_c"><span className="board_label_none">작성자</span></p>
                    {like && <p className="board_list_like ta_c">좋아요</p>}
                    {hit && <p className="board_list_hit ta_c">조회</p>}
                    <p className="board_list_update pd_l8 ta_c">등록</p>
                </div>
            </div>
            {list.map((e)=> <div key={e.num} className="layout_board_list pd_6">
                <Link className="wrap_board_title" href={`${e.num}`}>
                    <p className="board_list_title ellipsis">{e.title}</p>
                    <button className="board_list_comment mg_l5"><View_Count count={e.comment}/></button>
                </Link>
                <div className="wrap_board_info">
                    <p className="board_list_name ellipsis align"><User_Level level={e.level}/>{e.name}</p>
                    {like && <p className="board_list_like"><span className="fs_12 mg_r4">🩶</span><View_Count count={e.count_like}/></p>}
                    {hit && <p className="board_list_hit ta_c"><View_Count count={e.hit}/></p>}
                    <p className="board_list_update ta_r"><View_Date date={e.created}/></p>
                </div>
            </div>)}
        </> : <Message>만들어진 대화방이 없습니다.</Message>}

        <Pagination paging={paging} setPage={setPage}/>

    </div>)
}