import {
    Request
} from 'express';
import { MongoClient, WithId } from 'mongodb';
import { RoseTree, findInTree } from '../schema/overview/overview';

import { JSONObject, Nothing } from '../types/CommonTypes';

import {
    Cookies,
    HTTPHeaders,
    HTTPMethod,
    DatabaseTablePair,
    GeneralRequestOptions
} from '../types/InitialRequestTypes';

import { LazyPipeline, Pipeline } from './Pipelines';


const fetchExecutor = (gro: GeneralRequestOptions, responseCallback: (data: JSONObject) => void) => {
    return () => {
        // @ts-ignore
        gro.TableObject.findOne(gro.Data, (result: any) => {
            responseCallback(result);
        });
    }
};

const modifyExecutor = (gro: GeneralRequestOptions, responseCallback: (data: JSONObject) => void) => {
    return async () => {
        // @ts-ignore
        gro.TableObject.findOneAndUpdate(gro.Data, {
            $set: gro.Data,
        }, (result : any) => {
            responseCallback(result);
        });
        
    }
}


export default function RoutePipeline(req: Request, client: MongoClient, tree: RoseTree<String, DatabaseTablePair>, responseCallback: (data: JSONObject) => void) {    
    const PipelineMidStage = LazyPipeline<Request>()
        .andThen(req => {
            const method = req.method;

            if (!["GET", "POST", "DELETE"].includes(method)) {
                return Nothing;
            }

            return {
                Verb: method,
                Headers: req.headers,
                Data: req.body,
                Path: req.path
            };
        })
        .andThen(res => {
            return {...res, Path: res.Path.split("/")}
        })
        .andThen(res => {
            return {...res, DataProvider: findInTree(res.Path, tree)}
        })
        .impureThen(res => {
            const tableObject = client.db(res.DataProvider[0]).collection(res.DataProvider[1]);
            return {...res, TableObject: tableObject};
        });
}