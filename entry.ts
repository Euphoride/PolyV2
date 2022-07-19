import express from 'express';

import RoutePipeline from './src/RoutingPipeline';

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    RoutePipeline(req);

    res.send("Hello, world!");
    res.end();
});

app.listen(3000, () => console.log("Currently listening (God willing)!"));