import { setScroll, storeApp } from "modules"
import { Svg } from "./view/Svg"

export const App_Footer = ()=>{
    const { editorView, seteditorView } = storeApp((s)=>s)
    
    return(<div className="layout_footer pd_6 ta_c">
        <button className="btm_30" onClick={()=>setScroll('top')}><Svg name="up" color="blue"/></button>
        <button className="btm_30" onClick={()=>setScroll('bottom')}><Svg name="down" color="blue"/></button>
        <button className="btm_30" onClick={()=>seteditorView(!editorView)}>{editorView ? <Svg name="view" color="blue"/> : <Svg name="grid" color="blue"/>}</button>
    </div>)
}