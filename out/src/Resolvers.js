"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResolver = exports.modifyResolver = exports.fetchResolver = void 0;
var putResolver = function (gro, responseCallback, errorCallback) {
    // @ts-ignore
    gro.TableObject.insertOne(gro.Data, function (err, result) {
        if (err) {
            errorCallback(err);
            return;
        }
        responseCallback(result);
    });
};
var fetchResolver = function (gro, responseCallback, errorCallback) {
    // @ts-ignore
    gro.TableObject.findOne(gro.Data, function (err, result) {
        if (err) {
            errorCallback(err);
            return;
        }
        responseCallback(result);
    });
};
exports.fetchResolver = fetchResolver;
var modifyResolver = function (gro, responseCallback, errorCallback) {
    if (!gro.Data.search) {
        return putResolver(gro, responseCallback, errorCallback);
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
exports.modifyResolver = modifyResolver;
var deleteResolver = function (gro, responseCallback, errorCallback) {
    // @ts-ignore
    gro.TableObject.findOneAndDelete(gro.Data, function (err, result) {
        if (err) {
            errorCallback(err);
            return;
        }
        responseCallback(result);
    });
};
exports.deleteResolver = deleteResolver;
