import {
    Request
} from 'express';

import { JSONObject, Nothing } from '../types/CommonTypes';

import {
    Cookies,
    HTTPHeaders,
    HTTPMethod,
    InitialRequestNoCookie,
    InitialRequest
} from '../types/InitialRequestTypes';

import Pipeline from './Pipelines';



export default function RoutePipeline(req: Request) {
    const verb = Pipeline(req)
        .andThen<InitialRequestNoCookie>(req => {
            const method = req.method;

            if (!["GET", "POST", "DELETE"].includes(method)) {
                return Nothing;
            }

            return <InitialRequestNoCookie>{
                Verb: method,
                Headers: req.headers,
                Data: req.body,
                Path: req.path
            };
        })
        .releaseState();

    console.log(verb);
}