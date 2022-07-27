"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var rosetree_1 = require("../schema/overview/rosetree");
var CommonTypes_1 = require("../types/CommonTypes");
var DatabasePipelines_1 = require("./DatabasePipelines");
var Pipelines_1 = require("./Pipelines");
function RoutePipeline(req, response, client, tree) {
    var initialPipe = (0, Pipelines_1.LazyPipeline)()
        .andThen(function (req) {
        var method = req.method;
        if (!["GET", "POST", "DELETE"].includes(method)) {
            return CommonTypes_1.Nothing;
        }
        return {
            Verb: method,
            Headers: req.headers,
            Data: req.body,
            Path: req.path,
        };
    })
        .andThen(function (res) {
        return __assign(__assign({}, res), { Path: res.Path.split("/") });
    })
        .andThen(function (res) {
        return __assign(__assign({}, res), { DataProvider: (0, rosetree_1.findInTree)(res.Path, tree) });
    })
        .conditionalPipe(function (res) { return res.DataProvider[0] === "Mongo"; }, (0, DatabasePipelines_1.MongoProviderPipelineResolver)(response, client), DatabasePipelines_1.SQLProviderPipeline);
    initialPipe.feed(req);
}
exports.default = RoutePipeline;
