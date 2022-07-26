"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pipeline = exports.LazyPipeline = void 0;
var Maybe_1 = require("./Maybe");
function LazyPipeline(strictMode) {
    if (strictMode === void 0) { strictMode = true; }
    return LazyPipeline_(function (x) { return x; }, strictMode);
}
exports.LazyPipeline = LazyPipeline;
function LazyPipeline_(startState, strictMode) {
    if (strictMode === void 0) { strictMode = true; }
    var nextComposition = function (pState, nTransform) {
        return (0, Maybe_1.compose)(pState)(nTransform);
    };
    var testPure = function (chain) {
        return function (fn) {
            var pureFn = function (state) {
                if (strictMode) {
                    fn(state);
                }
                return fn(state);
            };
            return chain(pureFn);
        };
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
    var pipe = function (pipeline) {
        return andThen(function (res) {
            var pipelineRes = pipeline.feed(res);
            return pipelineRes;
        });
    };
    var conditionalPipe = function (conditional, pipeT, pipeF) {
        return impureThen(function (res) {
            if (conditional(res)) {
                return pipeT.feed(res);
            }
            else {
                return pipeF.feed(res);
            }
        });
    };
    return {
        andThen: andThen,
        impureThen: impureThen,
        feed: feed,
        pipe: pipe,
        conditionalPipe: conditionalPipe
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
        var pipe = function (pipeline) {
            return andThen(function (res) {
                var pipelineRes = pipeline.feed(res);
                return pipelineRes;
            });
        };
        var releaseState = function () {
            return preState;
        };
        return {
            andThen: andThen,
            impureThen: impureThen,
            releaseState: releaseState,
            pipe: pipe
        };
    };
    return chainball(startState);
}
exports.Pipeline = Pipeline;
