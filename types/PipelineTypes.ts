import { Maybe } from "./CommonTypes";

export type StateTransformer<A, B> = (s: A) => Maybe<B>;
