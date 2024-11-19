import db from "../..";

async function deleteMapDataByMapId(mapId: string) {
	const res = await db.maps.collection.deleteItem({ id: mapId });
	return res.error === undefined ? res.success : null;
}

const deleteOneActions = {
	mapId: deleteMapDataByMapId,
};

export default deleteOneActions;
