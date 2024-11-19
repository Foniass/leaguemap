import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { CampLvl, Lane, Side, camps, lanes, sides } from "../../types/types";
import { campsRespawnTime, campsSpawnTime, campsXpGoldFromLvl, firstCampBonusXp } from "../../values/values";
import {
	calcRespawnTime,
	deathsDataToRespawnsTimes,
	findHighestNumberInferiorTo,
	findNextChampActionToParse,
	getChampMsFct,
	getFinalTimestampFromChampActionsToDisplay,
	getLastChampPos,
	getRandomIntBetween,
	getWaveNbFromTime,
	initCampsData,
	initTeamData,
	pixelsToTime,
	turretsEventsToTurretsAlive,
	xpToLevel,
	xpWinsToTotalXpAtTimestamp,
} from "../../utils";
import {
	ChampAction,
	ChampActionToDisplay,
	ChampActionWaveType,
	isChampActionCamp,
	isChampActionFight,
	isChampActionShop,
	isChampActionTravel,
	isChampActionWave,
	isChampActionWaveType,
} from "@/src/lib/types/actions";
import {
	resetSimulation,
	setSimulationCampsKilledTimestamps,
	setSimulationChampsActions,
	setSimulationChampsActionsToDisplay,
	setSimulationChampsGolds,
	setSimulationChampsInventoriesActions,
	setSimulationChampsLvls,
	setSimulationChampsPositions,
	setSimulationRespawnsTimes,
	setSimulationTimestampToDisplay,
	setSimulationTurretsAlive,
} from "@/src/lib/redux/mapSlice/simulationSlice";
import { InventoryAction } from "@/src/lib/types/redux";
import { v4 } from "uuid";

