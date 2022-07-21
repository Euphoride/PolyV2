import { Maybe, Nothing } from '../types/CommonTypes';
import { StateTransformer } from '../types/PipelineTypes';

import { bind, compose } from './Maybe';


type LazyPipelineStage<A, B> = {
    andThen:  <C>(callback: StateTransformer<B, C>) => LazyPipelineStage<A, C>,
    impureThen: <C>(callback: StateTransformer<B, C>) => LazyPipelineStage<A, C>,
    feed: (a: A) => Maybe<B>
};


export function LazyPipeline<A>(strictMode : boolean = true): LazyPipelineStage<A, A> {
    return LazyPipeline_<A, A>(x => x);
}


function LazyPipeline_<A, B>(startState: StateTransformer<A, B>, strictMode : boolean = true): LazyPipelineStage<A, B> {
    const nextComposition = <C>(pState: StateTransformer<A, B>, nTransform: StateTransformer<B, C>) => {
        return compose(pState)(nTransform);
    }

    const testPure = <C>(chain: (transform: StateTransformer<B, C>) => LazyPipelineStage<A, C>) => {
        const boop = (pureFn: StateTransformer<B, C>): LazyPipelineStage<A, C> => {
            if (strictMode) chain(pureFn);

            return chain(pureFn);
        }

        return boop;
    }

    const impureThen = <C>(transform: StateTransformer<B, C>): LazyPipelineStage<A, C> => {
        const comp = nextComposition<C>(startState, transform);
        const chain = LazyPipeline_<A, C>(comp);

        return chain;
    }; 
    
    const andThen = testPure(impureThen);

    const feed = (a: A): Maybe<B> => {
        return startState(a);
    }


    return {
        andThen,
        impureThen,
        feed
    };
}


type PipelineStage<A> = {
    andThen:  <B>(callback: StateTransformer<A, B>) => PipelineStage<B>,
    impureThen: <B>(callback: StateTransformer<A, B>) => PipelineStage<B>,
    releaseState: () => Maybe<A>
};


export function Pipeline<S>(startState: S, strictMode : boolean = true): PipelineStage<S> {

    const chainball = <A,>(preState: Maybe<A>) => {
        const transformState = <I, B>(state: Maybe<I>, transform: StateTransformer<I, B>): Maybe<B> => {
            return bind(state)(transform);
        }

        const nextChain = <B>(state: Maybe<B>): PipelineStage<B> => {
            return chainball(state);
        }

        const nextStage = <I, B>(state: Maybe<I>, transform: StateTransformer<I, B>): PipelineStage<B> => {
            return nextChain(transformState(state, transform));
        }

        const testPure = (pureFn: <B>(transform: StateTransformer<A, B>) => PipelineStage<B>) => {
            return <B>(transform: StateTransformer<A, B>): PipelineStage<B> => {
                if (strictMode) pureFn(transform);

                return pureFn(transform);
            }
        }

        const impureThen = <B>(transform: StateTransformer<A, B>): PipelineStage<B> => {
            return nextStage(preState, transform);
        }; 
        
        const andThen = testPure(impureThen);

        
        const releaseState = () => {
            return preState;
        }


        return {
            andThen,
            impureThen,
            releaseState
        };
    };

    return chainball<S>(startState);
}