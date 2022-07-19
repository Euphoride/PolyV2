import express from 'express';
import { modifyTree, deleteInTree, findInTree, RoseTree } from './schema/overview/overview';

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


    console.log(findInTree(["Accounts"], KVRoseTree));
    console.log(findInTree(["Blogs"], KVRoseTree));
    console.log(findInTree([], KVRoseTree));

    const KVRoseTreeTwo = modifyTree(["Blogs"], "SQL", KVRoseTree);
    console.log(findInTree(["Blogs"], KVRoseTreeTwo));

    const KVRoseTreeThree = modifyTree(["Blogs", "Bogs", "Logs"], "Mongo", KVRoseTreeTwo);
    console.log(findInTree(["Blogs", "Bogs", "Logs"], KVRoseTreeThree));


    const KVRoseTreeFour = deleteInTree(["Blogs", "Bogs"], KVRoseTreeThree);
    console.log(KVRoseTreeFour);
    
    console.log(findInTree(["Blogs", "Bogs"], KVRoseTreeFour));
});

app.listen(3000, () => console.log("Currently listening (God willing)!"));