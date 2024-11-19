import { FolderStructureItem } from "@/src/lib/types/types";
import db from "../..";

async function getUserDataByEmail(email: string) {
	const userData = await db.users.collection.getItem({ email });
	if ("error" in userData) return null;
	return userData;
}

async function getFolderStructureByEmail(email: string) {
	const userData = await db.users.collection.getItem<{ folderStructure?: FolderStructureItem[] }>(
		{ email },
		{ projection: { folderStructure: 1 } }
	);
	if ("error" in userData) return null;
	return userData.folderStructure;
}

async function getUserDataByMapId(mapId: string) {
	const userData = await db.users.collection.getItem({ mapsCreatedIds: mapId });
	if ("error" in userData) return null;
	return userData;
}

async function getUserDataByFolderId(folderId: string) {
	const userData = await db.users.collection.getItem({ foldersCreatedIds: folderId });
	if ("error" in userData) return null;
	return userData;
}

const getOneActions = {
	fullObj: { email: getUserDataByEmail, mapId: getUserDataByMapId, folderId: getUserDataByFolderId },
	folderStructure: { email: getFolderStructureByEmail },
};

export default getOneActions;
