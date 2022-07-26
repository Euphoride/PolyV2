import { Maybe, Nothing } from "../types/CommonTypes";
import { StateTransformer } from "../types/PipelineTypes";

import { bind, compose } from "./Maybe";

type LazyPipelineStage<A, B> = {
	andThen: <C>(callback: StateTransformer<B, C>) => LazyPipelineStage<A, C>;
	impureThen: <C>(
		callback: StateTransformer<B, C>
	) => LazyPipelineStage<A, C>;
	feed: (a: A) => Maybe<B>;
	pipe: <C>(pipeline: LazyPipelineStage<B, C>) => LazyPipelineStage<A, C>;
	conditionalPipe: <C, D>(
		conditional: (state: B) => boolean,
		pipeT: LazyPipelineStage<B, C>,
		pipeF: LazyPipelineStage<B, D>
	) => LazyPipelineStage<A, C | D>;
};

export function LazyPipeline<A>(
	strictMode = true
): LazyPipelineStage<A, A> {
	return LazyPipeline_<A, A>((x) => x, strictMode);
}

function LazyPipeline_<A, B>(
	startState: StateTransformer<A, B>,
	strictMode = true
): LazyPipelineStage<A, B> {
	const nextComposition = <C>(
		pState: StateTransformer<A, B>,
		nTransform: StateTransformer<B, C>
	) => {
		return compose(pState)(nTransform);
	};

	const testPure = <C>(
		chain: (transform: StateTransformer<B, C>) => LazyPipelineStage<A, C>
	) => {
		return (fn: StateTransformer<B, C>): LazyPipelineStage<A, C> => {
			const pureFn = (state: B): Maybe<C> => {
				if (strictMode) {
					fn(state);
				}

				return fn(state);
			};

			return chain(pureFn);
		};
	};

	const impureThen = <C>(
		transform: StateTransformer<B, C>
	): LazyPipelineStage<A, C> => {
		const comp = nextComposition<C>(startState, transform);
		const chain = LazyPipeline_<A, C>(comp);

		return chain;
	};

	const andThen = testPure(impureThen);

	const feed = (a: A): Maybe<B> => {
		return startState(a);
	};

	const pipe = <C>(
		pipeline: LazyPipelineStage<B, C>
	): LazyPipelineStage<A, C> => {
		return andThen((res) => {
			const pipelineRes = pipeline.feed(res);

			return pipelineRes;
		});
	};

	const conditionalPipe = <C, D>(
		conditional: (state: B) => boolean,
		pipeT: LazyPipelineStage<B, C>,
		pipeF: LazyPipelineStage<B, D>
	): LazyPipelineStage<A, C | D> => {
		return impureThen((res) => {
			if (conditional(res)) {
				return pipeT.feed(res);
			} else {
				return pipeF.feed(res);
			}
		});
	};

	return {
		andThen,
		impureThen,
		feed,
		pipe,
		conditionalPipe,
	};
}

type PipelineStage<A> = {
	andThen: <B>(callback: StateTransformer<A, B>) => PipelineStage<B>;
	impureThen: <B>(callback: StateTransformer<A, B>) => PipelineStage<B>;
	releaseState: () => Maybe<A>;
	pipe: <B>(pipeline: LazyPipelineStage<A, B>) => PipelineStage<B>;
};

export function Pipeline<S>(
	startState: S,
	strictMode = true
): PipelineStage<S> {
	const chainball = <A>(preState: Maybe<A>) => {
		const transformState = <I, B>(
			state: Maybe<I>,
			transform: StateTransformer<I, B>
		): Maybe<B> => {
			return bind(state)(transform);
		};

		const nextChain = <B>(state: Maybe<B>): PipelineStage<B> => {
			return chainball(state);
		};

		const nextStage = <I, B>(
			state: Maybe<I>,
			transform: StateTransformer<I, B>
		): PipelineStage<B> => {
			return nextChain(transformState(state, transform));
		};

		const testPure = (
			pureFn: <B>(transform: StateTransformer<A, B>) => PipelineStage<B>
		) => {
			return <B>(transform: StateTransformer<A, B>): PipelineStage<B> => {
				if (strictMode) pureFn(transform);

				return pureFn(transform);
			};
		};

		const impureThen = <B>(
			transform: StateTransformer<A, B>
		): PipelineStage<B> => {
			return nextStage(preState, transform);
		};

		const andThen = testPure(impureThen);

		const pipe = <B>(
			pipeline: LazyPipelineStage<A, B>
		): PipelineStage<B> => {
			return andThen((res) => {
				const pipelineRes = pipeline.feed(res);

				return pipelineRes;
			});
		};

		const releaseState = () => {
			return preState;
		};

		return {
			andThen,
			impureThen,
			releaseState,
			pipe,
		};
	};

	return chainball<S>(startState);
}
