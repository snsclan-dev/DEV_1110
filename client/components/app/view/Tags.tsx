import { ReactNode, useState } from "react";
import { Svg } from "./Svg";

type Tag = { label?: string; size?: number; color?: string; inputColor?: string; style?: string; children: ReactNode; }

export const Title = ({ title, color = 'c_gray', children }: { title: string, color?: string, children?: ReactNode })=>{
    return(<div className="box_lgray w_100 align pd_6 mg_b20">
        <p className="flex_1 pd_l3"><span className={`fs_13 ${color} fwb`}>{title}</span></p>
        {children && <p className="ta_r">{children}</p>}
    </div>)
}
export const Br = ({ height }: { height: number })=>{
    return(<p className={`pd_h${height}`}/>)
}
export const Hr = ({ h = 0, w = 0 }: { h?: number, w?: number })=>{
    return(<div className={`pd_hw${h}-${w}`}><hr/></div>)
}
export const Title1 = ({ color = 'c_gray', children }: Tag)=>{
    return(<div className="pd_h10 mg_b6">
        <p className={`fwb ${color} pd_l3`}>{children}</p>
        <hr />
    </div>)
}
export const Label = ({ label, color = 'c_gray', children }: Tag)=>{
    return(<><span className={`fs_13 ${color}`}>{label} : </span>{children}</>)
}
export const Label_InputColor = ({ label, color = 'c_blue', inputColor = '', children }: Tag)=>{
    return(<p className="lh_26 fs_13 pd_l3"><span className={`${color} fwb`}>{label} : </span><span className={inputColor}>{children}</span></p>)
}
export const Label_Output = ({ label = '', color = 'c_gray', children }: Tag)=>{
    if(!label) return(<div className="output align">{children}</div>)
    return(<div className="output align"><span className={`fs_13 ${color} mg_r4`}>{label} :</span>{children}</div>)
}
export const Li = ({ color = 'lgray', style = '', children }: Tag) => {
    return (<div className={`li_grid ${style}`}>
        <span><Svg name="li" size={12} color={color} minXY="0 -800"/></span>
        <span>{children}</span>
    </div>);
}
export const Li_Item = ({ item, color = 'lgray', style = '', children }: Tag & { item: '-' | '>' | '>>' })=>{
    return (<div className={`li_grid ${style}`}>
        <span><Svg name={item} size={20} color={color} minXY="-250 -880"/></span>
        <span>{children}</span>
    </div>);
}
export const Li_Label = ({ label, color = 'c_gray', style, children }: Tag)=>{
    return(<p className={style}>
        <span className={`fs_13 fwb c_${color} pd_l3`}>{label}</span><Svg name="li_dot" size={12} color={color} />
        {children}
    </p>)
}
// 로딩 버튼
export const Button = ({ style, time = 1000, onClick, children }: { style?: string; time?: number; onClick: ()=> void, children: ReactNode })=>{
    const [click, setClick] = useState(false);
    const clickSpinner = ()=>{
        setClick(true);
        setTimeout(()=> {
            setClick(false);
            onClick();
        }, time);
    }
    return(<>
        {click && <div className="layout_loading"/>}
        <button className={`relative ${style}`} onClick={clickSpinner} disabled={click}>
            {click && <span className="layout_spinner">
                <span className="spinner" />
            </span>}
            <span className={click ? 'invisible' : 'visible'}>{children}</span>
        </button>
    </>)
}