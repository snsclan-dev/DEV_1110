'use client'
import { storeChat } from "modules"
import { $APP_STATUS, App_Status } from "components/app"

export default function Layout({ children }: { children: React.ReactNode }){
    const { chat } = storeChat((s)=>s)

    if(chat.status < $APP_STATUS['1_ROOM']) return(<App_Status router="CHAT" status={chat.status}/>)
    return(children)
}