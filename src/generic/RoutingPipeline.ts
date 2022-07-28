/* eslint-disable @typescript-eslint/ban-ts-comment */

import { ServerResponse } from "http";
import { MongoClient } from "mongodb";
import { RadixTree, findInTree } from "../../schema/overview/radixtree";

import { Nothing, ServiceConfiguration } from "../../types/CommonTypes";
import { SQLPoolConfiguration } from "../../types/DatabaseTypes";

import {
	GenericRequestOptions,
	HTTPHeaders,
	HTTPMethod,
	LoadedRequest,
	UnresolvedProviderGRO,
} from "../../types/RequestTypes";
import { MongoProviderPipelineResolver, SQLProviderPipelineResolver } from "./DatabasePipelines";

import { LazyPipeline } from "../Pipelines";

export default function RoutePipeline(
	req: GenericRequestOptions,
	response: ServerResponse,
	mongoClient: MongoClient,
	sqlPoolConfiguration: SQLPoolConfiguration,
	tree: RadixTree<string, ServiceConfiguration<unknown>>
) {
	const initialPipe = LazyPipeline<GenericRequestOptions>()
		.conditionalPipe(
			(res) => res.ServiceConfiguration.ServiceProvider === "Mongo",
			MongoProviderPipelineResolver(response, mongoClient),
			SQLProviderPipelineResolver(response, sqlPoolConfiguration)
		);

	initialPipe.feed(req);
}
