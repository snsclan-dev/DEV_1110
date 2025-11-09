import mysql, { PoolConnection, PoolOptions, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CustomError } from 'config';

const { MYSQL_PORT, APP_PASS, APP_NAME } = process.env;

const option: PoolOptions = { 
    host: "localhost", user: "root", port: Number(MYSQL_PORT), password: APP_PASS, database: APP_NAME,
    multipleStatements: true, dateStrings: true, connectionLimit: 30, maxIdle: 10, idleTimeout: 60000, keepAliveInitialDelay: 10000, enableKeepAlive: true // pool
}
const createPool = mysql.createPool(option);
type Params = string | number | boolean | Buffer | Date | null | undefined;
type SQLParams = Params[];
type SQLData = RowDataPacket[] | ResultSetHeader // select: RowDataPacket, ResultSetHeader: insert, update, delete

// export const pool = async <T extends SQLData>(query: string, params: SQLParams, url: string | null = null): Promise<T> => {
export const pool = async <T extends SQLData>(query: string, params: SQLParams = []): Promise<T> => {
    const connection = await createPool.getConnection();
    try {
        const [rows] = await connection.execute<T>(query, params);
        // console.log('pool :', query, params); ///
        return rows;
    } catch (err: unknown) {
        // throw new Error('MYSQL_POOL');
        throw new CustomError('MYSQL_POOL', err);
    } finally {
        if (connection) connection.release();
    }
};
export const pooling = async <T extends SQLData>(connection: PoolConnection, query: string, params: SQLParams = []): Promise<T> =>{
    try {
        const [rows] = await connection.execute<T>(query, params);
        return rows;
    } catch (err: unknown) {
        throw new CustomError('MYSQL_POOLING', err);
        // throw new Error('MYSQL_POOLING');
    }
}
// used: try{ await transaction(async (conn)=>{ pooling(conn, query, params, url)}) }
export const transaction = async <T>(callback: (connection: PoolConnection) => Promise<T>): Promise<void> => {
    const connection = await createPool.getConnection();
    await connection.beginTransaction();
    try {
        await callback(connection);
        await connection.commit();
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};