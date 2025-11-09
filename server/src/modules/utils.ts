import { randomBytes, randomUUID } from "crypto";
import dayjs from "dayjs";
import "dayjs/locale/ko";

export const dateFormat = (format = "YYYY-MM-DD HH:mm:ss"): string => {
    return dayjs().format(format);
};
export const randomString = (length: number): string => {
    const bytes = randomBytes(Math.ceil((length * 3) / 4)); // 길이 맞춤
    return bytes.toString('base64url').substring(0, length); // 길이 맞추기
};
