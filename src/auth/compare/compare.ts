import { AuthObj, AuthObjAccessors, ComparisonResult } from "../../../types/AuthenticationTypes";


export function shouldAssignNewAuth(obj1: AuthObj, obj2: AuthObj) {
	return (
		compareAuthAccessors(obj1.read, obj2.read) !== "Wider" ||
		compareAuthAccessors(obj1.write, obj2.write) !== "Wider" ||
		compareAuthAccessors(obj1.delete, obj2.delete) !== "Wider"
	);
}

export function isIncomparable(obj1: AuthObj, obj2: AuthObj) {
	
	return (
		compareAuthAccessors(obj1.read, obj2.read) === "Incomparable" ||
		compareAuthAccessors(obj1.write, obj2.write) === "Incomparable" ||
		compareAuthAccessors(obj1.delete, obj2.delete) === "Incomparable"
	);
}

function compareAuthAccessors(obj1: AuthObjAccessors, obj2: AuthObjAccessors): ComparisonResult {
	if (obj1 === "*" && obj2 === "*") {
		return "Equal";
	}

	if (obj1 === "*") {
		return "Wider";
	}

	if (obj2 === "*") {
		return "Narrower";
	}

	const subsetOne = isSubsetOf(obj1, obj2);
	const subsetTwo = isSubsetOf(obj2, obj1);
	
	if (!subsetOne && !subsetTwo) {
		return "Incomparable";
	}

	if (subsetOne) {
		return "Narrower";
	} else {
		return "Wider";
	}
}

function isSubsetOf(subset: string[], set: string[]): boolean {
	return subset.every(item => set.includes(item));
}