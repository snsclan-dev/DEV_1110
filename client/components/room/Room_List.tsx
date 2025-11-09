import Link from "next/link"
import { Pagination, storeUser, useModal, useListPage } from "modules"
import { Message, Modal, Title, Label, View_Date } from "components/app"
import { Room_Create } from "components/room"
import { User_Level } from "components/user"

export const Room_List = ()=>{
    const { user } = storeUser((state)=>state)
    const { modal, openModal, closeModal } = useModal()
    const { list, paging, setPage } = useListPage('/room/list')

    return(<>
        {modal.create && <Modal title="방 만들기" onClose={closeModal}><Room_Create onClose={closeModal}/></Modal>}

        <Title>방 목록</Title>
        <div className="box pd_6 ta_r mg_b10">
            <button className="bt_3 c_blue" onClick={()=>openModal({ create: true })}>방만들기</button>
        </div>

        {list.length ? <div className="wrap_room">
            {list.map((e)=> <div key={e.num} className="room_list pd_6">
                <Link href={`/room/${e.room}`}>
                    <p className="lh_26 pd_l3 fwb ellipsis">{e.title}</p>
                    <p className="lh_26 pd_l3 ellipsis mg_b10">{e.note ? e.note : <span className="c_lgray">내용(안내) 없음</span>}</p>
                    <p className="line w_70"><User_Level level={e.level}/> <span className="c_lblue fs_13 fwb">{e.name}</span></p>
                    <p className="line w_30 ta_r pd_r1"><View_Date date={e.updated}/></p>
                    {/* <div className="pd_h10"><hr /></div> */}
                    <div className="flex_between mg_h1">
                        <div className="box pd_6 ta_c">
                            <Label label="방장"><span className={`${e.room_host ? 'c_green' : 'c_lgray'} fwb`}>{e.room_host ? '온라인' : '오프라인'}</span></Label>
                        </div>
                        <div className="box pd_6 ta_c">
                            <Label label="대기실"><span className="c_green fwb">{e.room_wait}</span></Label>
                        </div>
                        <div className="box pd_6 ta_c">
                            <Label label="참여자"><span className={`${e.room_max <= e.room_now ? 'c_red' : 'c_green'} fwb`}>{e.room_now} / {e.room_max}</span></Label>
                        </div>
                    </div>
                </Link>
            </div>)}
        </div> : <Message>만들어진 대화방이 없습니다.</Message>}

        <Pagination paging={paging} page={setPage}/>

    </>)
}