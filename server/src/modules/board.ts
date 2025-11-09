import { ResultSetHeader } from "mysql2";
import { pool } from "config";

const modifyKey: Record<string, string> = { board_title: "title", room_title: "title", editor: "note" };
const boardKeymodify = (input: any): Record<string, any> => { // DB컬럼으로 키 변경 
    const $INPUT: Record<string, any> = {};
    for (const key in input) {
        if (modifyKey[key]) {
            $INPUT[modifyKey[key]] = input[key];
        } else {
            $INPUT[key] = input[key];
        }
    }
    return $INPUT;
};
export const boardInputData = (input: any): Record<string, any> => { // middleware
    let $DATA = boardKeymodify(input);
    const $DELETE = ["refImage", "refEditor", "code"] // 키 삭제
    $DELETE.forEach((key) => delete $DATA[key]);
    return $DATA;
};
export const boardQuery = async ({ type, table, input }: { type: "INSERT" | "UPDATE", table: string, input: any }): Promise<void | number> => {
    const keys = [], values: any[] = [];
    for (const key in input) {
        if (input[key] !== undefined && key !== 'num') {
            keys.push(key);
            values.push(input[key]);
        }
    }
    if (type === "INSERT") {
        const $VALUES = keys.map(()=> '?').join(', ');
        const $QUERY = `INSERT INTO ${table}(${keys.join(', ')}) VALUES(${$VALUES});`;
        const $RESULT = await pool<ResultSetHeader>($QUERY, values)
        return $RESULT.insertId;
    }
    if (type === "UPDATE") {
        // if (!input.num) throw new Error("UPDATE requires 'num' property");
        delete input.user_ip
        const $KEYS = keys.map(key=> `${key}=?`).join(', ');
        const $QUERY = `UPDATE ${table} SET ${$KEYS}, updated=NOW() WHERE num=?;`;
        values.push(input.num)
        await pool($QUERY, values)
        // 변경되지 않으면 affectedRows가 0
    }
};