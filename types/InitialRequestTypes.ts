import { Collection } from "mongodb";
import { JSONObject } from "./CommonTypes";

export type Cookies = {
    [index: string]: string
};

export type HTTPHeaders = {
    [index: string] : string
};

export type HTTPMethod = "GET" | "POST" | "DELETE";

export type DatabaseTablePair = [string, string];


export type GeneralRequestOptions = {
    Verb : HTTPMethod, 
    Headers: HTTPHeaders,
    Path: string,
    Data: JSONObject,
    DataProvider: DatabaseTablePair,
    TableObject: Collection<Document>   // Mongo Collection | SQL table
};

export type GROWithCookies = GeneralRequestOptions & {
    Cookies: Cookies
};
