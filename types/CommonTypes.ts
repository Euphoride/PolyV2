const Nothing = Symbol("Nothing");

type Nothing  = typeof Nothing;
type Maybe<T> = T | Nothing;

const asMaybe = <T,>(item: T): Maybe<T> => item;

export { Maybe, Nothing, asMaybe };