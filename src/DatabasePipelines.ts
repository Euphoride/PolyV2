/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServerResponse } from "http";
import { MongoClient } from "mongodb";
import { Nothing } from "../types/CommonTypes";
import { GeneralRequestOptions, UnresolvedProviderGRO } from "../types/InitialRequestTypes";
import { LazyPipeline } from "./Pipelines";
import { fetchResolver, modifyResolver, deleteResolver } from "./Resolvers";


export function MongoProviderPipelineResolver(response: ServerResponse, client: MongoClient) {
	const resolution = (res: GeneralRequestOptions) => {
		if (["GET", "POST", "DELETE"].includes(res.Verb)) {
			response.writeHead(200, {"content-type": "application/json"});
		}
		switch (res.Verb) {
		case "GET":
			fetchResolver(
				res,
				(result: any) => {
					response.write(JSON.stringify({
						message: "Operation successful",
						result: result,
					}));
					response.end();
				},
				(err: any) => {
					response.write(JSON.stringify({
						message: "Operation failed",
						err: err,
					}));
				}
			);
			break;
		case "POST":
			modifyResolver(
				res,
				(_result: any) => {
					response.write({ message: "Operation successful" });
				},
				(err: any) => {
					response.write({
						message: "Operation failed",
						err: err,
					});
				}
			);
			break;
		case "DELETE":
			deleteResolver(
				res,
				(_result: any) => {
					response.write({ message: "Operation successful" });
				},
				(err: any) => {
					response.write({
						message: "Operation failed",
						err: err,
					});
				}
			);
			break;
		default:
			response.writeHead(400);
			response.write("Bad Request");
			return Nothing;
		}
		return res;
	};
    
    
	return LazyPipeline<UnresolvedProviderGRO>()
		.andThen((res) => {
			const tableObject = client
				.db(res.DataProvider[1])
				.collection(res.DataProvider[2]);
			return { ...res, TableObject: tableObject };
		})
		.impureThen(resolution)
		.andThen((res) => {
			const {TableObject, ...nres } = res;
			return nres;
		});
} 


export const SQLProviderPipeline = LazyPipeline<UnresolvedProviderGRO>().andThen(
	(res) => res
);