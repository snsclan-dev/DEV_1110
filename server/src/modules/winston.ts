import path from "path";
import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";
import { telegram } from "./telegram";

const { combine, timestamp, printf } = format;

const logFormat = printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}] ${message}\n`;
});
const transport = new transports.DailyRotateFile({
    level: "info",
    filename: "%DATE%_server.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "30d",
    dirname: path.join("/", process.env.FOLDER!, process.env.APP_NAME!, "logs"),
});
const $LOGGER = createLogger({
    format: combine(timestamp({ format: "YY-MM-DD HH:mm:ss" }), logFormat),
    transports: [process.env.NODE_ENV === "production" ? transport : new transports.Console()],
    exceptionHandlers: [transport],
});
export const logger = (message: string) => {
    $LOGGER.error(message);
    if (process.env.NODE_ENV === "production") {
        telegram({ msg: `오류 알림 : ${message}` });
    }
};
