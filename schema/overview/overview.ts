import { Maybe, Nothing } from "../../types/CommonTypes";
import { HTTPMethod } from "../../types/InitialRequestTypes";

type RoseTree<A, B> =
    | { kind: "Leaf", key: A, value: B}
    | { kind: "Node", key: A, value: B, children: RoseTree<A, B>[]};


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

const findInTree = (key: String[], overview: RoseTree<String, String>): Maybe<String> => {
    if (key.length === 0 || overview.kind == "Leaf") {
        return overview.value;
    }

    const mostSpecificChild = overview.children.find(child => child.key === key[0]);

    if (!mostSpecificChild) {
        return overview.value;
    }

    const [_, ...newKey] = key;

    const mostSpecificChildValue = findInTree(newKey, mostSpecificChild);

    return mostSpecificChildValue;
};

const modifyTree = (key: String[], value: String, overview: RoseTree<String, String>): RoseTree<String, String> => {
    if (key.length === 0 && overview.kind === "Leaf") {
        return {...overview, value: value};
    }

    if (overview.kind === "Leaf") {
        const newChild = buildNewChild(key, value);

        return {...overview, kind: "Node", children: [newChild]};
    }

    if (overview.children.every(child => child.key !== key[0])) {
        const newChild = buildNewChild(key, value);

        return {...overview, children: overview.children.concat([newChild])};
    }

    const [_, ...newKey] = key;

    const newChildren = overview.children.map(child => (child.key === key[0]) ? modifyTree(newKey, value, child) : child);


    return {...overview, children: newChildren};
};

const deleteInTree = (key: String[], overview: RoseTree<String, String>): RoseTree<String, String> => {
    if (overview.kind === "Leaf") {
        return overview;
    }

    const [_, ...newKey] = key;

    const filteredChildren = overview.children.filter(child => !(key.length === 1 && key[0] === child.key));
    const newChildren      = filteredChildren.map(child => deleteInTree(newKey, child));

    if (newChildren.length !== 0) {
        return {...overview, children: newChildren};
    } else {
        return {
            kind: "Leaf",
            key: overview.key,
            value: overview.value
        };
    }
}


function buildNewChild(key: String[], value: String) {
        const templateNewChild: RoseTree<String, String> = {
            kind: "Leaf",
            key: key[0],
            value: value
        };

        const [_, ...newKey] = key;

        const newChild = modifyTree(newKey, value, templateNewChild);
        return newChild;
    }

export {
    findInTree,
    modifyTree,
    deleteInTree,
    RoseTree
};
    