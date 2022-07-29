import { AuthToken } from "../types/AuthenticationTypes";
import { Fail, Successful } from "../types/CommonTypes";
import { SQLPoolConfiguration } from "../types/DatabaseTypes";
import { HTTPMethod } from "../types/RequestTypes";
import { Resolver } from "./Resolvers";

export class SessionAuthResolver<T extends AuthToken & SQLPoolConfiguration & {Verb: HTTPMethod}> extends Resolver<T> {
	constructor(parent: Resolver<unknown>) {
		super(parent);
	}

	async resolve(result: T): Promise<T & Successful | Fail> {
		const sqlClient = result.pool.connect();

		const failObj: Fail = <Fail>{
			kind: "Fail",
			statusCode: 403,
			message: "Access Rejected"
		};


		const ret = sqlClient.then(async con => {
			// Todo: Probably via the ResolverManager, I should try to make the AuthTokens table name modifiable
			const r = await con.query("SELECT * FROM AuthTokens NATURAL JOIN Users WHERE token = $1", [result.token]);

			// Maybe use a pipeline for this?
			if (!r.fields.map(i => i.name).includes("type")) {
				throw new Error("SessionAuthResolver couldn't complete authentication checks as the AuthTokens table doesn't seem to have a type field");
			} else if (r.rowCount === 0) {
				return failObj; 
			} else {
				switch(result.Verb) {
				case "GET":
					if (!this.access.read.includes(r.rows[0].type)) {
						return failObj;
					}
					break;
				case "POST":
					if (!this.access.write.includes(r.rows[0].type)) {
						return failObj;
					}
					break;
				case "DELETE":
					if (!this.access.delete.includes(r.rows[0].type)) {
						return failObj;
					}
					break;
				}
				return <T & Successful>{
					kind: "Success",
					...result
				};
			}
		});

		return ret;
	}
}