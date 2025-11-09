import Link from "next/link"
import { storeRoom } from "modules";

export const Room_Menu = ()=>{
    const { room } = storeRoom((s)=>s);

    const $MENU = [
        { label: '공지(안내)', menu: 'notice', },
        { label: '게시판', menu: 'board', },
        { label: '자료실', menu: 'data', },
    ]

    return(<div className="flex box mg_b10">
        {$MENU.map((e)=>
            <Link href={`/room/${room.room}/${e.menu}/1`} className="room_menu ta_c" key={e.label}><div>{e.label}</div></Link>
        )}
    </div>)
}