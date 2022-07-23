import express from 'express';
import { modifyTree, deleteInTree, findInTree, RoseTree } from './schema/overview/overview';
import {Pipeline} from './src/Pipelines';

import RoutePipeline from './src/RoutingPipeline';

import { MongoClient, MongoClientOptions, ServerApiVersion  } from 'mongodb';
import { DatabaseTablePair } from './types/InitialRequestTypes';

const app = express();

app.use(express.json());

const KVRoseTree: RoseTree<String, DatabaseTablePair> = {
    kind: "Node",
    key: "/",
    value: ["Mongo", "Base"],
    children: [
        {
            kind: "Leaf",
            key: "Accounts",
            value: ["SQL", "TableX"]
        }
    ]
};

/*
console.log(KVRoseTree)

    const processedRoseTree = Pipeline(KVRoseTree)
        .impureThen(rt => {
            console.log(findInTree(["Accounts"], rt));
            console.log(findInTree([], rt));
            return rt;
        })
        .andThen(rt => {
            return modifyTree(["Accounts", "Blogs"], "BlogProvider", rt)
        })
        .impureThen(rt => {
            console.log(findInTree(["Accounts", "Blogs"], rt));
            return rt;
        })
        .andThen(rt => {
            // return deleteInTree(["Account", "Blogs"], rt);
            return rt
        })
        .impureThen(rt => {
            console.log(findInTree(["Blogs", "Bogs"], rt));
            return rt;
        })
        .releaseState();


    console.log(processedRoseTree);
*/

const uri = "";
const options: MongoClientOptions = { serverApi: ServerApiVersion.v1 };



app.get("/", async (req, res) => {
    
    const client = new MongoClient(uri, options);
    // await client.connect();

    RoutePipeline(req, client, KVRoseTree, (data) => {
        res.header("Content-Type", "application/json");
        res.send(data);
        res.end();
    });
});

app.listen(3000, () => console.log("Currently listening (God willing)!"));