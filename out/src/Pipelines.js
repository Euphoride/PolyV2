"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pipeline = exports.LazyPipeline = void 0;
var Maybe_1 = require("./Maybe");
function LazyPipeline(strictMode) {
    if (strictMode === void 0) { strictMode = true; }
    return LazyPipeline_(function (x) { return x; });
}
exports.LazyPipeline = LazyPipeline;
function LazyPipeline_(startState, strictMode) {
    if (strictMode === void 0) { strictMode = true; }
    var nextComposition = function (pState, nTransform) {
        return (0, Maybe_1.compose)(pState)(nTransform);
    };
    var testPure = function (chain) {
        var boop = function (pureFn) {
            if (strictMode)
                chain(pureFn);
            return chain(pureFn);
        };
        return boop;
    };
    var impureThen = function (transform) {
        var comp = nextComposition(startState, transform);
        var chain = LazyPipeline_(comp);
        return chain;
    };
    var andThen = testPure(impureThen);
    var feed = function (a) {
        return startState(a);
    };
    return {
        andThen: andThen,
        impureThen: impureThen,
        feed: feed
    };
}
function Pipeline(startState, strictMode) {
    if (strictMode === void 0) { strictMode = true; }
    var chainball = function (preState) {
        var transformState = function (state, transform) {
            return (0, Maybe_1.bind)(state)(transform);
        };
        var nextChain = function (state) {
            return chainball(state);
        };
        var nextStage = function (state, transform) {
            return nextChain(transformState(state, transform));
        };
        var testPure = function (pureFn) {
            return function (transform) {
                if (strictMode)
                    pureFn(transform);
                return pureFn(transform);
            };
        };
        var impureThen = function (transform) {
            return nextStage(preState, transform);
        };
        var andThen = testPure(impureThen);
        var releaseState = function () {
            return preState;
        };
        return {
            andThen: andThen,
            impureThen: impureThen,
            releaseState: releaseState
        };
    };
    return chainball(startState);
}
exports.Pipeline = Pipeline;
