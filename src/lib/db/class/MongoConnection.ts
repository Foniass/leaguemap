import { MongoClient, MongoClientOptions } from "mongodb";

const URI = process.env.MONGODB_URI;
const options: MongoClientOptions = {
	maxPoolSize: 10,
	serverSelectionTimeoutMS: 5000,
	socketTimeoutMS: 45000,
	family: 4,
};

if (!URI) throw new Error("Missing env.MONGODB_URI");

export class MongoConnection {
	private static client: MongoClient | null = null;

	private constructor() {}

	public static async getInstance(): Promise<MongoClient> {
		if (!this.client) {
			try {
				this.client = new MongoClient(URI as string, options);
				await this.client.connect();
			} catch (err) {
				throw new Error("Failed to establish connection to database: " + err);
			}
		}
		return this.client;
	}
}
