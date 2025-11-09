import { ReactNode } from "react";

export type Location = {
    latitude: number;
    longitude: number;
}
export interface User {
    id: string | null;
    name: string | null;
    level: number;
    location: Location | null;
    ip: string | null; // wartermark
    socketId?: string;
    state?: number;
    // auth?: boolean; // 사용자 인증
    // admin?: boolean; // 관리자 인증
    // [key: string]: any;
}
export type Popup = {
    code?: number;
    msg?: ReactNode;
    note?: ReactNode;
    confirm?: ()=> Promise<void> | void; // client
}
export interface CodeData {
    code: number;
    msg?: string;
    note?: string;
    [key: string]: any;
}
export type BoardParams = {
    router: string; room: string; menu: string; category: string; page?: string;
}
export type BoardData = {
    num: number;
    title: string;
    image: string;
    note: string;
    state: number;
    [key: string]: any; ///
}
export type Paging = {
    nowPage: number;
    totalLink: number;
    linkPrev: number;
    linkNext: number;
    linkBlock: number[];
}