import { Binds, FolderStructureItem } from "@/src/lib/types/types";
import { MongoCollection } from "../class/MongoCollection";

export interface UserDb {
	lastUpdate: number;
	email: string;
	createdWith: "Google";
	puuids: string[];
	binds: Binds;
	foldersCreatedIds?: string[];
	mapsCreatedIds?: string[];
	folderStructure?: FolderStructureItem[];
}

const usersCollection = new MongoCollection<UserDb>("coachlolfr", "users");

export default usersCollection;
