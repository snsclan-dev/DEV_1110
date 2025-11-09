import { Board_Router } from "components/board/Board_Router";
import { Editor_Notice } from "components/editor";

export default async function Page({ params }: { params: Promise<{ router?: string[] }> }){
    const $ROUTER = (await params).router ?? []
    const [router, room, menu, category] = $ROUTER;
    const $PARAMS = { router, room, menu, category }

    

    // if(!$PARAMS.length) return(<Editor_Notice params={$PARAMS}/>)
    // if(!$ROUTER.length) return(<Editor_Notice params={$PARAMS}/>)
    return(
        <div>
            <Board_Router params={$PARAMS} /> 
        </div>
    )
}