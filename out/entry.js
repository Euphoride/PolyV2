"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var overview_1 = require("./schema/overview/overview");
var Pipelines_1 = __importDefault(require("./src/Pipelines"));
var RoutingPipeline_1 = __importDefault(require("./src/RoutingPipeline"));
var app = express_1.default();
app.use(express_1.default.json());
app.get("/", function (req, res) {
    RoutingPipeline_1.default(req);
    res.send("Hello, world!");
    res.end();
    var KVRoseTree = {
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
    var processedRoseTree = Pipelines_1.default(KVRoseTree)
        .impureThen(function (rt) {
        console.log(overview_1.findInTree(["Accounts"], rt));
        console.log(overview_1.findInTree(["Blogs"], rt));
        console.log(overview_1.findInTree([], rt));
        return rt;
    })
        .andThen(function (rt) {
        return overview_1.modifyTree(["Blogs", "Bogs", "Logs"], "Mongo", overview_1.modifyTree(["Blogs"], "SQL", rt));
    })
        .impureThen(function (rt) {
        console.log(overview_1.findInTree(["Blogs"], rt));
        console.log(overview_1.findInTree(["Blogs", "Bogs", "Logs"], rt));
        return rt;
    })
        .andThen(function (rt) {
        return overview_1.deleteInTree(["Blogs", "Bogs"], rt);
    })
        .impureThen(function (rt) {
        console.log(overview_1.findInTree(["Blogs", "Bogs"], rt));
        return rt;
    })
        .releaseState();
    console.log(processedRoseTree);
});
app.listen(3000, function () { return console.log("Currently listening (God willing)!"); });
