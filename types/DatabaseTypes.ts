import { Pool } from "pg";

export type ConnectionConfig = {
    user: string,
    host: string,
    database: string,
    password: string,
    port: number,
};

export type SQLPoolConfiguration = {
    pool: Pool,
    connectionOptions?: ConnectionConfig; 
};