export type AuthObjAccessors = "*" | string[];
export type AuthObj = {
    read: AuthObjAccessors,
    write: AuthObjAccessors,
    delete: AuthObjAccessors
};

export type ComparisonResult = "Wider" | "Narrower" | "Equal" | "Incomparable";
export type AuthToken = { token: string };
