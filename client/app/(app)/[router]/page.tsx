import { App_Register, App_Update } from "components/app";

export default async function Page({ params }: { params: Promise<{ router: string }> }){
    const { router } = await params;

    // if(router === 'login') return <App_Login/>
    if(router === 'register') return <App_Register/>
    if(router === 'update') return <App_Update/>
    return null
}