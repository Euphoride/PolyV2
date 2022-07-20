import { Maybe, Nothing } from '../types/CommonTypes';
import { StateTransformer } from '../types/PipelineTypes';

import { bind } from './Maybe';

type PipelineStage<A> = {
    andThen:  <B>(callback: StateTransformer<A, B>) => PipelineStage<B>,
    impureThen: <B>(callback: StateTransformer<A, B>) => PipelineStage<B>,
    releaseState: () => Maybe<A>
};


export default function Pipeline<S>(startState: S, strictMode : boolean = true): PipelineStage<S> {

    // Executor should kinda be like a class written in functional form
    const chainball = <A,>(preState: Maybe<A>) => {
        const transformState = <I, B>(state: Maybe<I>, transform: StateTransformer<I, B>): Maybe<B> => {
            return bind(state)(transform);
        }

        const nextChain = <B>(state: Maybe<B>): PipelineStage<B> => {
            return chainball(state);
        }

        const nextStage = <I, B>(state: Maybe<I>, transform: StateTransformer<I, B>): PipelineStage<B> => {
            return chainball(transformState(state, transform));
        }

        const testPure = (pureFn: <B>(transform: StateTransformer<A, B>) => PipelineStage<B>) => {
            return <B>(transform: StateTransformer<A, B>): PipelineStage<B> => {
                if (strictMode) pureFn(transform);

                return pureFn(transform);
            }
        }

        // This should be an explict way to add impurities into the pipeline and it should
        // circumvent strict mode's attempt at double execution to try and detect side-effects
        const impureThen = <B>(transform: StateTransformer<A, B>): PipelineStage<B> => {
            return nextStage(preState, transform);
        }; 
        
        // Should be a pure version of .impureThen(). It should try to use
        // the purity test to attempt double executiona nd try to detect side-effects
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