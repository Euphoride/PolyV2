"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CommonTypes_1 = require("../types/CommonTypes");
function Pipeline(startState, strictMode) {
    if (strictMode === void 0) { strictMode = true; }
    // Executor should kinda be like a class written in functional form
    var executor = function (preState) {
        // A monadic bind with a rough signature of "Maybe a -> (a -> Maybe b) -> Maybe b"
        var bind = function (input, transformer) {
            switch (input) {
                case CommonTypes_1.Nothing:
                    return CommonTypes_1.Nothing;
                default:
                    return transformer(input);
            }
            ;
        };
        // If strict mode is on, we should trigger the callback twice to detect potentially unwanted side-effects
        // in the callback function. 
        var purityTest = function (state, callback) {
            if (strictMode)
                bind(state, callback);
        };
        // Should replace the old state inside the pipeline with new state. Probably doesn't have very many 
        // sensible uses but here it is, God willing.
        var newState = function (state, callback) {
            purityTest(state, callback);
            return executor(bind(state, callback));
        };
        // This should be an explict way to add impurities into the pipeline and it should
        // circumvent strict mode's attempt at double execution to try and detect side-effects
        var impureThen = function (callback) {
            return executor(bind(preState, callback));
        };
        // Should be a pure version of .impureThen(). It should try to use
        // the purity test to attempt double executiona nd try to detect side-effects
        var andThen = function (callback) {
            purityTest(preState, callback);
            return impureThen(callback);
        };
        var releaseState = function () {
            return preState;
        };
        return {
            newState: newState,
            andThen: andThen,
            impureThen: impureThen,
            releaseState: releaseState
        };
    };
    return executor(startState);
}
exports.default = Pipeline;
