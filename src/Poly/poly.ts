import { createServer, IncomingMessage, ServerResponse } from "http";
import { Pool } from "pg";


import RoutePipeline from "../generic/RoutingPipeline";

import { MongoClient, MongoClientOptions, ServerApiVersion } from "mongodb";
import { findInTree, RadixTree } from "../../schema/overview/radixtree";
import { GenericRequestOptions, HTTPHeaders, HTTPMethod, LoadedRequest } from "../../types/RequestTypes";
import { ConnectionConfig, SQLPoolConfiguration } from "../../types/DatabaseTypes";
import { Nothing, ServiceConfiguration } from "../../types/CommonTypes";
import { LazyPipeline } from "../Pipelines";
import { ResolverManager } from "../Resolvers";

export function initialisePoly() {
	const KVRadixTree: RadixTree<string, ServiceConfiguration<unknown>> = {
		kind: "Leaf",
		key: "/",
		value: {
			kind: "Generic",
			ServiceProvider: "Mongo",
			Database: "PlaygroundTest",
			Table: "TestCollection",
			AccessControl: {
				read: "*",
				write: "*",
				delete: "*",
			},
		},
	};

	return {
		providers: KVRadixTree,
	};
}

function RequestRouter(
	req: LoadedRequest,
	res: ServerResponse,
	mongoClient: MongoClient,
	sqlPool: SQLPoolConfiguration
) {
	const pipe = LazyPipeline<LoadedRequest>()
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
			const reqManager = new ResolverManager();

			const serviceConfig = findInTree(res.Path, reqManager.internalRadixTree);

			return { ...res, ServiceConfiguration: serviceConfig };
		})
		.impureThen((resp) => {	
			const reqManager = new ResolverManager();

			if (resp.ServiceConfiguration.kind === "Generic") {		
				RoutePipeline(<GenericRequestOptions>resp, res, mongoClient, sqlPool, reqManager.internalRadixTree);
			} else {
				resp.ServiceConfiguration.Resolver._resolve();
			}
		});

	pipe.feed(req);
}

export function startPoly(providers: RadixTree<string, ServiceConfiguration<unknown>>) {
	const MongoURI =
        "mongodb+srv://MongoUser:MongoUserHouseCat@playground.rjsvz.mongodb.net/?retryWrites=true&w=majority";
	const options: MongoClientOptions = { serverApi: ServerApiVersion.v1 };


	const SQLURI = "";


	const server = createServer(
		async (req: IncomingMessage, res: ServerResponse) => {
			const buffer: any[] = [];

			const mongoClient = await getMongoClient(MongoURI, options);
			const pool   = getSQLPool(SQLURI);

			req.on("data", (chunk: any) => {
				buffer.push(chunk);
			});

			req.on("end", async () => {
				const incomingBody = JSON.parse(buffer.join(""));

				const lreq = buildLoadedRequest(req, incomingBody);

				RequestRouter(lreq, res, mongoClient, pool);
			});
		}
	);

	server.listen(3000);
}

function getSQLPool(SQLURI: string, options?: ConnectionConfig): SQLPoolConfiguration {
	const sqlPool = new Pool(options);
	return {
		pool: sqlPool,
		connectionOptions: options
	};
}



async function getMongoClient(MongoURI: string, options: MongoClientOptions) {
	const client = new MongoClient(MongoURI, options);
	await client.connect();
	return client;
}

function buildLoadedRequest(
	req: IncomingMessage,
	incomingBody: string
): LoadedRequest {
	return {
		method: req.method || "",
		headers: req.headers,
		body: incomingBody,
		path: req.url || "/",
	};
}
