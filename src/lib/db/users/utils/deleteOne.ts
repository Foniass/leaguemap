import db from "../..";

async function deleteMapIdByEmail(email: string, mapId: string) {
	const res = await db.users.collection.pullElementFromField({ email, mapsCreatedIds: mapId }, "mapsCreatedIds", mapId);
	return res === true;
}

async function deleteFolderIdByEmail(email: string, folderId: string) {
	const res = await db.users.collection.pullElementFromField({ email }, "foldersCreatedIds", folderId);
	return res === true;
}

const deleteOneActions = {
	mapId: { email: deleteMapIdByEmail },
	folderId: { email: deleteFolderIdByEmail },
};

export default deleteOneActions;
