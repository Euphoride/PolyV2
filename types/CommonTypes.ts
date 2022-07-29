import { Resolver } from "../src/Resolvers";
import { AuthObj } from "./AuthenticationTypes";

const Nothing = Symbol("Nothing");

type Nothing = typeof Nothing;
type Maybe<T> = T | Nothing;

type JSONObject =
    | string
    | number
    | boolean
    | { [x: string]: JSONObject }
    | JSONObject[];

export { Maybe, Nothing, JSONObject };

export type GenericServiceConfiguration = {
    kind: "Generic";
    Database?: string;
    Table: string;
    ServiceProvider: string;
    AccessControl: AuthObj;
};

export type SpecificServiceConfiguration<T> = {
    kind: "Specific";
    AccessControl: AuthObj;
    Resolver: Resolver<T>;
};

export type ServiceConfiguration<T> =
    | GenericServiceConfiguration
    | SpecificServiceConfiguration<T>;


export type Fail = {
    kind: "Fail",
    statusCode: number,
    message: string
};

export type Successful = {
    kind: "Success"
};