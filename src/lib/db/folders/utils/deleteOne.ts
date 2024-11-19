import db from "../..";

async function deleteFolderDataByFolderId(folderId: string) {
	const res = await db.folders.collection.deleteItem({ id: folderId });
	return res.error === undefined ? res.success : null;
}

const deleteOneActions = {
	folderId: deleteFolderDataByFolderId,
};

export default deleteOneActions;
