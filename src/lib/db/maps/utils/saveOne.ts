import db from "../..";
import { MapDb } from "../collection";

async function saveMapDataByMapId(mapData: MapDb) {
	const res = await db.maps.collection.saveItem({ id: mapData.Global.id }, mapData);
	return res === true;
}

const saveOneActions = {
	fullObj: { mapId: saveMapDataByMapId },
};

export default saveOneActions;
