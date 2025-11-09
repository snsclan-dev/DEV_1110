import { ReactNode } from "react";
import { Board_Menu } from "components/board";

export default function Layout({ children }: { children: ReactNode }){
    
    return(
        <div>
            <Board_Menu/>
            {children}
        </div>
    )
}