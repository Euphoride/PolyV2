import { JSONObject } from "./CommonTypes";

export type Cookies = {
    [index: string]: string
};

export type HTTPHeaders = {
    [index: string] : string
};

export type HTTPMethod = "GET" | "POST" | "DELETE"

export type InitialRequestNoCookie = {
    Verb : HTTPMethod, 
    Headers: HTTPHeaders,
    Path: String,
    Data: JSONObject
};

export type InitialRequest = InitialRequestNoCookie & {
    Cookies: Cookies
};