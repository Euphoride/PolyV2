/* eslint-disable @typescript-eslint/ban-ts-comment */

import { ServerResponse } from "http";
import { MongoClient } from "mongodb";
import { RoseTree, findInTree } from "../schema/overview/rosetree";

import { Nothing } from "../types/CommonTypes";

import {
	HTTPHeaders,
	HTTPMethod,
	LoadedRequest,
	ServiceConfiguration
} from "../types/RequestTypes";
import { MongoProviderPipelineResolver, SQLProviderPipeline } from "./DatabasePipelines";

import { LazyPipeline } from "./Pipelines";

export default function RoutePipeline(
	req: LoadedRequest,
	response: ServerResponse,
	client: MongoClient,
	tree: RoseTree<string, ServiceConfiguration>
) {
	const initialPipe = LazyPipeline<LoadedRequest>()
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
			return { ...res, ServiceConfiguration: findInTree(res.Path, tree) };
		})
		.conditionalPipe(
			(res) => res.ServiceConfiguration.ServiceProvider === "Mongo",
			MongoProviderPipelineResolver(response, client),
			SQLProviderPipeline
		);

	initialPipe.feed(req);
}
