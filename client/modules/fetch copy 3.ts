import Cookies from "js-cookie";
import { storeApp } from "./zustand"

const createFetch = async <T>(method: 'get' | 'post', url: string, data?: T) => {
    const $URL = method === 'get' && data ? `${url}?${new URLSearchParams(data).toString()}` : url;
    const baseUrl = `${process.env.NEXT_PUBLIC_SERVER_API}${$URL}`;
    const { setLoading, setPopup } = storeApp.getState();
    setLoading(true)
    const $FORM = data instanceof FormData;
    const headers: HeadersInit = { Authorization: `Bearer ${Cookies.get(process.env.NEXT_PUBLIC_APP_NAME!)}`, ...($FORM ? {} : { "Content-Type": "application/json" }) }
    try{
        const $FETCH = await fetch(baseUrl, {
            method: method.toUpperCase(),
            headers,
            credentials: 'include',
            cache: 'no-cache', // 서버 캐시
            // body: method === 'post' ? JSON.stringify(data) : undefined,
            body: $FORM ? data : method === 'post' ? JSON.stringify(data) : undefined,
        })
        const $DATA = await $FETCH.json()
        if(process.env.NODE_ENV === 'development') console.log('FETCH CLIENT DATA :', $DATA); ///
        if(!$FETCH.ok) return setPopup({ code: 9, msg: '서버가 응답하지 않습니다.', note: '오류(코드): FETCH_CLIENT' })
        const { code, msg } = $DATA;
        if(code === 9){
            Cookies.remove(process.env.NEXT_PUBLIC_APP_NAME!)
            setPopup({ code: 9, msg: '로그인이 필요합니다', note: '로그인 시간 만료.' })
        }
        if(msg) setPopup($DATA)
        if(code > 0) return null;
        return $DATA;
    }catch(err){
        setPopup({ code: 9, msg: '서버가 응답하지 않습니다.', note: `오류(코드): FETCH_CLIENT${err}` })
    }finally{
        setLoading(600)
    }
}
export const useFetch = {
    get: <T = unknown>(url: string, data?: T): Promise<T | null> => createFetch('get', url, data),
    post: <T = unknown>(url: string, data?: T): Promise<T | null> => createFetch('post', url, data )
}