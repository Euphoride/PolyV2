import { modifyTree, RadixTree } from "../schema/overview/radixtree";
import { ServiceConfiguration } from "../types/CommonTypes";
import { UnresolvedProviderGRO } from "../types/RequestTypes";

export interface Resolver<C> {
	parentResolver?: Resolver<unknown>;
	seed?: unknown;
	children: Resolver<unknown>[];
	access: { [index: string]: string; };
}

export abstract class Resolver<C> {
	constructor(routeKey: string, parentResolver?: Resolver<unknown>, seed?: unknown) {
		const routeKeyArr = routeKey.split("/");
		
		const manager = new ResolverManager();
		manager.addToInternal(routeKeyArr, this);


		parentResolver?.registerChild(this);

		manager.cycleCheck();

		this.parentResolver = parentResolver;
		this.seed = seed;
		this.children = [];

		this.access = this.parentResolver?.getAccessObject() || {
			"read": "*",
			"write": "None",
			"Delete": "None"
		};
	}

	abstract resolve<B>(result: B): C;

	_resolve(): C {
		const result = this.parentResolver?._resolve() || this.seed;

		if (!result) {
			throw new Error("Couldn't resolve upper dependency result, resolution failed.");
		}
		return this.resolve(result);
	}

	getAccessObject() {
		return this.access;
	}

	registerChild(child: Resolver<unknown>) {
		this.children.push(child);
	}
}

export interface ResolverManager {
	rootResolver: Resolver<UnresolvedProviderGRO>;
	internalRadixTree: RadixTree<string, ServiceConfiguration<unknown>>;
}

export class ResolverManager {
	private static _instance: ResolverManager;


	constructor(root?: Resolver<UnresolvedProviderGRO>, internalRadixTree?: RadixTree<string, ServiceConfiguration<unknown>>) {
		if (ResolverManager._instance) {
			return ResolverManager._instance;
		}

		ResolverManager._instance = this;
		this.rootResolver = root!;
		this.internalRadixTree = internalRadixTree!;
	}

	cycleCheck() {
		const visited : Resolver<unknown>[] = [];
		const toVisit : Resolver<unknown>[] = [this.rootResolver];

		while (toVisit.length !== 0) {
			const next = toVisit.shift()!;

			if (visited.includes(next)) throw new Error("Cycle detected. This could cause an infinite loop.");
			
			next?.children.forEach(child => toVisit.push(child));
		}
	}

	addToInternal(routekey: string[], resolver: Resolver<unknown>) {
		this.internalRadixTree = modifyTree(routekey, {
			kind: "Specific",
			Resolver: resolver,
			AccessControl: resolver.getAccessObject()
		}, this.internalRadixTree);
	}
}