import { Maybe, Nothing } from '../types/CommonTypes';

type PipelineTransformation<PreStateType, PostStateType> = (argument: PreStateType) => Maybe<PostStateType>;

type PipelineStage<PreStateType> = {
    newState: <NewStateType, PostStateType,>(state: Maybe<NewStateType>, callback: PipelineTransformation<NewStateType, PostStateType>) => PipelineStage<PostStateType>,
    andThen:  <PostStateType,>(callback: PipelineTransformation<PreStateType, PostStateType>) => PipelineStage<PostStateType>,
    impureThen: <PostStateType,>(callback: PipelineTransformation<PreStateType, PostStateType>) => PipelineStage<PostStateType>,
    releaseState: () => Maybe<PreStateType>
};


export default function Pipeline<StartType>(startState: StartType, strictMode : boolean = true): PipelineStage<StartType> {

    // Executor should kinda be like a class written in functional form
    const executor = <PreStateType,>(preState: Maybe<PreStateType>) => {
        
        // A monadic bind with a rough signature of "Maybe a -> (a -> Maybe b) -> Maybe b"
        const bind = <InitialStateType, PostStateType,>(input: Maybe<InitialStateType>, transformer: PipelineTransformation<InitialStateType, PostStateType>) => {
            switch (input) {
                case Nothing:
                    return Nothing;
                default:
                    return transformer(input);
            };
        };

        // If strict mode is on, we should trigger the callback twice to detect potentially unwanted side-effects
        // in the callback function. 
        const purityTest = <InitialStateType, PostStateType,>(state: Maybe<InitialStateType>, callback: PipelineTransformation<InitialStateType, PostStateType>) => {
            if (strictMode) bind(state, callback);
        }

        // Should replace the old state inside the pipeline with new state. Probably doesn't have very many 
        // sensible uses but here it is, God willing.
        const newState = <NewStateType, PostStateType,>(state: Maybe<NewStateType>, callback: PipelineTransformation<NewStateType, PostStateType>) => {
            purityTest(state, callback);

            return executor(bind(state, callback));
        };

        // This should be an explict way to add impurities into the pipeline and it should
        // circumvent strict mode's attempt at double execution to try and detect side-effects
        const impureThen = <PostStateType,>(callback: PipelineTransformation<PreStateType, PostStateType>) => {
            return executor(bind(preState, callback));
        }; 
        
        // Should be a pure version of .impureThen(). It should try to use
        // the purity test to attempt double executiona nd try to detect side-effects
        const andThen = <PostStateType,>(callback: PipelineTransformation<PreStateType, PostStateType>) => {
            purityTest(preState, callback);

            return impureThen(callback);
        }; 

        const releaseState = () => {
            return preState;
        }


        return {
            newState, 
            andThen,
            impureThen,
            releaseState
        };
    };

    return executor<StartType>(startState);
}