export type EditorType = 'USER'| 'BOARD'| 'COMMENT'| 'MESSENGER';

export type RequestQuery = {
    room?: string;
    menu?: string;
    category?: string;
    page?: string;
    [key: string]: any;
}