import Link from "next/link"

export const Board_Menu = ()=>{

    const $MENU = [
        { label: '공지(안내)', menu: 'notice', },
        { label: '게시판', menu: 'board', },
        { label: '자료실', menu: 'data', },
    ]

    return(
        <div className="max_w100">
            <div className="box">
                {$MENU.map((e)=>
                    <Link href={`/room/board/${e.menu}/1`} className="room_menu" key={e.label}><div>{e.label}</div></Link>
                )}
            </div>
            
        </div>
    )
}