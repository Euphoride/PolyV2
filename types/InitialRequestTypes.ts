type Cookies = {
    [index: string]: string
};

type HTTPHeaders = {
    [index: string] : string
};

type InitialRequest = {
    Verb : "GET" | "POST" | "DELETE", 
    Headers: HTTPHeaders,
    Cookies: Cookies,
    Data: any
};