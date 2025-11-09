import Cookies from "js-cookie"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { storeApp, storeUser, useFetch, useModal } from "modules"
import { checkAdmin } from "modules/systems"
import { App_Login, Modal, Svg } from "components/app"

export const App_Menu = ()=>{
    const { push } = useRouter()
    const { setConfirm } = storeApp((s)=>s)
    const { user } = storeUser((s)=>s)
    const { modal, openModal, closeModal } = useModal()

    const clickHome = ()=>{
        setConfirm({ msg: '처음 화면으로 이동하시겠습니까?\n작업을 모두 종료하고 확인을 눌러주세요.', confirm: ()=> window.location.replace('/') })
    }
    const clickMenu = (menu: string)=>{
        if(menu === 'admin'){
            const $CONFIRM = ()=> push('/admin/monitor')
            setConfirm({ msg: '관리자 페이지로 이동하시겠습니까?\n작업을 모두 종료하고 확인을 눌러주세요.', confirm: $CONFIRM })
        }
        if(menu === 'profile'){
            const $CONFIRM = ()=> push('/user/profile')
            setConfirm({ msg: '내 정보(설정)로 이동하시겠습니까?\n작업을 모두 종료하고 확인을 눌러주세요.', confirm: $CONFIRM })
        }
        closeModal()
    }
    const clickLogout = async ()=>{
        const $DATA = await useFetch.get('/app/logout')
        if($DATA){
            Cookies.remove(process.env.NEXT_PUBLIC_APP_NAME!);
            return window.location.replace('/')
        }
    }
    const Modal_Menu = ()=>{
        return(<div className='wrap_flex_bt mg_t6'>
            <button className="flex_bt c_blue" onClick={()=>clickMenu('profile')}>내 정보(설정)</button>
            {checkAdmin(user.level) && <button className="flex_bt c_orange" onClick={()=>clickMenu('admin')}>⚙️관리자</button>}
            <button className="flex_bt c_red" onClick={clickLogout}>로그아웃</button>
        </div>)
    }
    
    return(<div className="layout_header">
        {modal.menu && <Modal onClose={closeModal}><Modal_Menu/></Modal>}
        {modal.login && <Modal title="로그인" onClose={closeModal}><App_Login onClose={closeModal}/></Modal>}

        <div className="header_max">
            <div className="header_menu" onClick={clickHome}><Svg name="home" size={24} color="blue" /></div>
            <div className="header_menu">
                <Link href='/chat'><span>대화하기</span></Link>
            </div>
            <div className="header_menu">
                <Link href='/update'>준비중</Link>
            </div>
            <div className="header_menu">
                {user.id ? 
                    <button className="header_bt" onClick={()=>openModal({ menu: true })}><Svg name="menu" size={24} color="blue" /></button> : 
                    <button className="header_bt c_blue" onClick={()=>openModal({ login: true })}>로그인</button>
                }
            </div>

            {/* 
                {user.id && <div className="header_menu fa_c">
                    <Link href='/list'><span>방만들기</span></Link>
                </div>}
                <div className="header_menu fa_c">
                    <Link href='/room' onClick={()=>setMenu({ tab: 'MESSENGER', messenger: false })}>참여하기</Link>
                </div>
                <div className={`header_menu fa_c ${menu.board && 'header_menu_notice'}`}>
                    <Link href='/board' onClick={()=>setMenu({ tab: 'BOARD', board: false })}><span>게시판</span></Link>
                </div>
            */}
        </div>
    </div>)
}