import { modifyTree, RadixTree } from "../schema/overview/radixtree";
import { AuthObj } from "../types/AuthenticationTypes";
import { Fail, ServiceConfiguration, Successful } from "../types/CommonTypes";
import { UnresolvedProviderGRO } from "../types/RequestTypes";
import { isIncomparable, shouldAssignNewAuth } from "./auth/compare/compare";

export interface Resolver<C> {
	parentResolver?: Resolver<unknown>;
	seed?: unknown;
	children: Resolver<unknown>[];
	access: AuthObj;
}

export abstract class Resolver<C> {
	constructor(parentResolver?: Resolver<unknown>, route?: string, authentication?: AuthObj, seed?: unknown, forceAuth?: boolean) {
		if (!route) {
			const routeKey = route!.split("/");
			
			const manager = new ResolverManager();
			manager.addToInternal(routeKey, this);

			manager.cycleCheck();
		}
		
		parentResolver?.registerChild(this);


		this.parentResolver = parentResolver;
		this.seed = seed;
		this.children = [];

		const defaultAuthObj: AuthObj = {
			"read": "*",
			"write": [],
			"delete": []
		};

		authentication ||= defaultAuthObj;
		const parentAccessObj = this.parentResolver?.getAccessObject() || defaultAuthObj;
		

		if (!shouldAssignNewAuth(authentication, parentAccessObj) && !forceAuth) {
			console.warn(
				"Detected that current authentication parameters are not consistent with parent authentication parameters (the current authentication scope is not enclosed in the parent scope). Defaulting to parent authentication scope. You can force this to not happen by setting forceAuth = true in your superconstructor."
			);
			authentication = parentAccessObj;
		}

		if (isIncomparable(authentication, parentAccessObj) && !forceAuth) {
			console.warn(
				"Deteced that current authentication parameters are not consistent with parent authentication parameters (the current authentication scope contains access rules that not comparible to any rules in the parent). Defaulting to parent authentication scope. You can force this to not happen by setting forceAuth = true in your superconstructor"
			);
			authentication = parentAccessObj;
		}

		this.access = authentication || parentAccessObj;
	}

	abstract resolve(result: unknown): Promise<C & Successful | Fail>;

	async _resolve(): Promise<C & Successful | Fail> {
		const result = await this.parentResolver?._resolve();

		if (!result && !this.seed) {
			throw new Error("Couldn't resolve upper dependency result, resolution failed.");
		}

		if (!result) {
			return this.resolve(this.seed);
		}

		if (result.kind === "Fail") {
			return result;
		}

		const {kind: _, ...rest} = result;
		return this.resolve(rest);
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