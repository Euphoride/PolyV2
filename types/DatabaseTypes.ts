import { Pool, PoolConfig } from "pg";

export type connectionConfig = {
    user: string,
    host: string,
    database: string,
    password: string,
    port: number,
};

export type SQLPoolConfiguration = {
    pool: Pool,
    connectionOptions?: connectionConfig; 
};