const useSimulation = () => {
	const dispatch = useDispatch();

	const { mapTab, champIconSelected } = useSelector((state: RootState) => state.Global);
	const {
		champs: { actions, movementSpeeds, positions, deathsData },
		forcedModifs,
		timestampToDisplay,
		turretsEvents,
		champThatCanDoActions,
	} = useSelector((state: RootState) => state.Simulation);

	const itemsData = useSelector((state: RootState) => state.riot.itemsData);

	// Golds & Lvls & Positions & TimestampToDisplay & CampsKilledTimestamps & ChampsInventoriesActions & ChampsActionsToDisplay
	useEffect(() => {
		if (mapTab !== "Simulation" || champIconSelected === null) return;
		const processStartTime = performance.now();

		let champsActionsTest = JSON.parse(JSON.stringify(actions)) as typeof actions;
		sides.forEach((side) => {
			lanes.forEach((lane) => {
				if (lane === "jungle") return;
				// TODO : Improve detection of actions deleted
				if (champsActionsTest[side][lane].length >= 60) return;
				const actionsNeeded = 60 - champsActionsTest[side][lane].length;
				for (let i = 0; i < actionsNeeded; i++) {
					// TODO : Improve actions generated
					champsActionsTest[side][lane].push({
						id: v4(),
						type: getRandomIntBetween(1, 2) === 1 ? "Push" : "Freeze",
						travel: null,
						mapSide: null,
						itemKey: null,
					});
				}
			});
		});
		if (JSON.stringify(champsActionsTest) !== JSON.stringify(actions)) {
			dispatch(setSimulationChampsActions(champsActionsTest));
			return;
		}

		let campsKilledTimestamps = initCampsData<number[]>([]);
		let champsTimestamps = initTeamData(90);
		let champsXps = initTeamData<{ timestamp: number; xpWin: number }[]>([]);
		let champsGolds = initTeamData(0);
		let champsInventoriesActions = initTeamData<InventoryAction[]>([]);
		let champsActionsToDisplay = initTeamData<ChampActionToDisplay[]>([]);

		let nextActionToParseSideLane = findNextChampActionToParse(champsTimestamps, actions, champsActionsToDisplay);
		while (nextActionToParseSideLane !== null) {
			const { side: champSideInput, lane: champLaneInput } = nextActionToParseSideLane;
			let champSide: Side = champSideInput;
			let champLane: Lane = champLaneInput;

			// Find index of the action to parse
			let actionIndex = champsActionsToDisplay[champSide][champLane].length;
			let champAction: ChampAction = actions[champSide][champLane][actionIndex] as ChampAction;
			if (champAction === undefined) throw new Error("ChampAction is undefined");

			// If champAction is Wave find the Wave action of the opponent on the same lane
			if (isChampActionWave(champAction)) {
				const opponentChampSide = champSide === "blue" ? "red" : "blue";
				const opponentChampLane = champLane;
				const waveNb = getWaveNbFromTime(champsTimestamps[opponentChampSide][opponentChampLane]);
				let opponentWaveAction: ChampActionWaveType | undefined = champsActionsToDisplay[opponentChampSide][
					opponentChampLane
				].find(
					({ type, startTimestamp }) => isChampActionWaveType(type) && waveNb === getWaveNbFromTime(startTimestamp)
				)?.type as ChampActionWaveType | undefined;
				if (opponentWaveAction === undefined) {
					const opponentNextActionStartTimestamp = champsTimestamps[opponentChampSide][opponentChampLane];
					const waveNbOpponentNextAction = getWaveNbFromTime(opponentNextActionStartTimestamp);
					const opponentNextActionType =
						actions[opponentChampSide][opponentChampLane][
							champsActionsToDisplay[opponentChampSide][opponentChampLane].length
						]?.type;
					if (opponentNextActionType !== undefined && waveNb >= waveNbOpponentNextAction) {
						if (isChampActionWaveType(opponentNextActionType) && waveNb === waveNbOpponentNextAction)
							opponentWaveAction = opponentNextActionType;
						if (
							(isChampActionWaveType(opponentNextActionType) && waveNb > waveNbOpponentNextAction) ||
							!isChampActionWaveType(opponentNextActionType)
						) {
							if (
								actions[opponentChampSide][opponentChampLane][
									champsActionsToDisplay[opponentChampSide][opponentChampLane].length
								]
							) {
								champSide = opponentChampSide;
								champLane = opponentChampLane;
								actionIndex = champsActionsToDisplay[champSide][champLane].length;
								champAction = actions[champSide][champLane][actionIndex] as ChampAction;
							}
						}
					}
				}
			}

			// Process ChampMs (including boots)
			const champMs = getChampMsFct(
				itemsData,
				champsInventoriesActions[champSide][champLane],
				champsTimestamps[champSide][champLane],
				movementSpeeds[champSide][champLane]
			);

			// Process Time
			let actionTime = 0;
			if (isChampActionTravel(champAction)) actionTime = pixelsToTime(champAction.travel.distance, champMs);
			if (isChampActionFight(champAction)) actionTime = 5;
			if (isChampActionCamp(champAction)) actionTime = 15;
			if (isChampActionShop(champAction)) actionTime = 0;
			if (champAction.type === "Recall") actionTime = 8;
			if (champAction.type === "Respawn")
				actionTime = calcRespawnTime(
					champsTimestamps[champSide][champLane],
					xpToLevel(xpWinsToTotalXpAtTimestamp(champsXps[champSide][champLane]))
				);

			// Handle forcedModifs
			const forcedModif = forcedModifs.find(({ id }) => id === champAction.id);
			if (forcedModif !== undefined) actionTime = forcedModif.time;

			// Passiv gold income
			const currentTimestamp = champsTimestamps[champSide][champLane];
			champsGolds[champSide][champLane] +=
				currentTimestamp < 110 ? Math.max(currentTimestamp + actionTime - 110, 0) * 2.04 : actionTime * 2.04;

			// Handle Shop Actions
			if (isChampActionShop(champAction)) {
				const { itemKey, type } = champAction;
				if (type === "Buy") {
					champsGolds[champSide][champLane] -= itemsData?.[itemKey]?.gold.total ?? 0;
					champsInventoriesActions[champSide][champLane].push({
						timestamp: champsTimestamps[champSide][champLane],
						action: "Buy",
						itemKey: itemKey,
					});
				} else if (type === "Sell") {
					champsGolds[champSide][champLane] += itemsData?.[itemKey]?.gold.sell ?? 0;
					champsInventoriesActions[champSide][champLane].push({
						timestamp: champsTimestamps[champSide][champLane],
						action: "Sell",
						itemKey: itemKey,
					});
				} else if (type === "Destroy" || type === "Undo") {
					champsGolds[champSide][champLane] += itemsData?.[itemKey]?.gold.total ?? 0;
					champsInventoriesActions[champSide][champLane].push({
						timestamp: champsTimestamps[champSide][champLane],
						action: type,
						itemKey: itemKey,
					});
				}
			}

			// Handle Camp Actions
			if (isChampActionCamp(champAction)) {
				campsKilledTimestamps[champAction.mapSide][champAction.type].push(
					champsTimestamps[champSide][champLane] + actionTime
				);

				// First camp bonus
				const firstCampChampActionIndex = actions[champSide][champLane].findIndex((action) =>
					isChampActionCamp(action)
				);
				if (firstCampChampActionIndex === actionIndex)
					champsXps[champSide][champLane].push({
						timestamp: champsTimestamps[champSide][champLane] + actionTime,
						xpWin: firstCampBonusXp,
					});

				// Find campLastSpawnTime, use campsDown
				let campLastRespawnTimestamp = campsSpawnTime[champAction.type];
				const campRespawnTime = campsRespawnTime[champAction.type];
				const campRespawnsTimestamp = campsKilledTimestamps[champAction.mapSide][champAction.type].map(
					(x) => x + campRespawnTime
				);
				if (campRespawnsTimestamp.length > 0) {
					const campLastRespawnTimestampInArr = findHighestNumberInferiorTo(
						campRespawnsTimestamp,
						champsTimestamps[champSide][champLane]
					);
					if (campLastRespawnTimestampInArr !== null) campLastRespawnTimestamp = campLastRespawnTimestampInArr;
				}

				// At campLastRespawnTimestamp take average team lvl of the side of the camp
				const averageTeamLvl =
					(xpToLevel(xpWinsToTotalXpAtTimestamp(champsXps[champSide].top, campLastRespawnTimestamp)) +
						xpToLevel(xpWinsToTotalXpAtTimestamp(champsXps[champSide].jungle, campLastRespawnTimestamp)) +
						xpToLevel(xpWinsToTotalXpAtTimestamp(champsXps[champSide].mid, campLastRespawnTimestamp)) +
						xpToLevel(xpWinsToTotalXpAtTimestamp(champsXps[champSide].bot, campLastRespawnTimestamp)) +
						xpToLevel(xpWinsToTotalXpAtTimestamp(champsXps[champSide].sup, campLastRespawnTimestamp))) /
					5;
				const campLvl = Math.max(Math.min(Math.ceil(averageTeamLvl), 18), 1) as CampLvl;

				// Add camp xp/gold to jungler
				const campClearedData =
					champAction.type === "Blue" || champAction.type === "Red"
						? campsXpGoldFromLvl[champAction.type][1]
						: campsXpGoldFromLvl[champAction.type][campLvl];
				champsGolds[champSide][champLane] += campClearedData.gold;
				champsXps[champSide][champLane].push({
					timestamp: champsTimestamps[champSide][champLane] + actionTime,
					xpWin: campClearedData.xp,
				});
			}

			champsTimestamps[champSide][champLane] += actionTime;

			champsActionsToDisplay[champSide][champLane].push({
				...champAction,
				startTimestamp: champsTimestamps[champSide][champLane] - actionTime,
				time: actionTime,
				goldPostAction: champsGolds[champSide][champLane],
				xpPostAction: xpWinsToTotalXpAtTimestamp(champsXps[champSide][champLane]),
				ms: champMs,
				started: false,
				ended: false,
			});
			nextActionToParseSideLane = findNextChampActionToParse(champsTimestamps, actions, champsActionsToDisplay);
		}

		// Check if the camps clears are possible
		sides.forEach((campSide) => {
			camps.forEach((camp) => {
				const killedTimes = campsKilledTimestamps[campSide][camp].sort();
				if (killedTimes[0] !== undefined && killedTimes[0] < campsSpawnTime[camp]) {
					dispatch(resetSimulation());
					return;
				}
				for (let i = 1; i < killedTimes.length; i++) {
					const beforeTime = killedTimes[i - 1];
					const actualTime = killedTimes[i];
					if (beforeTime === undefined || actualTime === undefined) continue;
					if (actualTime - beforeTime < campsRespawnTime[camp]) {
						// Prendre l'action du actualTime et remove toutes celles après en plus d'elle
						let corruptFound = false;
						const fixedActions = JSON.parse(JSON.stringify(actions)) as typeof actions;
						sides.forEach((champSide) => {
							lanes.forEach((champLane) => {
								const actionCorrupt = champsActionsToDisplay[champSide][champLane].find(
									({ startTimestamp, time, type, mapSide }) =>
										type === camp && mapSide === campSide && startTimestamp + time === actualTime
								);
								if (actionCorrupt === undefined) return;
								corruptFound = true;
								const { startTimestamp, time, id: problematicActionId } = actionCorrupt;

								const idsToDelete: string[] = [
									...champsActionsToDisplay[champSide][champLane]
										.filter((champAction) => champAction.startTimestamp >= startTimestamp + time)
										.map(({ id }) => id),
									problematicActionId,
								];
								fixedActions[champSide][champLane] = [...fixedActions[champSide][champLane]].filter(
									({ id }) => !idsToDelete.includes(id)
								);
							});
						});
						if (corruptFound) {
							dispatch(setSimulationChampsActions(fixedActions));
							return;
						} else {
							dispatch(resetSimulation());
							return;
						}
					}
				}
			});
		});

		const newTimestampToDisplay = getFinalTimestampFromChampActionsToDisplay(
			champsActionsToDisplay[champThatCanDoActions?.side ?? champIconSelected.side][
				champThatCanDoActions?.lane ?? champIconSelected.lane
			]
		);

		sides.forEach((side) => {
			lanes.forEach((lane) => {
				champsActionsToDisplay[side][lane] = champsActionsToDisplay[side][lane].map((champAction) => {
					return {
						...champAction,
						started: champAction.startTimestamp <= newTimestampToDisplay,
						ended: champAction.time + champAction.startTimestamp <= newTimestampToDisplay,
					};
				});
			});
		});

		let newChampsPositions = JSON.parse(JSON.stringify(positions)) as typeof positions;
		sides.forEach((side) => {
			lanes.forEach((lane) => {
				const pos = getLastChampPos(champsActionsToDisplay[side][lane], newTimestampToDisplay, side);
				if (pos !== undefined) newChampsPositions[side][lane] = pos;
			});
		});

		let newChampsGolds = initTeamData(0);
		let newChampsLvls = initTeamData(1);
		sides.forEach((side) =>
			lanes.forEach((lane) => {
				const endedActions = champsActionsToDisplay[side][lane].filter(({ ended }) => ended);
				newChampsGolds[side][lane] = endedActions[endedActions.length - 1]?.goldPostAction ?? 0;
				newChampsLvls[side][lane] = xpToLevel(endedActions[endedActions.length - 1]?.xpPostAction ?? 0);
			})
		);
		const processEndTime = performance.now();
		console.log(`Simulation process time : ${(processEndTime - processStartTime).toFixed(2)}ms`);

		dispatch(setSimulationChampsGolds(newChampsGolds));
		dispatch(setSimulationChampsLvls(newChampsLvls));
		dispatch(setSimulationChampsPositions(newChampsPositions));
		dispatch(setSimulationTimestampToDisplay(newTimestampToDisplay));
		dispatch(setSimulationCampsKilledTimestamps(campsKilledTimestamps));
		dispatch(setSimulationChampsInventoriesActions(champsInventoriesActions));
		dispatch(setSimulationChampsActionsToDisplay(champsActionsToDisplay));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [actions, champIconSelected, dispatch, forcedModifs, mapTab, movementSpeeds]);

	// RespawnsTimes
	useEffect(() => {
		if (mapTab !== "Simulation") return;
		dispatch(setSimulationRespawnsTimes(deathsDataToRespawnsTimes(deathsData, timestampToDisplay)));
	}, [deathsData, dispatch, mapTab, timestampToDisplay]);

	// TurretsAlive
	useEffect(() => {
		if (mapTab !== "Game") return;
		dispatch(setSimulationTurretsAlive(turretsEventsToTurretsAlive(turretsEvents, timestampToDisplay)));
	}, [dispatch, mapTab, timestampToDisplay, turretsEvents]);
};

export default useSimulation;
