import dayjs from "dayjs";
import db from "../..";
import { BindKey, Binds, FolderStructureItem } from "@/src/lib/types/types";

async function saveUserDataByEmail(
	email: string,
	binds: Binds,
	puuids: string[],
	folderStructure: FolderStructureItem[],
	mapsCreatedIds: string[]
) {
	const res = await db.users.collection.saveItem(
		{ email },
		{
			lastUpdate: dayjs().unix(),
			createdWith: "Google",
			email,
			binds,
			puuids,
			folderStructure,
			mapsCreatedIds,
		}
	);
	return res === true;
}

async function saveBindByEmail(email: string, bindKey: BindKey, bindValue: string | null): Promise<boolean> {
	const res = await db.users.collection.saveItemField({ email }, `binds.${bindKey}`, bindValue);
	return res === true;
}

async function saveMapIdByEmail(email: string, mapId: string): Promise<boolean> {
	const mapOwner = await db.users.collection.getItem<{ email: string }>(
		{ mapsCreatedIds: mapId },
		{ projection: { email: 1 } }
	);
	if ("email" in mapOwner) return false;
	const res = await db.users.collection.pushElementInField({ email }, "mapsCreatedIds", mapId);
	return res === true;
}

async function saveFolderStructureByEmail(email: string, folderStructure: FolderStructureItem[]): Promise<boolean> {
	const res = await db.users.collection.saveItemField({ email }, "folderStructure", folderStructure);
	return res === true;
}

async function saveFolderIdByEmail(email: string, folderId: string): Promise<boolean> {
	const folderOwner = await db.users.collection.getItem<{ email: string }>(
		{ "folderStructure.folderId": folderId },
		{ projection: { email: 1 } }
	);
	if ("email" in folderOwner) return false;
	const res = await db.users.collection.pushElementInField({ email }, "foldersCreatedIds", folderId);
	return res === true;
}

const saveOneActions = {
	fullObj: { email: saveUserDataByEmail },
	bind: { email: saveBindByEmail },
	mapId: { email: saveMapIdByEmail },
	folderId: { email: saveFolderIdByEmail },
	folderStructure: { email: saveFolderStructureByEmail },
};

export default saveOneActions;
