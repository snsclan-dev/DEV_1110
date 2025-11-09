export const $FILE_UPLOAD = { fileSize: 10 * 1024 * 1024, maxSize: 10, chat: 3 } // chat은 유동적으로 처리하자

export const $USER_ADMIN = 200, $USER_MANAGER = 100

export const checkAdmin = (level: number): boolean =>{
    if(!level) return false
    if($USER_ADMIN === level) return true
    return false
}
export const checkManager = (level: number): boolean =>{
    if(!level) return false
    if($USER_MANAGER <= level) return true
    return false
}