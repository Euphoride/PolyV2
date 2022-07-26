/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { RoseTree, findInTree } from "../schema/overview/rosetree";

import { Nothing } from "../types/CommonTypes";

import {
	HTTPHeaders,
	HTTPMethod,
	UnresolvedProviderGRO,
} from "../types/InitialRequestTypes";

import { LazyPipeline } from "./Pipelines";
import { fetchResolver, modifyResolver, deleteResolver } from "./Resolvers";

export default function RoutePipeline(
	req: Request,
	response: Response,
	client: MongoClient,
	tree: RoseTree<string, string[]>
) {
	const MongoProviderPipeline = LazyPipeline<UnresolvedProviderGRO>()
		.andThen((res) => {
			const tableObject = client
				.db(res.DataProvider[1])
				.collection(res.DataProvider[2]);
			return { ...res, TableObject: tableObject };
		})
		.impureThen((res) => {
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
					(result: any) => {
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
					(result: any) => {
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
		})
		.andThen((res) => {
			const { TableObject, ...nres } = res;
			return nres;
		});

	const SQLProviderPipeline = LazyPipeline<UnresolvedProviderGRO>().andThen(
		(res) => res
	);

	const initialPipe = LazyPipeline<Request>()
		.andThen((req) => {
			const method = req.method;

			if (!["GET", "POST", "DELETE"].includes(method)) {
				return Nothing;
			}

			return {
				Verb: <HTTPMethod>method,
				Headers: <HTTPHeaders>req.headers,
				Data: req.body,
				Path: req.path,
			};
		})
		.andThen((res) => {
			return { ...res, Path: res.Path.split("/") };
		})
		.andThen((res) => {
			return { ...res, DataProvider: findInTree(res.Path, tree) };
		})
		.conditionalPipe(
			(res) => res.DataProvider[0] === "Mongo",
			MongoProviderPipeline,
			SQLProviderPipeline
		);

	initialPipe.feed(req);
}
