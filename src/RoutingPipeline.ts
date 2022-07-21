import {
    Request
} from 'express';
import { MongoClient } from 'mongodb';

import { JSONObject, Nothing } from '../types/CommonTypes';

import {
    Cookies,
    HTTPHeaders,
    HTTPMethod,
    InitialRequestNoCookie,
    InitialRequest
} from '../types/InitialRequestTypes';

import { LazyPipeline, Pipeline } from './Pipelines';



export default function RoutePipeline(req: Request, client: MongoClient) {    
    const PipelineMidStage = LazyPipeline<Request>()
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
        .andThen(irnc => irnc.Verb);

    const lazyVerb = PipelineMidStage.feed(req);

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
        .andThen(irnc => irnc.Verb)
        .releaseState();

    console.log(lazyVerb === verb);
}