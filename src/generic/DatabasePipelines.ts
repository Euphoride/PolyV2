/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServerResponse } from "http";
import { MongoClient } from "mongodb";
import { Pool } from "pg";
import { Nothing } from "../../types/CommonTypes";
import { SQLPoolConfiguration } from "../../types/DatabaseTypes";
import { GeneralRequestOptions, UnresolvedProviderGRO } from "../../types/RequestTypes";
import { LazyPipeline } from "../Pipelines";
import { fetchResolver, modifyResolver, deleteResolver } from "./DataResolvers";


export function MongoProviderPipelineResolver(response: ServerResponse, client: MongoClient) {
	const resolution = (res: GeneralRequestOptions) => {
		if (["GET", "POST", "DELETE"].includes(res.Verb)) {
			response.writeHead(200, {"content-type": "application/json"});
		}

		switch (res.Verb) {
		case "GET":
			fetchResolver(
				res,
				(result: any) => {
					response.write(JSON.stringify({
						message: "Operation successful",
						result: result,
					}));
					response.end();
				},
				(err: any) => {
					response.write(JSON.stringify({
						message: "Operation failed",
						err: err,
					}));
					response.end();
				}
			);
			break;
		case "POST":
			modifyResolver(
				res,
				(_result: any) => {
					response.write(JSON.stringify({ message: "Operation successful" }));
					response.end();
				},
				(err: any) => {
					response.write(JSON.stringify({
						message: "Operation failed",
						err: err,
					}));
					response.end();
				}
			);
			break;
		case "DELETE":
			deleteResolver(
				res,
				(_result: any) => {
					response.write(JSON.stringify({ message: "Operation successful" }));
					response.end();
				},
				(err: any) => {
					response.write(JSON.stringify({
						message: "Operation failed",
						err: err,
					}));
					response.end();
				}
			);
			break;
		default:
			response.writeHead(400);
			response.write("Bad Request");
			return Nothing;
		}
		return res;
	};
    
    
	return LazyPipeline<UnresolvedProviderGRO>()
		.andThen((res) => {
			if (res.ServiceConfiguration.kind !== "Generic") return Nothing;
			const resolvedDatabaseName = res.ServiceConfiguration.Database || "Main";

			const tableObject = client
				.db(resolvedDatabaseName)
				.collection(res.ServiceConfiguration.Table);
			return { ...res, TableObject: tableObject };
		})
		.impureThen(resolution)
		.andThen((res) => {
			const {TableObject, ...nres } = res;
			return nres;
		});
} 


export function SQLProviderPipelineResolver(response: ServerResponse, sqlPoolConfiguration: SQLPoolConfiguration) { 
	return LazyPipeline<UnresolvedProviderGRO>()
		.andThen((res) => {
			// Todo: Get client from SQL Pool, execute SQL resolution method (perhaps borrow the resolution method above)
			// and return UnresolvedProviderGRO as with the above pattern. I also probably want to start moving the architecture
			// into position to treat resolvers as nodes in a DAG and execute the Lazy resolvers to the extent required

			/*
			 * Actually thinking about it now, there could be an interesting system where business logic that relies
			 * on previous pipelines can be represented as such in the DAG. Then requests should be a little bit simpler
			 * given we "component"-ise the backend into composed resolvers (pipeline generators) that can be reused if needed.
			 * 
			 * 
			 * So would we still use a DAG? Probably given they're still attached. Component resolver is developed and 
			 * during the dependency analysis we add it to the DAG God willing. Then what? When some route is hit and it isn't necessarily
			 * a generic API route, we need some way to actually discern this God willing. Secondly, we also need to then find the reference
			 * to the particular resolver for this route and climb up the tree adding nodes to a stack until we reach the top God willing. Then,
			 * we should try to process the stack and execute the resolvers one-by-one, passing one output into the next God willing. Then the final
			 * pipeline should release and we have the resolved data God willing. We then just send it back to the client in JSON record format God willing.
			 * 
			 * Something to think about maybe God willing might be how authentication resolvers play into this, whether they happen to be resolvers at all,
			 * whether they contain logic that perhaps is encapsulated and thus may better act as something else. If they are resolvers truly, which they probably
			 * are God willing, then we also should try to find a good way to a) infuse authentication checks elegantly into the resolver pipeline and b) not redo 
			 * authentication if we've already verified that the current access token gives narrower (i.e stronger) permissions than the ones we're about to check.
			 * 
			 * Some clues maybe God willing:
			 * 	- Permissions should have a total order that is in-built (i.e. P_a > P_b if permission a is stronger than permission b)
			 *  - Thus when resolvers are added to the DAG, they should carry the permission required to have completed this far  
			 *  - DAG execution should elegantly and minimally transfer the end-pipeline state of the parent to the child as needed (probably using FP techniques)
			 *  - Either dependency analysis should check for new cycles or it should be impossible to make them (probably the former)
			 *  - Resolvers should have a small, simple, rapid public facing API and a easy (if not invisible and automatic)
			 */

			// I know it's hard, but try your best to refactor this into a way that reflects the nature of this architecture. You're moving blind
			// here but the above is a sketch of our next couple of steps God willing
			return res;
		});
}