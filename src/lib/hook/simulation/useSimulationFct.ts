import { Vector2d } from "konva/lib/types";
import { useCallback } from "react";
import { Camp, Lane, Side } from "../../types/types";
import { getPath, pixelsToTime } from "../../utils";
import { distanceBetweenPoints } from "../../pathfinding";
import { campsRespawnTime, campsSpawnTime, maxDistance } from "../../values/values";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/lib/redux/store";
import {
	pushSimulationChampAction,
	setSimulationChampPosition,
	setSimulationIsRequestingPathAPI,
} from "@/src/lib/redux/mapSlice/simulationSlice";
import useInventoriesActionsFct from "../champ/useInventoriesActionsFct";

const useSimulationFct = () => {
	const dispatch = useDispatch();

	const { getChampMs } = useInventoriesActionsFct();

	const {
		champs: { positions, actions },
		timestampToDisplay,
		campsKilledTimestamps,
		isRequestingPathAPI,
	} = useSelector((state: RootState) => state.Simulation);

	const { champIconSelected, lastClickedButton } = useSelector((state: RootState) => state.Global);

	const isCampReachable = useCallback(
		async (campPos: Vector2d, maxTime: number, wantPath: boolean) => {
			if (champIconSelected === null) return null;
			const champPos = positions[champIconSelected.side][champIconSelected.lane];
			const champMs = getChampMs();
			if (champMs === null) return null;
			if (maxTime === 0) {
				if (!wantPath) return null;
				const pathData = await getPath(champPos, campPos);
				const actionTime = pixelsToTime(pathData.distance, champMs);
				return { ...pathData, actionTime };
			}
			if (!wantPath) {
				if (maxTime > pixelsToTime(maxDistance, champMs)) return null;
				const directDistance = distanceBetweenPoints(champPos, campPos);
				const directTime = pixelsToTime(directDistance, champMs);
				if (directTime >= maxTime) return true;
			}
			const pathData = await getPath(champPos, campPos);
			const actionTime = pixelsToTime(pathData.distance, champMs);
			if (actionTime < maxTime) return null;
			return { ...pathData, actionTime };
		},
		[champIconSelected, getChampMs, positions]
	);

	const whenCampUp = useCallback(
		(camp: Camp, side: Side, forcedJungleTime?: number) => {
			let usableJungleTime: number = timestampToDisplay;
			if (forcedJungleTime !== undefined) usableJungleTime = forcedJungleTime;
			const respawnTime = campsRespawnTime[camp];
			const spawnTime = campsSpawnTime[camp];
			const notAlreadySpawned =
				(camp === "Scuttle" || camp === "Krugs" || camp === "Gromp") && usableJungleTime < spawnTime;
			if (notAlreadySpawned) return spawnTime - usableJungleTime;
			const problematicTimeKilled = campsKilledTimestamps[side][camp].find(
				(timeKilled) => timeKilled <= usableJungleTime && usableJungleTime < timeKilled + respawnTime
			);
			if (!problematicTimeKilled) return 0;
			return problematicTimeKilled + respawnTime - usableJungleTime;
		},
		[campsKilledTimestamps, timestampToDisplay]
	);

	const pathToCamp = useCallback(
		async (type: Camp, pos2: Vector2d, side: Side) => {
			if (isRequestingPathAPI) return;
			if (lastClickedButton !== "cursor/modify") return;
			if (champIconSelected === null) return;
			const spawnIn = whenCampUp(type, side);
			dispatch(setSimulationIsRequestingPathAPI(true));

			if (actions[champIconSelected.side][champIconSelected.lane].length > 0) {
				const fullPathData = await isCampReachable(pos2, spawnIn, true);
				if (fullPathData === true) return dispatch(setSimulationIsRequestingPathAPI(false));
				if (fullPathData === null) return dispatch(setSimulationIsRequestingPathAPI(false));
				const { actionTime, ...pathData } = fullPathData;
				dispatch(
					pushSimulationChampAction({
						side: champIconSelected.side,
						lane: champIconSelected.lane,
						action: {
							travel: pathData,
							mapSide: null,
							type: "Walk",
							itemKey: null,
						},
					})
				);
				dispatch(
					setSimulationChampPosition({
						lane: champIconSelected.lane,
						side: champIconSelected.side,
						position: pathData.end,
					})
				);
			} else {
				if (spawnIn !== 0) return;
				dispatch(
					setSimulationChampPosition({ lane: champIconSelected.lane, side: champIconSelected.side, position: pos2 })
				);
			}

			dispatch(
				pushSimulationChampAction({
					lane: champIconSelected.lane,
					side: champIconSelected.side,
					action: { travel: null, mapSide: side, type, itemKey: null },
				})
			);
			dispatch(setSimulationIsRequestingPathAPI(false));
		},
		[actions, champIconSelected, dispatch, isCampReachable, isRequestingPathAPI, lastClickedButton, whenCampUp]
	);

	const killEnemyChamp = useCallback(async (champKilledSide: Side, champKilledLane: Lane) => {
		// TODO : Process a kill with high precision
	}, []);

	return { whenCampUp, isCampReachable, pathToCamp, killEnemyChamp };
};

export default useSimulationFct;
