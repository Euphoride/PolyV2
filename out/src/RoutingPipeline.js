"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CommonTypes_1 = require("../types/CommonTypes");
var Pipelines_1 = require("./Pipelines");
function RoutePipeline(req, client) {
    var PipelineMidStage = (0, Pipelines_1.LazyPipeline)()
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
    })
        .andThen(function (irnc) { return irnc.Verb; });
    var lazyVerb = PipelineMidStage.feed(req);
    var verb = (0, Pipelines_1.Pipeline)(req)
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
    })
        .andThen(function (irnc) { return irnc.Verb; })
        .releaseState();
    console.log(lazyVerb === verb);
}
exports.default = RoutePipeline;
