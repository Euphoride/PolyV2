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
exports.deleteInTree = exports.modifyTree = exports.findInTree = void 0;
/*
 * Some notes and definitions:
 *
 * A path through a tree should be defined as the concatination of the strings
 * stored as keys of the tree node through some given traversal of the tree.
 *
 * findKV tries to look for the path given by key, or the path that gets closest to it
 * addKV
 *
 * addKV tries to look for the path given by the key, or the path that gets closest,
 * and sets a new value. If we haven't matched the exact key, it should attempt to generate
 * the rest of the path and try to set the values of the nodes to the value given.
 *
 * delKV tries to look for exactly the path given by the key and attempts to remove
 * that child from the children[] array of the parent node.
 *
 */
var findInTree = function (key, overview) {
    if (key.length === 0 || overview.kind == "Leaf") {
        return overview.value;
    }
    var mostSpecificChild = overview.children.find(function (child) { return child.key === key[0]; });
    if (!mostSpecificChild) {
        return overview.value;
    }
    var _ = key[0], newKey = key.slice(1);
    var mostSpecificChildValue = findInTree(newKey, mostSpecificChild);
    return mostSpecificChildValue;
};
exports.findInTree = findInTree;
var modifyTree = function (key, value, overview) {
    if (key.length === 0 && overview.kind === "Leaf") {
        return __assign(__assign({}, overview), { value: value });
    }
    if (overview.kind === "Leaf") {
        var newChild = buildNewChild(key, value);
        return __assign(__assign({}, overview), { kind: "Node", children: [newChild] });
    }
    if (overview.children.every(function (child) { return child.key !== key[0]; })) {
        var newChild = buildNewChild(key, value);
        return __assign(__assign({}, overview), { children: overview.children.concat([newChild]) });
    }
    var _ = key[0], newKey = key.slice(1);
    var newChildren = overview.children.map(function (child) { return (child.key === key[0]) ? modifyTree(newKey, value, child) : child; });
    return __assign(__assign({}, overview), { children: newChildren });
};
exports.modifyTree = modifyTree;
var deleteInTree = function (key, overview) {
    if (overview.kind === "Leaf") {
        return overview;
    }
    var _ = key[0], newKey = key.slice(1);
    var filteredChildren = overview.children.filter(function (child) { return !(key.length === 1 && key[0] === child.key); });
    var newChildren = filteredChildren.map(function (child) { return deleteInTree(newKey, child); });
    if (newChildren.length !== 0) {
        return __assign(__assign({}, overview), { children: newChildren });
    }
    else {
        return {
            kind: "Leaf",
            key: overview.key,
            value: overview.value
        };
    }
};
exports.deleteInTree = deleteInTree;
function buildNewChild(key, value) {
    var templateNewChild = {
        kind: "Leaf",
        key: key[0],
        value: value
    };
    var _ = key[0], newKey = key.slice(1);
    var newChild = modifyTree(newKey, value, templateNewChild);
    return newChild;
}
