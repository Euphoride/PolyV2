/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { JSONObject } from "../types/CommonTypes";
import { GeneralRequestOptions } from "../types/InitialRequestTypes";

const putResolver = (
	gro: GeneralRequestOptions,
	responseCallback: (data: JSONObject) => void,
	errorCallback: (error: any) => void
) => {
	// @ts-ignore
	gro.TableObject.insertOne(gro.Data, (err: any, result: any) => {
		if (err) {
			errorCallback(err);
			return;
		}
		responseCallback(result);
	});
};
export const fetchResolver = (
	gro: GeneralRequestOptions,
	responseCallback: (data: JSONObject) => void,
	errorCallback: (error: any) => void
) => {
	// @ts-ignore
	gro.TableObject.findOne(gro.Data, (err: any, result: any) => {
		if (err) {
			errorCallback(err);
			return;
		}
		responseCallback(result);
	});
};
export const modifyResolver = (
	gro: GeneralRequestOptions,
	responseCallback: (data: JSONObject) => void,
	errorCallback: (error: any) => void
) => {
	if (!gro.Data.search) {
		return putResolver(gro, responseCallback, errorCallback);
	}

	// @ts-ignore
	gro.TableObject.findOneAndUpdate(
		gro.Data.search,
		{
			$set: gro.Data.set,
		},
		{ returnNewDocument: true },
		(err: any, result: any) => {
			if (err) {
				errorCallback(err);
				return;
			}
			console.log(result);
			responseCallback(result);
		}
	);
};
export const deleteResolver = (
	gro: GeneralRequestOptions,
	responseCallback: (data: JSONObject) => void,
	errorCallback: (error: any) => void
) => {
	// @ts-ignore
	gro.TableObject.findOneAndDelete(gro.Data, (err: any, result: any) => {
		if (err) {
			errorCallback(err);
			return;
		}
		responseCallback(result);
	});
};
