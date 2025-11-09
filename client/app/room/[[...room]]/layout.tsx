'use client'
import { storeRoom } from "modules";
import { $APP_STATUS, App_Status } from "components/app";
import { Room_Menu } from "components/room";

export default function Layout({ children }: { children: React.ReactNode }){
    const { room } = storeRoom((s)=>s)
    
    if(room.status < $APP_STATUS['1_ROOM']) return(<App_Status router="ROOM" status={room.status}/>)

    return(<div className="layout_max">
        <Room_Menu/>
        {children}
    </div>)
}