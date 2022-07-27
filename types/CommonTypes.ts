const Nothing = Symbol("Nothing");

type Nothing  = typeof Nothing;
type Maybe<T> = T | Nothing;

type JSONObject =
    | string
    | number
    | boolean
    | { [x: string]: JSONObject }
    | JSONObject[] ;
    
    
export { Maybe, Nothing, JSONObject };

export type ServiceConfiguration = {
    Database?: string;
    Table: string;
    ServiceProvider: string;
    AccessControl: { [index: string]: string; };
};

