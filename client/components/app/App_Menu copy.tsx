import Cookies from "js-cookie"
import Link from "next/link"
import { storeApp, storeUser, useFetch, useModal } from "modules"
import { Modal, Svg } from "components/app"

export const App_Menu = ()=>{
    const { setConfirm } = storeApp((s)=>s)
    const { user } = storeUser((s)=>s)
    const { modal, openModal, closeModal } = useModal()

    const clickHome = ()=>{
        setConfirm({ msg: '처음 화면으로 이동하시겠습니까?\n작업을 모두 종료하고 확인을 눌러주세요.', confirm: ()=> location.replace('/') })
    }
    const clickLogout = async ()=>{
        const $DATA = await useFetch.get('/app/logout')
        if($DATA){
            Cookies.remove(process.env.NEXT_PUBLIC_APP_NAME!);
            return location.replace('/')
        }
    }
    const $MENU = ()=>{
        return(<div className='wrap_flex_bt mg_t6'>
                {/* <button className="bt_main c_orange" onClick={()=>clickMenu('profile')}>내 정보(설정)</button> */}
                <button className="flex_bt c_red" onClick={clickLogout}>로그아웃</button>
                {/* {checkAdmin(user.level) && <button className="bt_main c_orange" onClick={()=>clickMenu('admin')}>⚙️관리자</button>} */}
        </div>)
    }
    
    // if(!['WAIT', 'CHAT'].includes(status)) return(<div className="layout_header">
    // if(roomStatus < $ROOM_STATUS['WAIT_2']) return(<div className="layout_header">
    return(<div className="layout_header">
        {modal.menu && <Modal onClose={closeModal}><$MENU/></Modal>}

        <div className="header_max">
            <div className="header_menu_svg" onClick={clickHome}><Svg name="home" size={24} color="blue" /></div>
            {/* <div className="header_menu">
                <Link href={`${process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_APP_URL : process.env.NEXT_PUBLIC_CLIENT_HOST}`} target="_parent">
                    <button className="header_bt c_blue">{$META.app_name}</button>
                </Link>
            </div> */}
            {user.id && <div className="header_menu fa_c">
                <Link href='/list'><span>방만들기</span></Link>
            </div>}
            <div className="header_menu fa_c">
                <Link href='/room'><span>참여하기</span></Link>
            </div>
            <div className="header_menu_svg fa_e">
                {/* {user.id ? <button onClick={()=>openModal({ menu: true })}>메뉴</button> : <Link href='/login'><button className="header_bt c_blue">로그인</button></Link>} */}
                {user.id ? <button className="header_bt" onClick={()=>openModal({ menu: true })}><Svg name="menu" size={24} color="blue" /></button> : <Link href='/login'><button className="header_bt c_blue">로그인</button></Link>}
                
            </div>
        </div>
    </div>)
}