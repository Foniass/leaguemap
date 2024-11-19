import { FolderStructureItem } from "@/src/lib/types/types";
import { MongoCollection } from "../class/MongoCollection";

export type FolderDb = { lastUpdate: number } & {
	id: string;
	name: string | null;
	children: FolderStructureItem[];
};

const foldersCollection = new MongoCollection<FolderDb>("coachlolfr", "folders");

export default foldersCollection;
