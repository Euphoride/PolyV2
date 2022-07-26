import { Collection } from "mongodb";
import { JSONObject } from "./CommonTypes";

export type Cookies = {
    [index: string]: string
};

export type HTTPHeaders = {
    [index: string] : string
};

export type HTTPMethod = "GET" | "POST" | "DELETE";



export type UnresolvedProviderGRO = {
    Verb : HTTPMethod, 
    Headers: HTTPHeaders,
    Path: string[],
    Data: any,
    DataProvider: string[]
};

export type GeneralRequestOptions = UnresolvedProviderGRO & {
    TableObject: any   // Mongo Collection | SQL table
};

export type GROWithCookies = GeneralRequestOptions & {
    Cookies: Cookies
};
