'use server'
import { cookies } from "next/headers";

export const fetchUser = async () => { // store
    const $COOKIES = await cookies();
    const $TOKEN = $COOKIES.get(process.env.NEXT_PUBLIC_APP_NAME!)?.value;
    try {
        const $FETCH = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API}/app/store`, {
            headers: { Authorization : `Bearer ${$TOKEN}` },
            next: { revalidate: process.env.NODE_ENV === 'production' ? 3600 : 0 },
        });
        const $DATA = await $FETCH.json();
        if(!$FETCH.ok) return { code: 2, msg: '서버가 응답하지 않습니다.', note: `오류(코드): CLIENT_FETCH_USER` }
        return $DATA;
    } catch (err) {
        return { code: 2, msg: '서버가 응답하지 않습니다.', note: `오류(코드): CLIENT_FETCH_USER\n${err}` }
    }
}
export const fetchData = async <T>(method: 'get' | 'post', url: string, data?: T) => {
    const $COOKIES = await cookies();
    const $TOKEN = $COOKIES.get(process.env.NEXT_PUBLIC_APP_NAME!)?.value;
    const $URL = method === 'get' && data ? `${url}?${new URLSearchParams(data).toString()}` : url;
    try {
        const $FETCH = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API}${$URL}`, {
            method: method.toUpperCase(),
            headers: { Authorization : `Bearer ${$TOKEN}` },
            next: { revalidate: process.env.NODE_ENV === 'production' ? 3600 : 0 },
            body: method === 'post' ? JSON.stringify(data) : undefined,
        });
        const $DATA = await $FETCH.json();
        if(process.env.NODE_ENV === 'development') console.log('FETCH SERVER DATA :', $DATA); ///
        if(!$FETCH.ok) return { code: 2, msg: '서버가 응답하지 않습니다.', note: `오류(코드): CLIENT_FETCH_SERVER` }
        return $DATA;
    } catch (err) {
        return { code: 2, msg: '서버가 응답하지 않습니다.', note: `오류(코드): CLIENT_FETCH_SERVER\n${err}` }
    }
}
export const fetchApiData = async <T>(method: 'get' | 'post', url: string, data?: T) => {
    const $URL = method === 'get' && data ? `${url}?${new URLSearchParams(data).toString()}` : url;
    try {
        const $FETCH = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PUBLIC}${$URL}`, {
            method: method.toUpperCase(),
            body: method === 'post' ? JSON.stringify(data) : undefined,
        });
        const $DATA = await $FETCH.json();
        if(process.env.NODE_ENV === 'development') console.log('FETCH SERVER DATA :', $DATA); ///
        if(!$FETCH.ok) return { code: 2, msg: '서버가 응답하지 않습니다.', note: `오류(코드): CLIENT_FETCH_API` }
        return $DATA;
    } catch (err) {
        return { code: 2, msg: '서버가 응답하지 않습니다.', note: `오류(코드): CLIENT_FETCH_API\n${err}` }
    }
}
