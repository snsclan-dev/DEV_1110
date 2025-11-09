export type Location = {
    latitude: number;
    longitude: number;
}
export interface User {
    id: string | null;
    name: string | null;
    level: number;
    ip: string | null;
    location?: Location | null;
    // [key: string]: string | number | boolean | Location | null | undefined;
}
export type Popup = {
    code?: number;
    msg?: string;
    note?: string;
}
export interface CodeData {
    code: number;
    msg?: string;
    note?: string;
    [key: string]: unknown; // list, paging, read 등 유동적인 키
}
// export interface CodeData<T extends Record<string, unknown> = Record<string, unknown>> {
//     code: number;
//     msg?: string;
//     note?: string;
// } & T;

// export type CodeData<T extends Record<string, unknown> = {}> = Popup & T; 
// 타입스크립트에서 {} 는 “빈 객체 리터럴”이 아니라 모든 non-nullish 값(숫자, 문자열까지 포함) 이 허용됨 → 헷갈릴 수 있어서 lint가 경고
// 즉, {} 은 사실상 “제한이 없는 모든 값”이라 타입 의미가 모호해져요.

// export type CodeData<T extends Record<string, unknown> = object> = Popup & T; // 진짜 "빈 객체" 기본값 원하면 object

// export type CodeData<T extends Record<string, unknown> = Record<string, never>> = Popup & T; 
// 이러면 기본은 Popup 만 남고, 필요하면 CodeData<{ user: User }> 이런 식으로 확장 가능해집니다. (보통 이걸 가장 많이 씁니다)

// export type CodeData<T = unknown> = Popup & T; 
// 정말 아무거나 받게 하고 싶다면 unknown 타입 안정성은 가장 약해져요.

export type Paging = {
    nowPage: number;
    totalLink: number;
    linkPrev: number;
    linkNext: number;
    linkBlock: number[];
}