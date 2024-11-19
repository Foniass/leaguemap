import db from "../..";

async function getMapDataByMapId(mapId: string) {
	const mapData = await db.maps.collection.getItem({ id: mapId });
	if ("error" in mapData) return null;
	return mapData;
}

const getOneActions = {
	fullObj: { mapId: getMapDataByMapId },
};

export default getOneActions;
