import { Maybe, Nothing } from "../types/CommonTypes";

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