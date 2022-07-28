import { Resolver } from "../src/Resolvers";

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
    AccessControl: {
        [index: string]: string;
    };
};

export type SpecificServiceConfiguration<T> = {
    kind: "Specific";
    AccessControl: {
        [index: string]: string;
    };
    Resolver: Resolver<T>;
};

export type ServiceConfiguration<T> =
    | GenericServiceConfiguration
    | SpecificServiceConfiguration<T>;
