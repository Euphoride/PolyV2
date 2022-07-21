import { Maybe, Nothing } from "../types/CommonTypes";
import { StateTransformer } from "../types/PipelineTypes";

export function pure<T>(a: T): Maybe<T> {
    return a;
}

export const bind = <T>(a: Maybe<T>) => <B>(transform: (a: T) => Maybe<B>): Maybe<B> => {
    switch (a) {
        case Nothing:
            return Nothing;
        default:
            return transform(a);
    };
}

export const compose = <A, B>(f: StateTransformer<A, B>) => <C>(g : StateTransformer<B, C>): ((a: A) => Maybe<C>) => {
    const h = (a: A) => {
        return bind(bind(a)(f))(g);
    };

    return h;
};