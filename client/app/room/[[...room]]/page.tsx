import { Room_Page } from "components/room";

export default async function Page({ params }: { params: Promise<{ room?: string[] }> }){
    const $ROUTER = (await params).room ?? []
    const [router, room, menu, category] = $ROUTER;

    // if(!$PARAMS.length) return(<Editor_Notice params={$PARAMS}/>)
    // if(!$ROUTER.length) return(<Editor_Notice params={$PARAMS}/>)
    return(<Room_Page/>)
}