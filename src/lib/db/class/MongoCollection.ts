import { Collection, Document, Filter, FindOptions, MatchKeysAndValues, WithId } from "mongodb";
import { MongoConnection } from "./MongoConnection";
import dayjs from "dayjs";
import { DeepPartial } from "@/src/lib/types/types";

export interface DocumentWithTimestamp extends Document {
	lastUpdate: number;
}

export class MongoCollection<T extends DocumentWithTimestamp> {
	public _collection!: Collection<T>;

	constructor(private dbName: string, private collectionName: string) {
		this.init();
	}

	public async init() {
		if (!this._collection) this._collection = await this.initCollection(this.dbName, this.collectionName);
	}

	private async initCollection(dbName: string, collectionName: string): Promise<Collection<T>> {
		if (this._collection) return this._collection;
		try {
			const client = await MongoConnection.getInstance();
			return client.db(dbName).collection(collectionName);
		} catch (err) {
			throw new Error("Failed to retrieve collection from database");
		}
	}

	async pushElementInField<U>(filter: Filter<T>, fieldName: string, newElement: U): Promise<true | { error: string }> {
		try {
			await this.init();
			// We're going to build our update operation object. This helps TypeScript understand the shape of the object.
			const updateOperation: Partial<T> & { $push?: Partial<T>; $set?: Partial<T> } = {};

			// We're dynamically creating the $push operation. We're explicitly telling TypeScript that the type of newElement is any.
			updateOperation.$push = { [fieldName]: newElement } as Partial<T>;

			// We're setting the lastUpdate field. The shape matches the Partial<T> type.
			updateOperation.$set = { lastUpdate: dayjs().unix() } as Partial<T>;

			// Now TypeScript knows the shape of updateOperation, and it should match Partial<T>.
			await this._collection.updateOne(filter, updateOperation);

			return true;
		} catch (err) {
			return { error: "Failed to save in DB" };
		}
	}

	async pullElementFromField<U>(
		filter: Filter<T>,
		fieldName: string,
		elementToRemoveFilter: U
	): Promise<true | { error: string }> {
		try {
			await this.init();
			// We're going to build our update operation object. This helps TypeScript understand the shape of the object.
			const updateOperation: Partial<T> & { $pull?: Partial<T>; $set?: Partial<T> } = {};

			// We're dynamically creating the $pull operation.
			updateOperation.$pull = { [fieldName]: elementToRemoveFilter } as Partial<T>;

			// We're setting the lastUpdate field. The shape matches the Partial<T> type.
			updateOperation.$set = { lastUpdate: dayjs().unix() } as Partial<T>;

			// Now TypeScript knows the shape of updateOperation, and it should match Partial<T>.
			await this._collection.updateOne(filter, updateOperation);

			return true;
		} catch (err) {
			return { error: "Failed to update in DB" };
		}
	}

	async saveItemField<U>(filter: Filter<T>, fieldName: string, newElement: U): Promise<true | { error: string }> {
		try {
			await this.init();
			const updateResult = await this._collection.updateOne(filter, {
				$set: { [fieldName]: newElement, lastUpdate: dayjs().unix() } as Partial<T>,
			});
			if (updateResult.matchedCount === 0) return { error: "No document found to be updated" };
			return true;
		} catch (err) {
			return { error: "Failed to save in DB" };
		}
	}

	async saveItem(filter: Filter<T>, newItem: MatchKeysAndValues<T>): Promise<true | { error: string }> {
		try {
			await this.init();
			await this._collection.updateOne(
				filter,
				{ $set: { ...(newItem as Partial<T>), lastUpdate: dayjs().unix() } },
				{ upsert: true }
			);
			return true;
		} catch (err) {
			return { error: "Failed to save in DB" };
		}
	}

	async isItem(filter: Filter<T>): Promise<boolean> {
		try {
			await this.init();
			const res = await this._collection.findOne(filter, { projection: { _id: 1 } }); // We only need _id for existence check
			return res !== null; // converts the result into a boolean
		} catch (err) {
			return false; // handle the error by returning false
		}
	}

	async getItem<P extends DeepPartial<T> = T>(
		filter: Filter<T>,
		options?: FindOptions<T extends P ? P : T>
	): Promise<P | { error: string }> {
		try {
			await this.init();
			const res = (await this._collection.findOne(filter, options)) as P | null;
			if (res === null) return { error: "document not found" };
			return res;
		} catch (err) {
			return { error: "Failed to fetch document" };
		}
	}

	async getItems<P extends DeepPartial<T> = T>(
		filter: Filter<T>,
		options?: FindOptions<T extends P ? P : T>
	): Promise<WithId<P>[] | { error: string }> {
		try {
			await this.init();
			// Cast to `unknown` first, then to `WithId<P>[]` to satisfy TypeScript's type checker
			const res = (await this._collection.find(filter, options).toArray()) as unknown as WithId<P>[];
			if (res.length === 0) return { error: "documents not found" };
			return res;
		} catch (err) {
			return { error: "Failed to fetch documents" };
		}
	}

	async deleteItem(filter: Filter<T>): Promise<{ success: boolean; error?: string }> {
		try {
			await this.init();
			const result = await this._collection.deleteOne(filter);
			if (result.deletedCount > 0) {
				return { success: true };
			}
			return { success: false, error: "No documents found to delete" };
		} catch (err) {
			return { success: false, error: "Failed to delete document" };
		}
	}

	async deleteItems(filter: Filter<T>): Promise<{ success: boolean; error?: string }> {
		try {
			await this.init();
			const result = await this._collection.deleteMany(filter);
			if (result.deletedCount > 0) {
				return { success: true };
			}
			return { success: false, error: "No documents found to delete" };
		} catch (err) {
			return { success: false, error: "Failed to delete document" };
		}
	}
}
