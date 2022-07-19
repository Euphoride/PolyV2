import express from 'express';
import { modifyTree, deleteInTree, findInTree, RoseTree } from './schema/overview/overview';
import Pipeline from './src/Pipelines';

import RoutePipeline from './src/RoutingPipeline';

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    RoutePipeline(req);

    res.send("Hello, world!");
    res.end();

    const KVRoseTree: RoseTree<String, String> = {
        kind: "Node",
        key: "/",
        value: "Mongo",
        children: [
            {
                kind: "Leaf",
                key: "Accounts",
                value: "SQL"
            }
        ]
    };

    const processedRoseTree = Pipeline(KVRoseTree)
        .impureThen(rt => {
            console.log(findInTree(["Accounts"], rt));
            console.log(findInTree(["Blogs"], rt));
            console.log(findInTree([], rt));
            return rt;
        })
        .andThen(rt => {
            return modifyTree(["Blogs", "Bogs", "Logs"], "Mongo", 
                modifyTree(["Blogs"], "SQL", rt)
            );
        })
        .impureThen(rt => {
            console.log(findInTree(["Blogs"], rt));
            console.log(findInTree(["Blogs", "Bogs", "Logs"], rt));
            return rt;
        })
        .andThen(rt => {
            return deleteInTree(["Blogs", "Bogs"], rt);
        })
        .impureThen(rt => {
            console.log(findInTree(["Blogs", "Bogs"], rt));
            return rt;
        })
        .releaseState();


    console.log(processedRoseTree);
    
});

app.listen(3000, () => console.log("Currently listening (God willing)!"));