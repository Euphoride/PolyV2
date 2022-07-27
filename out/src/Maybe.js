"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compose = exports.bind = exports.pure = void 0;
var CommonTypes_1 = require("../types/CommonTypes");
function pure(a) {
    return a;
}
exports.pure = pure;
var bind = function (a) {
    return function (transform) {
        switch (a) {
            case CommonTypes_1.Nothing:
                return CommonTypes_1.Nothing;
            default:
                return transform(a);
        }
    };
};
exports.bind = bind;
var compose = function (f) {
    return function (g) {
        var h = function (a) {
            return (0, exports.bind)((0, exports.bind)(a)(f))(g);
        };
        return h;
    };
};
exports.compose = compose;
