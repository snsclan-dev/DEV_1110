import 'express';
import { User, SocketUser, CodeData } from "./app";

declare module 'express' {
    interface Request {
        user?: User;
        input?: Partial<CodeData>;
    }
}
declare module "socket.io" {
    interface Socket {
        user?: SocketUser;
    }
}