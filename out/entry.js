"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var overview_1 = require("./schema/overview/overview");
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
    console.log(overview_1.findKV(["Accounts"], KVRoseTree));
    console.log(overview_1.findKV(["Blogs"], KVRoseTree));
    console.log(overview_1.findKV([], KVRoseTree));
    var KVRoseTreeTwo = overview_1.addKV(["Blogs"], "SQL", KVRoseTree);
    console.log(overview_1.findKV(["Blogs"], KVRoseTreeTwo));
    var KVRoseTreeThree = overview_1.addKV(["Blogs", "Bogs", "Logs"], "Mongo", KVRoseTreeTwo);
    console.log(overview_1.findKV(["Blogs", "Bogs", "Logs"], KVRoseTreeThree));
    var KVRoseTreeFour = overview_1.delKV(["Blogs", "Bogs"], KVRoseTreeThree);
    console.log(KVRoseTreeFour);
    console.log(overview_1.findKV(["Blogs", "Bogs"], KVRoseTreeFour));
});
app.listen(3000, function () { return console.log("Currently listening (God willing)!"); });
