import { createServer, IncomingMessage, ServerResponse } from "http";
import { Pool } from "pg";


import RoutePipeline from "../src/RoutingPipeline";

import { MongoClient, MongoClientOptions, ServerApiVersion } from "mongodb";
import { RoseTree } from "../schema/overview/rosetree";
import { LoadedRequest } from "../types/RequestTypes";
import { connectionConfig, SQLPoolConfiguration } from "../types/DatabaseTypes";
import { ServiceConfiguration } from "../types/CommonTypes";

export function initialisePoly() {
	const KVRoseTree: RoseTree<string, ServiceConfiguration> = {
		kind: "Leaf",
		key: "/",
		value: {
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
		providers: KVRoseTree,
	};
}

export function startPoly(providers: RoseTree<string, ServiceConfiguration>) {
	const MongoURI =
        "mongodb+srv://MongoUser:MongoUserHouseCat@playground.rjsvz.mongodb.net/?retryWrites=true&w=majority";
	const options: MongoClientOptions = { serverApi: ServerApiVersion.v1 };


	const SQLURI = "";

	const handler = (
		req: LoadedRequest,
		res: ServerResponse,
		mongoClient: MongoClient,
		sqlPool: SQLPoolConfiguration
	) => {
		RoutePipeline(req, res, mongoClient, sqlPool, providers);
	};

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

				handler(lreq, res, mongoClient, pool);
			});
		}
	);

	server.listen(3000);
}

function getSQLPool(SQLURI: string, options?: connectionConfig): SQLPoolConfiguration {
	const sqlPool = new Pool(options);
	return {
		pool: sqlPool,
		connectionOptions: options
	};
}

async function getSQLClient(pool: Pool) {
	return await pool.connect();
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
