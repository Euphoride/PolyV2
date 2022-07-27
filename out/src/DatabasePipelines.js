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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLProviderPipeline = exports.MongoProviderPipelineResolver = void 0;
var CommonTypes_1 = require("../types/CommonTypes");
var Pipelines_1 = require("./Pipelines");
var Resolvers_1 = require("./Resolvers");
function MongoProviderPipelineResolver(response, client) {
    var resolution = function (res) {
        if (["GET", "POST", "DELETE"].includes(res.Verb)) {
            response.writeHead(200, { "content-type": "application/json" });
        }
        switch (res.Verb) {
            case "GET":
                (0, Resolvers_1.fetchResolver)(res, function (result) {
                    console.log("here!");
                    response.write(JSON.stringify({
                        message: "Operation successful",
                        result: result,
                    }));
                    response.end();
                }, function (err) {
                    response.write(JSON.stringify({
                        message: "Operation failed",
                        err: err,
                    }));
                });
                break;
            case "POST":
                (0, Resolvers_1.modifyResolver)(res, function (_result) {
                    response.write({ message: "Operation successful" });
                }, function (err) {
                    response.write({
                        message: "Operation failed",
                        err: err,
                    });
                });
                break;
            case "DELETE":
                (0, Resolvers_1.deleteResolver)(res, function (_result) {
                    response.write({ message: "Operation successful" });
                }, function (err) {
                    response.write({
                        message: "Operation failed",
                        err: err,
                    });
                });
                break;
            default:
                response.writeHead(400);
                response.write("Bad Request");
                return CommonTypes_1.Nothing;
        }
        return res;
    };
    return (0, Pipelines_1.LazyPipeline)()
        .andThen(function (res) {
        var tableObject = client
            .db(res.DataProvider[1])
            .collection(res.DataProvider[2]);
        return __assign(__assign({}, res), { TableObject: tableObject });
    })
        .impureThen(resolution)
        .andThen(function (res) {
        var TableObject = res.TableObject, nres = __rest(res, ["TableObject"]);
        return nres;
    });
}
exports.MongoProviderPipelineResolver = MongoProviderPipelineResolver;
exports.SQLProviderPipeline = (0, Pipelines_1.LazyPipeline)().andThen(function (res) { return res; });
