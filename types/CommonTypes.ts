const Nothing = Symbol("Nothing");

type Nothing  = typeof Nothing;
type Maybe<T> = T | Nothing;

type JSONObject =
    | string
    | number
    | boolean
    | { [x: string]: JSONObject }
    | Array<JSONObject>;

export { Maybe, Nothing, JSONObject };