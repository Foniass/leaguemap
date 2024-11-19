import db from "../..";
import { FolderDb } from "../collection";

async function getFolderDataByFolderId(folderId: string) {
	const folderData = await db.folders.collection.getItem({ id: folderId });
	if ("error" in folderData) return null;
	return folderData;
}

async function getFolderChildrenByFolderId(folderId: string) {
	const folderData = await db.folders.collection.getItem<{ children: FolderDb["children"] }>(
		{ id: folderId },
		{ projection: { children: 1 } }
	);
	if ("error" in folderData) return null;
	return folderData.children;
}

const getOneActions = {
	fullObj: { folderId: getFolderDataByFolderId },
	children: { folderId: getFolderChildrenByFolderId },
};

export default getOneActions;
