import express, { Request, Response } from "express";

import RoutePipeline from "./src/RoutingPipeline";

import { MongoClient, MongoClientOptions, ServerApiVersion } from "mongodb";
import { Pipeline } from "./src/Pipelines";
import {
    modifyTree,
    deleteInTree,
    findInTree,
    RoseTree,
} from "./schema/overview/overview";

const app = express();

app.use(express.json());

const KVRoseTree: RoseTree<String, string[]> = {
    kind: "Node",
    key: "/",
    value: ["Mongo", "PlaygroundTest", "TestCollection"],
    children: [
        {
            kind: "Leaf",
            key: "Accounts",
            value: ["SQL", "SQLPlaygroundDB", "PGTable"],
        },
    ],
};

const MongoURI =
    "";
const options: MongoClientOptions = { serverApi: ServerApiVersion.v1 };

const handler = async (req: Request, res: Response) => {
    const client = new MongoClient(MongoURI, options);
    await client.connect();

    RoutePipeline(req, res, client, KVRoseTree);
}

app.get("/", handler);
app.post("/", handler);
app.delete("/", handler);
app.listen(3000, () => console.log("Currently listening (God willing)!"));
