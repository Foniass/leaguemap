import { useCallback } from "react";
import { getChampItemsMsFct, getChampMsFct } from "../../utils";
import useTab from "../useTab";
import { Lane, Side } from "@/src/lib/types/types";
import { useSelector } from "react-redux";
import { RootState } from "@/src/lib/redux/store";

const useInventoriesActionsFct = () => {
	const {
		champs: { inventoriesActions, movementSpeeds },
		timestampToDisplay,
	} = useTab();

	const champIconSelected = useSelector((state: RootState) => state.Global.champIconSelected);

	const itemsData = useSelector((state: RootState) => state.riot.itemsData);

	const getChampItemsMs = useCallback(
		(side?: Side, lane?: Lane) => {
			const champSide = side ?? champIconSelected?.side;
			const champLane = lane ?? champIconSelected?.lane;
			if (!champSide || !champLane) return null;
			return getChampItemsMsFct(itemsData, inventoriesActions[champSide][champLane], timestampToDisplay);
		},
		[champIconSelected?.lane, champIconSelected?.side, inventoriesActions, itemsData, timestampToDisplay]
	);

	const getChampMs = useCallback(
		(side?: Side, lane?: Lane) => {
			const champSide = side ?? champIconSelected?.side;
			const champLane = lane ?? champIconSelected?.lane;
			if (!champSide || !champLane) return null;
			return getChampMsFct(
				itemsData,
				inventoriesActions[champSide][champLane],
				timestampToDisplay,
				movementSpeeds[champSide][champLane]
			);
		},
		[
			champIconSelected?.lane,
			champIconSelected?.side,
			inventoriesActions,
			itemsData,
			movementSpeeds,
			timestampToDisplay,
		]
	);

	return { getChampItemsMs, getChampMs };
};

export default useInventoriesActionsFct;
