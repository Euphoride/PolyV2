/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";
import { MongoClient } from "mongodb";
import { Nothing } from "../types/CommonTypes";
import { GeneralRequestOptions, UnresolvedProviderGRO } from "../types/InitialRequestTypes";
import { LazyPipeline } from "./Pipelines";
import { fetchResolver, modifyResolver, deleteResolver } from "./Resolvers";


export function MongoProviderPipelineResolver(response: Response, client: MongoClient) {
	const resolution = (res: GeneralRequestOptions) => {
		switch (res.Verb) {
		case "GET":
			fetchResolver(
				res,
				(result: any) => {
					response.send({
						message: "Operation successful",
						result: result,
					});
				},
				(err: any) => {
					response.send({
						message: "Operation failed",
						err: err,
					});
				}
			);
			break;
		case "POST":
			modifyResolver(
				res,
				(_result: any) => {
					response.send({ message: "Operation successful" });
				},
				(err: any) => {
					response.send({
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
					response.send({ message: "Operation successful" });
				},
				(err: any) => {
					response.send({
						message: "Operation failed",
						err: err,
					});
				}
			);
			break;
		default:
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