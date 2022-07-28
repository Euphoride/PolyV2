/* eslint-disable @typescript-eslint/no-explicit-any */

import { GenericServiceConfiguration, ServiceConfiguration } from "./CommonTypes";

export type Cookies = {
    [index: string]: string;
};

export type HTTPHeaders = {
    [index: string]: string;
};

export type HTTPMethod = "GET" | "POST" | "DELETE";

export type UnresolvedProviderGRO = {
    Verb: HTTPMethod;
    Headers: HTTPHeaders;
    Path: string[];
    Data: any;
    ServiceConfiguration: ServiceConfiguration<unknown>;
}; 

export type GenericRequestOptions = {
    Verb: HTTPMethod;
    Headers: HTTPHeaders;
    Path: string[];
    Data: any;
    ServiceConfiguration: GenericServiceConfiguration;
}

export type GeneralRequestOptions = UnresolvedProviderGRO & {
    TableObject: any; // Mongo Collection | SQL table
};

export type GROWithCookies = GeneralRequestOptions & {
    Cookies: Cookies;
};

export type LoadedRequest = { 
	method: string;
	headers: {[index: string]: any};
	body: string;
	path: string;
};
