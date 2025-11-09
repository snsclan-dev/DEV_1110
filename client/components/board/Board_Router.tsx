import { BoardParams } from "types";
import { Board_List } from "./Board_List";

export const Board_Router = ({ params }: { params: BoardParams })=>{
    const { router, room, menu, category } = params;
    console.log(params);

    if(router === 'list') return <Board_List params={params}/>
    return(
        <div>
            
        </div>
    )
}