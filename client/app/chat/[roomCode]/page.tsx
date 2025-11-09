import { Chat_Page } from "components/chat";

export default async function Page({ params }: { params: Promise<{ roomCode: string }> }){
    const { roomCode } = await params;
    return(<Chat_Page roomCode={roomCode}/>)
}