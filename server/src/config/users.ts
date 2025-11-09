import { pool } from "./mysql";

const $USER_ADMIN = 200, $USER_MANAGER = 100;

export const $USER_STATE = { '0_normal': 0, '1_wait': 1, '7_block': 7, '8_delete': 8, '9_delete_admin': 9, '10_delete_user': 10 };

export const checkAdmin = (level: number): boolean =>{
    if(!level) return false;
    if($USER_ADMIN === level) return true;
    return false;
}
export const checkManager = (level: number): boolean =>{
    if(!level) return false;
    if($USER_MANAGER <= level) return true;
    return false;
}
// 회원 활동 업데이트
export const userUpdate = async (userId: string): Promise<void> =>{
    const $SQL_UPDATE = `UPDATE user SET updated=NOW() WHERE id=?;`;
    await pool($SQL_UPDATE, [userId]);
}