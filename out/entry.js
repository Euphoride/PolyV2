"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var RoutingPipeline_1 = __importDefault(require("./src/RoutingPipeline"));
var app = express_1.default();
app.use(express_1.default.json());
app.get("/", function (req, res) {
    RoutingPipeline_1.default(req);
    res.send("Hello, world!");
    res.end();
});
app.listen(3000, function () { return console.log("Currently listening (God willing)!"); });
