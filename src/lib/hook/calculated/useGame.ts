import {
	setGameChampsGolds,
	setGameChampsInventoriesActions,
	setGameRespawnsTimes,
	setGameTurretsAlive,
} from "@/src/lib/redux/mapSlice/gameSlice";
import { RootState } from "@/src/lib/redux/store";
import { InventoryAction } from "@/src/lib/types/redux";
import { lanes, sides } from "@/src/lib/types/types";
import { csByTime, deathsDataToRespawnsTimes, initTeamData, turretsEventsToTurretsAlive } from "@/src/lib/utils";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGame = () => {
	const dispatch = useDispatch();

	const mapTab = useSelector((state: RootState) => state.Global.mapTab);

	const {
		champs: { kills, assists, lasthit, deathsData, inventoriesActions },
		timestampToDisplay,
		turretsEvents,
	} = useSelector((state: RootState) => state.Game);

	const itemsData = useSelector((state: RootState) => state.riot.itemsData);

	// Golds
	useEffect(() => {
		if (mapTab !== "Game") return;
		let newChampsGolds = initTeamData(0);
		let newInventoriesActions = initTeamData<InventoryAction[]>([]);
		let inventoryActionsChanged = false;
		sides.forEach((side) => {
			lanes.forEach((lane) => {
				newChampsGolds[side][lane] += kills[side][lane] * 300;
				newChampsGolds[side][lane] += assists[side][lane] * 150;
				newChampsGolds[side][lane] += csByTime(timestampToDisplay, lasthit[side][lane]).gold;
				// Handle Items
				inventoriesActions[side][lane].forEach(({ action, itemKey }) => {
					if (action === "Buy") newChampsGolds[side][lane] -= itemsData?.[itemKey]?.gold.total ?? 0;
					else newChampsGolds[side][lane] += itemsData?.[itemKey]?.gold.total ?? 0;
				});
				if (newChampsGolds[side][lane] < 0) {
					newInventoriesActions[side][lane] = [];
					inventoryActionsChanged = true;
				}
			});
		});

		dispatch(setGameChampsGolds(newChampsGolds));
		if (inventoryActionsChanged) dispatch(setGameChampsInventoriesActions(newInventoriesActions));
	}, [assists, dispatch, inventoriesActions, itemsData, kills, lasthit, mapTab, timestampToDisplay]);

	// RespawnsTimes
	useEffect(() => {
		if (mapTab !== "Game") return;
		dispatch(setGameRespawnsTimes(deathsDataToRespawnsTimes(deathsData, timestampToDisplay)));
	}, [deathsData, dispatch, mapTab, timestampToDisplay]);

	// TurretsAlive
	useEffect(() => {
		if (mapTab !== "Game") return;
		dispatch(setGameTurretsAlive(turretsEventsToTurretsAlive(turretsEvents, timestampToDisplay)));
	}, [dispatch, mapTab, timestampToDisplay, turretsEvents]);
};

export default useGame;
