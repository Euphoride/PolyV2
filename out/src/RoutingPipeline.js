"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var CommonTypes_1 = require("../types/CommonTypes");
var Pipelines_1 = __importDefault(require("./Pipelines"));
function RoutePipeline(req) {
    var PipelineMidStage = Pipelines_1.default(req)
        .andThen(function (req) {
        var method = req.method;
        if (!["GET", "POST", "DELETE"].includes(method)) {
            return CommonTypes_1.Nothing;
        }
        return {
            Verb: method,
            Headers: req.headers,
            Data: req.body,
            Path: req.path
        };
    });
    var verb = PipelineMidStage
        .andThen(function (ir) {
        return ir.Verb;
    })
        .releaseState();
    var headers = PipelineMidStage
        .andThen(function (ir) {
        return ir.Headers;
    })
        .releaseState();
    console.log(verb);
    console.log(headers);
}
exports.default = RoutePipeline;
