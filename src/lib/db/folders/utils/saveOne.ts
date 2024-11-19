import db from "../..";
import { FolderDb } from "../collection";

async function saveFolderDataByFolderId(folderData: FolderDb) {
	const res = await db.folders.collection.saveItem({ id: folderData.id }, folderData);
	return res === true;
}

const saveOneActions = {
	fullObj: { folderId: saveFolderDataByFolderId },
};

export default saveOneActions;
