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
var overview_1 = require("../schema/overview/overview");
var CommonTypes_1 = require("../types/CommonTypes");
var Pipelines_1 = require("./Pipelines");
var putResolver = function (gro, responseCallback, errorCallback) {
    return function () {
        // @ts-ignore
        gro.TableObject.insertOne(gro.Data, function (err, result) {
            if (err) {
                errorCallback(err);
                return;
            }
            responseCallback(result);
        });
    };
};
var fetchResolver = function (gro, responseCallback, errorCallback) {
    return function () {
        // @ts-ignore
        gro.TableObject.findOne(gro.Data, function (err, result) {
            if (err) {
                errorCallback(err);
                return;
            }
            responseCallback(result);
        });
    };
};
var modifyResolver = function (gro, responseCallback, errorCallback) {
    return function () {
        if (!gro.Data.search) {
            return putResolver(gro, responseCallback, errorCallback)();
        }
        // @ts-ignore
        gro.TableObject.findOneAndUpdate(gro.Data.search, {
            $set: gro.Data.set,
        }, { returnNewDocument: true }, function (err, result) {
            if (err) {
                errorCallback(err);
                return;
            }
            console.log(result);
            responseCallback(result);
        });
    };
};
var deleteResolver = function (gro, responseCallback, errorCallback) {
    return function () {
        // @ts-ignore
        gro.TableObject.findOneAndDelete(gro.Data, function (err, result) {
            if (err) {
                errorCallback(err);
                return;
            }
            responseCallback(result);
        });
    };
};
function RoutePipeline(req, response, client, tree) {
    var MongoProviderPipeline = (0, Pipelines_1.LazyPipeline)()
        .andThen(function (res) {
        var tableObject = client
            .db(res.DataProvider[1])
            .collection(res.DataProvider[2]);
        return __assign(__assign({}, res), { TableObject: tableObject });
    })
        .impureThen(function (res) {
        switch (res.Verb) {
            case "GET":
                fetchResolver(res, function (result) {
                    response.send({ message: "Operation successful", result: result });
                }, function (err) {
                    response.send({
                        message: "Operation failed",
                        err: err
                    });
                })();
                break;
            case "POST":
                modifyResolver(res, function (result) {
                    response.send({ message: "Operation successful", result: result });
                }, function (err) {
                    response.send({
                        message: "Operation failed",
                        err: err
                    });
                })();
                break;
            case "DELETE":
                deleteResolver(res, function (result) {
                    response.send({ message: "Operation successful" });
                }, function (err) {
                    response.send({
                        message: "Operation failed",
                        err: err
                    });
                })();
                break;
        }
        return res;
    })
        .andThen(function (res) {
        var TableObject = res.TableObject, nres = __rest(res, ["TableObject"]);
        return nres;
    });
    var SQLProviderPipeline = (0, Pipelines_1.LazyPipeline)()
        .andThen(function (res) { return res; });
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
        return __assign(__assign({}, res), { DataProvider: (0, overview_1.findInTree)(res.Path, tree) });
    })
        .conditionalPipe(function (res) { return res.DataProvider[0] === "Mongo"; }, MongoProviderPipeline, SQLProviderPipeline);
    initialPipe.feed(req);
}
exports.default = RoutePipeline;
