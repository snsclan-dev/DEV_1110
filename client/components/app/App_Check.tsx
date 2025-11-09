import Cookies from "js-cookie";
import { useEffect } from "react";
import { storeApp, storeUser, useInput } from "modules";
import { $LOCATION_MSG, Svg } from "components/app";

export const App_Check = ()=>{
    const { setPopup } = storeApp((s)=>s)
    const { user } = storeUser((s)=>s)
    const [input, setInput] = useInput<{ sound: boolean }>({ sound: false })

    useEffect(() => {
        setInput({ sound: Cookies.get("sound") === "true" });
    }, [setInput]);

    const clickLocation = ()=>{ // 위치 권한 요청
        if(!user.location) setPopup($LOCATION_MSG)
        navigator.geolocation.getCurrentPosition(() => {}, (error)=>{
            if(error.code === error.PERMISSION_DENIED){
                setPopup($LOCATION_MSG);
            }else{
                setPopup({ msg: '위치 권한 요청 오류.', note: `오류(코드): GEO_LOCATION\n내용: ${error.message}`});
            }
        }, { enableHighAccuracy: true, maximumAge: 0 });
    }
    const clickSound = (e: React.ChangeEvent<HTMLInputElement>)=>{
        if(e.target.checked){
            Cookies.set('sound', 'true')
            setInput({ sound: true });
        }else{
            Cookies.remove('sound')
            setInput({ sound: false });
        }
    }

    return(<div className="max_w40 box pd_10 mg_5a">
        <p className="align cursor" onClick={clickLocation}>
            <Svg name='check' size={20} color={user.location ? 'green' : 'red'}/><span className="mg_l6">위치 정보를 허용해 주세요.</span>&nbsp;{!user.location && <span className="fs_13 c_blue fwb">[ 클릭 ]</span>}
        </p>
        <p className="fs_13"><Svg name='>' size={20}/>위치 정보는 지역 표시와 거리 계산에 사용됩니다.</p>
        
        <div className="pd_h6"><hr /></div>

        <p className="lh_26 align">
            <input id="check_sound" className="input_check" type="checkbox" name="sound" onChange={clickSound} checked={input.sound} />
            <label htmlFor="check_sound" className="fs_13">알림 (소리)<Svg name='>' size={20}/>{input.sound ? <span className="c_green fwb">[ 켜짐 ]</span> : <span className="c_red fwb">[ 꺼짐 ]</span>}</label>
        </p>
    </div>)
}