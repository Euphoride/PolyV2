import { createServer, IncomingMessage, ServerResponse } from "http";

import RoutePipeline from "../src/RoutingPipeline";

import { MongoClient, MongoClientOptions, ServerApiVersion } from "mongodb";
import { RoseTree } from "../schema/overview/rosetree";
import { LoadedRequest, ServiceConfiguration } from "../types/RequestTypes";
import { response } from "express";




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
				delete: "*"
			}
		},
	};
    
	return {
		providers: KVRoseTree
	};
}

export function startPoly(providers: RoseTree<string, ServiceConfiguration>) {
	const MongoURI = "mongodb+srv://MongoUser:MongoUserHouseCat@playground.rjsvz.mongodb.net/?retryWrites=true&w=majority";
	const options: MongoClientOptions = { serverApi: ServerApiVersion.v1 };

	const handler = async (req: LoadedRequest, res: ServerResponse) => {
		const client = new MongoClient(MongoURI, options);
		await client.connect();

		RoutePipeline(req, res, client, providers);
	};

	const server = createServer((req: IncomingMessage, res: ServerResponse) => {
		const buffer: any[] = [];
		
		req.on("data", (chunk: any) => {
			buffer.push(chunk);
		});

		req.on("end", async () => {

			const lreq : LoadedRequest = {
				method: req.method || "",
				headers: req.headers,
				body: JSON.parse(buffer.join("")),
				path: req.url || "/"
			};

			await handler(lreq, res);
		});
	});

	server.listen(3000);
}