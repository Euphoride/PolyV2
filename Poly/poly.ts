import express, { Express, Request, Response } from "express";

import RoutePipeline from "../src/RoutingPipeline";

import { MongoClient, MongoClientOptions, ServerApiVersion } from "mongodb";
import { RoseTree } from "../schema/overview/rosetree";


export function initialisePoly() {
	const app = express();

	app.use(express.json());

	const KVRoseTree: RoseTree<string, string[]> = {
		kind: "Leaf",
		key: "/",
		value: ["Mongo", "PlaygroundTest", "TestCollection"],
	};
    
	return {
		app: app,
		providers: KVRoseTree
	};
}

export function startPoly(app: Express, providers: RoseTree<string, string[]>) {
	const MongoURI = "";
	const options: MongoClientOptions = { serverApi: ServerApiVersion.v1 };

	const handler = async (req: Request, res: Response) => {
		const client = new MongoClient(MongoURI, options);
		await client.connect();

		RoutePipeline(req, res, client, providers);
	};

	app.get("/", handler);
	app.post("/", handler);
	app.delete("/", handler);
	app.listen(3000, () => console.log("Currently listening (God willing)!"));
}