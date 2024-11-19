import dayjs from "dayjs";
import {
	BuildingType,
	CampsData,
	DrawCommandProps,
	FolderStructureItem,
	Lane,
	LaneType,
	PathData,
	Region,
	RiotItemEvent,
	RiotRegion,
	RiotServer,
	Side,
	TeamData,
	TeamId,
	TurretEvent,
	TurretsAlive,
	WardDef,
	WardType,
	WaveRegion,
	camps,
	isCamp,
	isFolderItem,
	isRiotItemEvent,
	lanes,
	lanesType,
	riotServers,
	sides,
	teamsId,
} from "./types/types";
import {
	RiotServerLinkRegion,
	basesPos,
	defaultTurretsAlive,
	jungleCampsData,
	objectivesData,
	proxyPositions,
	riotEventTypeToActionType,
	wavesPos,
} from "./values/values";
import axios from "axios";
import { Vector2d } from "konva/lib/types";
import { Stage } from "konva/lib/Stage";
import { v4 as uuidv4 } from "uuid";
import { distanceBetweenPoints, getPathKey } from "./pathfinding";
import preCalculatedPaths from "@/public/preCalculatedPaths.json";
import Konva from "konva";
import { champsIconsData } from "./mapData";
import { ChampionObj, GlobalTabState, InventoryAction, ItemObj, RiotState } from "./types/redux";
import { ChampAction, ChampActionToDisplay, isChampActionTeleport, isChampActionTravel } from "./types/actions";
import { MatchDto, MatchTimelineDto } from "./riotApi/endpoints/matchv5";
import { SummonerDTO } from "./riotApi/endpoints/summonerv4";

export function getChampionDataById(championsData: RiotState["championsData"], championId: string) {
	return Object.values(championsData ?? {}).find((champion) => champion.key === championId);
}

export const getWaveNbFromTime = (time: number) => {
	return Math.ceil((time - 90) / 30);
};

export function editFolderStructureWithDirection(
	id: string,
	items: FolderStructureItem[],
	direction: "above" | "bellow"
): FolderStructureItem | null {
	const currentItemPath = findFolderStructureItemPath(id, items);
	if (currentItemPath === null) return null;
	let itemPathTarget = [...currentItemPath];
	if (itemPathTarget[itemPathTarget.length - 1] !== undefined)
		itemPathTarget[itemPathTarget.length - 1]! += direction === "above" ? -1 : 1;
	const targetItem = findFolderStructureItemWithPath(itemPathTarget, items);
	if (targetItem === null) {
		let targetIndex = itemPathTarget[itemPathTarget.length - 1];
		let parentArray = items;

		if (targetIndex === undefined) return null; // Invalid path

		// Traverse to the correct parent array if nested
		if (itemPathTarget.length > 1) {
			const parentPath = itemPathTarget.slice(0, -1);
			const parentItem = findFolderStructureItemWithPath(parentPath, items);
			if (!parentItem || !isFolderItem(parentItem)) return null; // Invalid parent path or parent is not a folder
			parentArray = parentItem.children;
		}

		const newItem = {
			id: uuidv4(),
			name: null,
			type: "map",
		} as const;

		// Add new item at the start or end based on the direction
		if (direction === "above" && targetIndex <= 0) {
			parentArray.unshift(newItem);
		} else if (direction === "bellow" && targetIndex >= parentArray.length) {
			parentArray.push(newItem);
		}
		return newItem;
	}
	return targetItem;
}

export function findMapWithLowestSumOfIndices(items: FolderStructureItem[]) {
	let minSum = Infinity;
	let minItem = null;

	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		if (item === undefined) continue;
		if (item.type === "map") {
			// Assuming there's a way to identify if an item is a map
			const sumOfIndices = getSumOfIndicesForItem(item.id, items);
			if (sumOfIndices === null) continue;
			if (sumOfIndices < minSum) {
				minSum = sumOfIndices;
				minItem = item;
			}
		}
	}

	return minItem;
}

function getSumOfIndicesForItem(id: string, items: FolderStructureItem[], path: number[] = []): number | null {
	let sum = 0;
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		if (item === undefined) continue;
		if (item.id === id) {
			return sum + i;
		}
		if (isFolderItem(item)) {
			const foundSum = getSumOfIndicesForItem(id, item.children, [...path, i]);
			if (foundSum !== null) {
				return sum + foundSum;
			}
		}
		sum += i;
	}
	return null; // Item not found
}

export function addItemBasedOnTypeInFolderStructure(
	id: string,
	items: FolderStructureItem[],
	newItem: FolderStructureItem
): boolean {
	const path = findFolderStructureItemPath(id, items);
	if (!path) {
		return false; // Item with given ID not found
	}

	let currentItems = items;
	for (let i = 0; i < path.length; i++) {
		const index = path[i];
		if (index === undefined) continue;

		if (index < 0 || index >= currentItems.length) {
			return false; // Invalid path
		}

		if (i === path.length - 1) {
			const targetItem = currentItems[index];
			if (targetItem && isFolderItem(targetItem)) {
				// Target is a folder, add the new item to its children
				targetItem.children.push(newItem);
				return true;
			} else {
				// Target is not a folder, add the new item after the target item
				if (index + 1 <= currentItems.length) {
					currentItems.splice(index + 1, 0, newItem);
					return true;
				}
				return false;
			}
		}

		const currentItem = currentItems[index];
		if (currentItem === undefined) return false; // Invalid path
		if (!isFolderItem(currentItem)) {
			return false; // Not a folder item
		}

		currentItems = currentItem.children;
	}

	return false; // Path was empty or did not lead to a valid item
}

export function editFolderStructureItem(
	id: string,
	items: FolderStructureItem[],
	editFunction: (item: FolderStructureItem) => void
): boolean {
	return editFolderStructureItemWithPath(findFolderStructureItemPath(id, items) ?? [], items, editFunction);
}

export function removeItemFromFolderStructure(id: string, items: FolderStructureItem[]): FolderStructureItem | false {
	return removeItemFromFolderStructureWithPath(findFolderStructureItemPath(id, items) ?? [], items);
}

export function removeItemFromFolderStructureWithPath(
	path: number[],
	items: FolderStructureItem[]
): FolderStructureItem | false {
	if (path.length === 0) {
		return false; // Empty path, cannot remove
	}

	let currentItems = items;
	for (let i = 0; i < path.length - 1; i++) {
		const index = path[i];
		if (index === undefined) continue;

		// Check if the index is valid
		if (index < 0 || index >= currentItems.length) {
			return false; // Invalid path
		}

		const currentItem = currentItems[index];
		if (currentItem === undefined) return false; // Invalid path
		if (!isFolderItem(currentItem)) {
			return false; // Path leads to a non-folder item before the end
		}

		currentItems = currentItem.children;
	}

	const lastIndex = path[path.length - 1];
	if (lastIndex === undefined) return false; // Empty last index
	if (lastIndex < 0 || lastIndex >= currentItems.length) {
		return false; // Invalid last index
	}

	// Remove the target item
	const savedItem = currentItems[lastIndex];
	if (savedItem === undefined) return false; // Invalid path
	currentItems.splice(lastIndex, 1);
	return savedItem; // Removal successful
}

export function editFolderStructureItemWithPath(
	path: number[],
	items: FolderStructureItem[],
	editFunction: (item: FolderStructureItem) => void
): boolean {
	let currentItems = items;
	for (let i = 0; i < path.length; i++) {
		const index = path[i];
		if (index === undefined) continue;

		// Check if the index is valid
		if (index < 0 || index >= currentItems.length) {
			return false; // Invalid path
		}

		if (i === path.length - 1) {
			// Last index, apply the edit function to the target item
			const item = currentItems[index];
			if (item === undefined) return false; // Invalid path
			editFunction(item);
			return true; // Edit successful
		}

		// Navigate to the next level of items
		const currentItem = currentItems[index];
		if (currentItem === undefined) return false; // Invalid path
		if (!isFolderItem(currentItem)) {
			return false; // Path leads to a non-folder item before the end
		}

		currentItems = currentItem.children;
	}

	return false; // Path was empty or did not lead to a valid item
}

export function findFolderStructureItemWithPath(
	path: number[],
	items: FolderStructureItem[]
): FolderStructureItem | null {
	let currentItems = items;
	for (let i = 0; i < path.length; i++) {
		const index = path[i];
		if (index === undefined) continue;

		// Check if the index is valid
		if (index < 0 || index >= currentItems.length) {
			return null; // Invalid path
		}

		if (i === path.length - 1) {
			// Last index, return the target item
			const item = currentItems[index];
			if (item === undefined) return null; // Invalid path
			return item;
		}

		// Navigate to the next level of items
		const currentItem = currentItems[index];
		if (currentItem === undefined) return null; // Invalid path
		if (!isFolderItem(currentItem)) {
			return null; // Path leads to a non-folder item before the end
		}

		currentItems = currentItem.children;
	}

	return null; // Path was empty or did not lead to a valid item
}

export function findFolderStructureItemPath(
	id: string,
	items: FolderStructureItem[],
	path: number[] = []
): number[] | null {
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		if (item === undefined) continue;

		// If item matches the ID, return the path to this item
		if (item.id === id) {
			return [...path, i];
		}

		// If the item is a folder, recursively search its children
		if (isFolderItem(item)) {
			const foundPath = findFolderStructureItemPath(id, item.children, [...path, i]);
			if (foundPath) {
				return foundPath;
			}
		}
	}

	// Return null if the item is not found
	return null;
}

export const fetchSummonerDto = async (selectedServer: RiotServer, gameName: string, tagLine: string) => {
	const resSummoner = await axios.get(
		`/api/riot/summoner/name?summonerName=${gameName}-${tagLine}&server=${selectedServer}`
	);
	return resSummoner.data as SummonerDTO;
};

export const fetchMatchesIds = async (puuid: string, selectedServer: RiotServer) => {
	const resHisto = await axios.get(`/api/riot/matches?puuid=${puuid}&server=${selectedServer}`);
	return resHisto.data as string[];
};

export const fetchMatchDto = async (gameId: string, selectedServer: RiotServer) => {
	const res = await axios.get(`/api/riot/matches/data?id=${gameId}&server=${selectedServer}`);
	return res.data as MatchDto;
};

export const fetchMatchTimelineDto = async (gameId: string, selectedServer: RiotServer) => {
	const res = await axios.get(`/api/riot/matches/timeline?id=${gameId}&server=${selectedServer}`);
	return res.data as MatchTimelineDto;
};

export const findNextChampActionToParse = (
	champsTimestamps: TeamData<number>,
	champsActions: TeamData<ChampAction[]>,
	champsActionsToDisplay: TeamData<ChampActionToDisplay[]>
): { side: Side; lane: Lane } | null => {
	let exceptedChamps: { side: Side; lane: Lane }[] = [];
	sides.forEach((side) => {
		lanes.forEach((lane) => {
			if (champsActions[side][lane].length === champsActionsToDisplay[side][lane].length)
				exceptedChamps.push({ side, lane });
		});
	});
	return findLowestInTeamData(champsTimestamps, exceptedChamps);
};

export const findLowestInTeamData = (
	teamData: TeamData<number>,
	exceptedChamps: { side: Side; lane: Lane }[]
): { side: Side; lane: Lane } | null => {
	let lowestValue = Infinity;
	let lowestSide: Side | null = null;
	let lowestLane: Lane | null = null;
	sides.forEach((side) => {
		lanes.forEach((lane) => {
			if (exceptedChamps.find((champ) => champ.side === side && champ.lane === lane)) return;
			if (teamData[side][lane] < lowestValue) {
				lowestValue = teamData[side][lane];
				lowestSide = side;
				lowestLane = lane;
			}
		});
	});
	return lowestSide === null || lowestLane === null ? null : { side: lowestSide, lane: lowestLane };
};

export const createRandomSetup = (
	championsData: RiotState["championsData"],
	ids: TeamData<string | null>,
	champsLocked?: TeamData<boolean>
) => {
	// Champs
	const randomChampionsIds = randomChamps(
		championsData,
		JSON.parse(JSON.stringify(ids)) as typeof ids,
		champsLocked ? (JSON.parse(JSON.stringify(champsLocked)) as typeof champsLocked) : undefined
	);

	// Time
	const randomTime = getRandomTimestamp();

	// Turrets
	let randomTurretsEvents: TurretEvent[] = [];
	teamsId.forEach((teamId) => {
		lanesType.forEach((laneType) => {
			// EARLY
			let platesDown = 0;
			let timeTested = 3 * 60 + 25;
			while (timeTested < 14 * 60 && platesDown < 5) {
				const progress = (timeTested - 3 * 60 - 25) / (14 * 60 - 3 * 60 - 25);
				const chance = 1 / (20 - 18 * progress);
				if (Math.random() < chance) {
					randomTurretsEvents.push(getTurretEvent(teamId, laneType, "OUTER_TURRET", timeTested));
					platesDown++;
				}
				timeTested += 30;
			}

			// MID / LATE
			timeTested = 14 * 60;
			do {
				timeTested = getRandomIntBetween(timeTested, 30 * 60);
				const newTurretEvent = takeDownLaneTurret(randomTurretsEvents, timeTested, teamId, laneType);
				if (newTurretEvent === null) break;
				randomTurretsEvents.push(newTurretEvent);
			} while (
				Math.abs(timeTested - 30 * 60) > 2 * 60 &&
				Object.values(turretsEventsToTurretsAlive(randomTurretsEvents, Infinity)[teamId][laneType]).find(
					({ value }) => value !== 0
				)
			);
		});
	});

	const randomTurretsAlive = turretsEventsToTurretsAlive(randomTurretsEvents, randomTime);

	// Waves
	const randomWavesRegions = {} as Record<LaneType, WaveRegion>;
	lanesType.forEach(
		(laneType) =>
			(randomWavesRegions[laneType] = getWaveRegion(
				randomTurretsAlive,
				laneType,
				getRandomIntBetween(1, 3) as 1 | 2 | 3
			))
	);

	// Positions
	let randomChampsPositions = initTeamData({ x: 0, y: 0 });
	sides.forEach((champSide) => {
		// Random Position Top
		setRandomPosInLane(randomChampsPositions, randomTurretsAlive, randomWavesRegions, champSide, "top", "TOP_LANE");

		// Random Position Jungle
		// 0/8m/14m dans la jungle 100%/50%(river/objectifs)/30%(river/objectifs/invade)
		let randomJunglePosition: "camps" | "river" | "objective" | "invade" = "camps";
		if (randomTime >= 8 * 60) {
			if (randomTime >= 14 * 60) {
				if (Math.random() < 0.3)
					getRandomIntBetween(1, 2) === 1 ? (randomJunglePosition = "river") : (randomJunglePosition = "objective");
			} else {
				if (Math.random() < 0.5) {
					const randomJunglePositionIndex = getRandomIntBetween(1, 3);
					switch (randomJunglePositionIndex) {
						case 1:
							randomJunglePosition = "river";
							break;
						case 2:
							randomJunglePosition = "objective";
							break;
						case 3:
							randomJunglePosition = "invade";
							break;
					}
				}
			}
		}
		switch (randomJunglePosition) {
			case "camps": {
				const randomCampIndex = getRandomIntBetween(0, 5);
				const camp = camps[randomCampIndex];
				const campPos = jungleCampsData.find(({ type, side }) => type === camp && side === champSide)?.pos;
				if (campPos) setChampPosistionSafe(randomChampsPositions, champSide, "jungle", campPos);
				break;
			}
			case "river": {
				const scuttleSideIndex = getRandomIntBetween(0, 1);
				const scuttleSide = sides[scuttleSideIndex];
				const scuttlePos = jungleCampsData.find(({ type, side }) => type === "Scuttle" && scuttleSide === side)?.pos;
				if (scuttlePos) setChampPosistionSafe(randomChampsPositions, champSide, "jungle", scuttlePos);
				break;
			}
			case "objective":
				const objectiveIndex = getRandomIntBetween(0, 1);
				const objectivePos = objectivesData[objectiveIndex]?.pos;
				if (objectivePos) setChampPosistionSafe(randomChampsPositions, champSide, "jungle", objectivePos);
				break;
			case "invade":
				const randomCampIndex = getRandomIntBetween(0, 5);
				const camp = camps[randomCampIndex];
				const campPos = jungleCampsData.find(({ type, side }) => type === camp && side !== champSide)?.pos;
				if (campPos) setChampPosistionSafe(randomChampsPositions, champSide, "jungle", campPos);
				break;
		}

		// Random Position Mid
		setRandomPosInLane(randomChampsPositions, randomTurretsAlive, randomWavesRegions, champSide, "mid", "MID_LANE");

		// Random Position Bot
		setRandomPosInLane(randomChampsPositions, randomTurretsAlive, randomWavesRegions, champSide, "bot", "BOT_LANE");

		// Random Position Sup
		// 100% collé ADC pre 14m | post 50% jungler 25% adc 12.5% mid 12.5% top
		if (randomTime < 14 * 60) {
			setChampPosistionSafe(randomChampsPositions, champSide, "sup", randomChampsPositions[champSide].bot);
		} else {
			const randomRoleIndex = getRandomIntBetween(0, 7);
			switch (randomRoleIndex) {
				case 0:
				case 1:
				case 2:
				case 3:
					setChampPosistionSafe(randomChampsPositions, champSide, "sup", randomChampsPositions[champSide].jungle);
					break;
				case 4:
				case 5:
					setChampPosistionSafe(randomChampsPositions, champSide, "sup", randomChampsPositions[champSide].bot);
					break;
				case 6:
					setChampPosistionSafe(randomChampsPositions, champSide, "sup", randomChampsPositions[champSide].mid);
					break;
				case 7:
					setChampPosistionSafe(randomChampsPositions, champSide, "sup", randomChampsPositions[champSide].top);
					break;
			}
		}
	});

	// 25% de chance mort
	let randomDeathsData = initTeamData<{ timestamp: number; respawnTime: number }[]>([]);
	const { lvls: defaultLvls } = csByTime(randomTime);
	sides.forEach((side) => {
		lanes.forEach((lane) => {
			if (Math.random() < 0.15) {
				const maxDeathTime = calcRespawnTime(randomTime, defaultLvls[side][lane]);
				const deathTime = getRandomIntBetween(defaultLvls[side][lane], maxDeathTime);
				randomDeathsData[side][lane].push({ timestamp: randomTime, respawnTime: deathTime });
			}
		});
	});

	return {
		randomChampionsIds,
		randomTime,
		randomTurretsEvents,
		randomWavesRegions,
		randomChampsPositions,
		randomDeathsData,
	};
};

export const takeDownLaneTurret = (
	turretsEvents: TurretEvent[],
	timestamp: number,
	teamId: TeamId,
	laneType: LaneType
) => {
	const turretsAlive = turretsEventsToTurretsAlive(turretsEvents, Infinity);
	const laneTurretsAlive = turretsAlive[teamId][laneType];
	let turretType: BuildingType = "OUTER_TURRET";
	if (laneTurretsAlive.OUTER_TURRET.value === 0) turretType = "INNER_TURRET";
	if (turretType === "INNER_TURRET" && laneTurretsAlive.INNER_TURRET.value === 0) turretType = "BASE_TURRET";
	if (turretType === "BASE_TURRET" && laneTurretsAlive.BASE_TURRET.value === 0) turretType = "INHIBITOR_BUILDING";
	if (turretType === "INHIBITOR_BUILDING" && laneTurretsAlive.INHIBITOR_BUILDING.value === 0)
		turretType = "NEXUS_TURRET";
	if (turretType === "NEXUS_TURRET" && laneTurretsAlive.NEXUS_TURRET.value === 0) return null;
	return getTurretEvent(teamId, laneType, turretType, timestamp);
};

export const turretsEventsToTurretsAlive = (turretsEvents: TurretEvent[], timestampToDisplay: number): TurretsAlive => {
	let newTurretsAlive = JSON.parse(JSON.stringify(defaultTurretsAlive)) as TurretsAlive;
	turretsEvents.forEach(({ buildingType, laneType, teamId, timestamp, type }) => {
		if (timestamp > timestampToDisplay) return;
		newTurretsAlive[teamId][laneType][buildingType] = {
			usingPlates: type === "TURRET_PLATE_DESTROYED",
			value: type === "BUILDING_KILL" ? 0 : newTurretsAlive[teamId][laneType][buildingType].value - 1,
		};
	});
	if (timestampToDisplay > 840)
		teamsId.forEach((teamId) => {
			lanesType.forEach((laneType) => {
				newTurretsAlive[teamId][laneType].OUTER_TURRET.usingPlates = false;
			});
		});
	return newTurretsAlive;
};

export const deathsDataToRespawnsTimes = (
	deathsData: TeamData<{ timestamp: number; respawnTime: number }[]>,
	timestampToDisplay: number
) => {
	let newRespawnsTimes = initTeamData(0);
	sides.forEach((side) =>
		lanes.forEach((lane) => {
			const currentDeathData = deathsData[side][lane].find(
				({ respawnTime, timestamp }) => timestamp <= timestampToDisplay && timestamp + respawnTime > timestampToDisplay
			);
			if (currentDeathData === undefined) return;
			newRespawnsTimes[side][lane] = currentDeathData.respawnTime - (timestampToDisplay - currentDeathData.timestamp);
		})
	);
	return newRespawnsTimes;
};

export function findHighestNumberInferiorTo(arr: number[], num: number): number | null {
	// Filter out the numbers greater than or equal to 'num', and find the maximum of the remaining numbers.
	const inferiorNumbers = arr.filter((x) => x <= num);
	if (inferiorNumbers.length === 0) return null; // return null if no number is inferior to 'num'.

	let maxInferior = inferiorNumbers[0] as number;
	for (const x of inferiorNumbers) {
		if (x > maxInferior) maxInferior = x;
	}

	return maxInferior;
}

export function handleItemEvent(
	participantId: number | undefined,
	type: RiotItemEvent,
	itemKey: number | undefined,
	timestamp: number,
	participantsIds: TeamData<number | null>,
	newChampsInventoriesActions: TeamData<InventoryAction[]>,
	timestampToDisplay: number
) {
	if (typeof itemKey === "number" && timestamp / 1000 <= timestampToDisplay && isRiotItemEvent(type)) {
		const itemKeyStr = itemKey.toString();
		if (itemKeyStr === "3340" || itemKeyStr === "3364" || itemKeyStr === "3363") return;
		const res = findSideLaneInObj(participantsIds, participantId);
		if (res === undefined) return;
		const { side, lane } = res;
		newChampsInventoriesActions[side][lane].push({
			action: riotEventTypeToActionType[type],
			itemKey: itemKeyStr,
			timestamp: timestamp / 1000,
		});
	}
}

export const getActualItems = (inventory: InventoryAction[], currentTime: number) => {
	let finalInv: string[] = [];
	[...inventory]
		.sort((a, b) => a.timestamp - b.timestamp)
		.forEach(({ itemKey, timestamp, action }) => {
			if (timestamp > currentTime) return;
			if (action === "Buy") finalInv.push(itemKey);
			if (action === "Sell" || action === "Destroy" || action === "Undo") {
				const indexToDelete = finalInv.indexOf(itemKey);
				if (indexToDelete !== -1) finalInv.splice(indexToDelete, 1);
			}
		});
	return finalInv;
};

export function getLastChampPos(
	champActionsToDisplay: ChampActionToDisplay[],
	timestampToDisplay: number,
	champSide: Side
) {
	const champActionsToDisplayMap = champActionsToDisplay.filter(({ started }) => started);

	// Handle if it only cleared a camp
	if (champActionsToDisplayMap.length === 1 && isCamp((champActionsToDisplayMap[0] as ChampActionToDisplay).type)) {
		const { mapSide, type } = champActionsToDisplayMap[0] as ChampActionToDisplay;
		const campPos = jungleCampsData.find(
			({ type: campType, side: campSide }) => type === campType && mapSide === campSide
		);
		return campPos?.pos;
	}

	for (let i = champActionsToDisplayMap.length - 1; i >= 0; i--) {
		const champActionToDisplayMap = champActionsToDisplayMap[i];
		if (champActionToDisplayMap === undefined) continue;

		if (isChampActionTravel(champActionToDisplayMap)) {
			const travel = champActionToDisplayMap.travel as PathData;
			if (champActionToDisplayMap.startTimestamp >= timestampToDisplay) return travel.start;
			const timeAtEndOfAction = champActionToDisplayMap.startTimestamp + champActionToDisplayMap.time;
			if (timeAtEndOfAction <= timestampToDisplay) return travel.end;
			const newPathData = cutPath(
				travel.path,
				champActionToDisplayMap.time,
				timestampToDisplay - champActionToDisplayMap.startTimestamp
			);
			if (newPathData === "error") return travel.end;
			return newPathData.end;
		} else if (isChampActionTeleport(champActionToDisplayMap)) {
			if (timestampToDisplay >= champActionToDisplayMap.startTimestamp + champActionToDisplayMap.time)
				return basesPos[champSide];
			continue;
		}
	}
}

export const xpWinsToTotalXpAtTimestamp = (
	xpWins: { timestamp: number; xpWin: number }[],
	timestampLimit?: number
): number => {
	let xp = 0;
	let lastTimestamp = 0;
	xpWins.forEach(({ timestamp, xpWin }) => {
		if (timestampLimit !== undefined && timestamp > timestampLimit) return;
		xp += xpWin;
		lastTimestamp = timestamp;
	});
	return xp;
};

export const getFinalTimestampFromChampActionsToDisplay = (champActionsToDisplay: { time: number }[]) => {
	return champActionsToDisplay.reduce((acc, { time }) => acc + (time || 0), 90);
};

export const getChampItemsMsFct = (
	itemsData: RiotState["itemsData"],
	champInventoryActions: InventoryAction[],
	timestampToDisplay: number
) => {
	return getActualItems(champInventoryActions, timestampToDisplay).reduce(
		(acc, itemKey) => acc + (itemsData?.[itemKey]?.stats.FlatMovementSpeedMod ?? 0),
		0
	);
};

export const getChampMsFct = (
	itemsData: RiotState["itemsData"],
	champInventoryActions: InventoryAction[],
	timestampToDisplay: number,
	champMovementSpeed: number
) => {
	return getChampItemsMsFct(itemsData, champInventoryActions, timestampToDisplay) + champMovementSpeed;
};

function toVector(a: Vector2d, b: Vector2d): Vector2d {
	return {
		x: b.x - a.x,
		y: b.y - a.y,
	};
}
function crossProduct(v1: Vector2d, v2: Vector2d): number {
	return v1.x * v2.y - v1.y * v2.x;
}
function isPointToLeftOfVector(point: Vector2d, start: Vector2d, end: Vector2d): boolean {
	const pointVector = toVector(start, point);
	const lineVector = toVector(start, end);
	return crossProduct(lineVector, pointVector) > 0;
}

export function isPointInsideRectangle(corners: Vector2d[], point: Vector2d): boolean {
	if (corners.length !== 4) {
		throw new Error("Rectangle must have 4 corners");
	}

	let isToLeftOfAllEdges = true;
	let isToRightOfAllEdges = true;
	for (let i = 0; i < corners.length; i++) {
		const next = (i + 1) % corners.length;
		if (!isPointToLeftOfVector(point, corners[i] as Vector2d, corners[next] as Vector2d)) {
			isToLeftOfAllEdges = false;
		} else {
			isToRightOfAllEdges = false;
		}
		if (!isToLeftOfAllEdges && !isToRightOfAllEdges) return false;
	}

	return true;
}

export const processMatchDto = (matchDto: MatchDto) => {
	let participantsIds = initTeamData<number | null>(null);
	let puuids = initTeamData<string | null>(null);
	let champsIds = initTeamData<string | null>(null);

	matchDto.info.participants?.forEach((participant) => {
		const { team, role } = getRoleAndTeam(participant.teamPosition, participant.teamId);
		champsIds[team][role] = participant.championId.toString();
		puuids[team][role] = participant.puuid;
		participantsIds[team][role] = participant.participantId;
	});

	return { participantsIds, puuids, champsIds };
};

export const getChampsMovementSpeeds = (
	championsData: RiotState["championsData"],
	champsIds: TeamData<string | null>
) => {
	let newMovementSpeeds = initTeamData(345);
	sides.forEach((side) =>
		lanes.forEach((lane) => {
			newMovementSpeeds[side][lane] = getChampMovementSpeed(championsData, champsIds[side][lane]);
		})
	);
	return newMovementSpeeds;
};

export const getChampMovementSpeed = (championsData: RiotState["championsData"], champKey: string | null) => {
	return champKey ? championsData?.[champKey]?.stats.movespeed ?? 345 : 345;
};

export const processMatchTimelineDto = (
	matchTimelineDto: MatchTimelineDto,
	participantsIds: TeamData<number | null>
): {
	deathsData: TeamData<{ timestamp: number; respawnTime: number }[]>;
} => {
	let deathsData = initTeamData<{ timestamp: number; respawnTime: number }[]>([]);
	if (!matchTimelineDto) return { deathsData };

	matchTimelineDto.info.frames.forEach((frame) => {
		frame.events.forEach(({ type, victimId, timestamp }) => {
			if (type === "CHAMPION_KILL" || type === "CHAMPION_SPECIAL_KILL") {
				const deathTime = timestamp / 1000;

				const participantKilled = matchTimelineDto.info.participants?.find(
					(participant) => participant.participantId === victimId
				);
				if (participantKilled === undefined) return;
				const res = findSideLaneInObj(participantsIds, participantKilled?.participantId);
				if (res === undefined) return;
				const { side, lane } = res;

				const lvl =
					matchTimelineDto.info.frames[Math.floor(timestamp / matchTimelineDto.info.frameInterval)]?.participantFrames[
						participantKilled.participantId
					]?.level;
				if (lvl === undefined) return;

				const respawnTime = calcRespawnTime(deathTime, lvl);
				deathsData[side][lane].push({ respawnTime: Math.ceil(respawnTime), timestamp: deathTime });
			}
		});
	});

	return { deathsData };
};

export const setRandomPosInLane = (
	champsPos: TeamData<Vector2d>,
	turretsAlive: TurretsAlive,
	wavesRegions: Record<LaneType, WaveRegion>,
	champSide: Side,
	champLane: Lane,
	laneType: LaneType
) => {
	const waveRegion = wavesRegions[laneType];
	if (
		laneType !== "MID_LANE" &&
		((champSide === "red" && waveRegion === "r1" && turretsAlive[100][laneType].OUTER_TURRET.value !== 0) ||
			(champSide === "red" && waveRegion === "r1b" && turretsAlive[100][laneType].INNER_TURRET.value !== 0) ||
			(champSide === "blue" && waveRegion === "r3" && turretsAlive[200][laneType].OUTER_TURRET.value !== 0) ||
			(champSide === "blue" && waveRegion === "r3b" && turretsAlive[200][laneType].INNER_TURRET.value !== 0)) &&
		Math.random() < 0.1
	) {
		// 10% Proxy
		const newPosition =
			proxyPositions[champSide === "blue" ? "red" : "blue"][laneType][
				`${waveRegion[0]}${waveRegion[2] ?? ""}` as "r" | "rb"
			];
		setChampPosistionSafe(champsPos, champSide, champLane, newPosition);
	} else {
		const { x, y, angle } = wavesPos[laneType][waveRegion];
		const angleRandom = getRandomIntBetween(-35, 35);
		const newX = x + Math.cos((angle + angleRandom) * (Math.PI / 180)) * 90 * (champSide === "blue" ? -1 : 1);
		const newY = y + Math.sin((angle + angleRandom) * (Math.PI / 180)) * 90 * (champSide === "blue" ? -1 : 1);
		setChampPosistionSafe(champsPos, champSide, champLane, { x: newX, y: newY });
	}
};

export const getTurretEvent = (
	teamId: TeamId,
	laneType: LaneType,
	buildingType: BuildingType,
	timestamp: number
): TurretEvent => {
	const finalType = buildingType === "OUTER_TURRET" && timestamp < 14 * 60 ? "TURRET_PLATE_DESTROYED" : "BUILDING_KILL";
	return { buildingType, laneType, teamId, timestamp, type: finalType };
};

export const setChampPosistionSafe = (champsPos: TeamData<Vector2d>, side: Side, lane: Lane, newPosition: Vector2d) => {
	// Check if the new position is already taken and put the champ there if not else put it 100 units away
	const takenPositions = Object.values(champsPos).flatMap((side) => Object.values(side));
	// Check if the new position is already taken
	const isPositionTaken = takenPositions.some(
		(position) => position.x === newPosition.x && position.y === newPosition.y
	);
	if (!isPositionTaken) {
		champsPos[side][lane] = newPosition;
	} else {
		const angle = -45;
		const angleRandom = getRandomIntBetween(-60, 60);
		const newX = newPosition.x + Math.cos((angle + angleRandom) * (Math.PI / 180)) * 70 * (side === "blue" ? -1 : 1);
		const newY = newPosition.y + Math.sin((angle + angleRandom) * (Math.PI / 180)) * 70 * (side === "blue" ? -1 : 1);
		const newNewPosition = {
			x: newX,
			y: newY,
		};
		champsPos[side][lane] = newNewPosition;
	}
};

export const getWaveRegion = (turretsAlive: TurretsAlive, laneType: LaneType, waveRegionIndex: 1 | 3 | 2) => {
	return `r${waveRegionIndex}${
		waveRegionIndex === 2 || turretsAlive[waveRegionIndex === 1 ? 100 : 200][laneType].OUTER_TURRET.value > 0 ? "" : "b"
	}` as WaveRegion;
};

export const getRandomTimestamp = (): number => {
	const gamePhases = ["early", "mid", "late"];
	const gamePhase = gamePhases[getRandomIntBetween(0, gamePhases.length - 1)];
	switch (gamePhase) {
		case "early":
			return getRandomIntBetween(1.5 * 60, 14 * 60);
		case "mid":
			return getRandomIntBetween(14 * 60, 20 * 60);
		case "late":
			return getRandomIntBetween(20 * 60, 30 * 60);
		default:
			return getRandomIntBetween(0, 30 * 60);
	}
};

export const getRandomIntBetween = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

function isHovering(polyline: Vector2d[], rectTopLeft: Vector2d, rectBottomRight: Vector2d): boolean {
	// Check for each segment in the polyline
	for (let i = 0; i < polyline.length - 1; i++) {
		const start = polyline[i] as Vector2d;
		const end = polyline[i + 1] as Vector2d;

		// Create bounding box for the line segment
		const lineLeftX = Math.min(start.x, end.x);
		const lineRightX = Math.max(start.x, end.x);
		const lineTopY = Math.max(start.y, end.y);
		const lineBottomY = Math.min(start.y, end.y);

		// Check if bounding boxes intersect
		if (
			lineRightX < rectTopLeft.x ||
			lineLeftX > rectBottomRight.x ||
			lineTopY < rectBottomRight.y ||
			lineBottomY > rectTopLeft.y
		) {
			// No intersection with this segment, continue to the next
			continue;
		}

		// If we get here, the bounding boxes intersect, but we need to check for actual line segment intersection
		if (lineSegmentIntersectsRectangle(start, end, rectTopLeft, rectBottomRight)) {
			return true; // The polyline hovers over the rectangle
		}
	}

	return false; // No part of the polyline hovers over the rectangle
}

// Helper function to check if a line segment intersects a rectangle
function lineSegmentIntersectsRectangle(a: Vector2d, b: Vector2d, topLeft: Vector2d, bottomRight: Vector2d): boolean {
	// Check if either end of the line segment is inside the rectangle
	if (pointInsideRectangle(a, topLeft, bottomRight) || pointInsideRectangle(b, topLeft, bottomRight)) {
		return true;
	}

	// Check if the line segment intersects any of the rectangle's sides
	if (
		lineSegmentIntersectsLine(a, b, { x: topLeft.x, y: topLeft.y }, { x: bottomRight.x, y: topLeft.y }) || // Top side
		lineSegmentIntersectsLine(a, b, { x: bottomRight.x, y: topLeft.y }, { x: bottomRight.x, y: bottomRight.y }) || // Right side
		lineSegmentIntersectsLine(a, b, { x: bottomRight.x, y: bottomRight.y }, { x: topLeft.x, y: bottomRight.y }) || // Bottom side
		lineSegmentIntersectsLine(a, b, { x: topLeft.x, y: bottomRight.y }, { x: topLeft.x, y: topLeft.y })
	) {
		// Left side
		return true;
	}

	return false;
}

// Helper function to check if a point is inside a rectangle
function pointInsideRectangle(point: Vector2d, topLeft: Vector2d, bottomRight: Vector2d): boolean {
	return point.x >= topLeft.x && point.x <= bottomRight.x && point.y <= topLeft.y && point.y >= bottomRight.y;
}

// Helper function to check if two line segments intersect
function lineSegmentIntersectsLine(a1: Vector2d, a2: Vector2d, b1: Vector2d, b2: Vector2d): boolean {
	// Separating axis theorem for line segment intersection
	const crossProduct = (point: Vector2d, lineStart: Vector2d, lineEnd: Vector2d) => {
		return (point.y - lineStart.y) * (lineEnd.x - lineStart.x) - (point.x - lineStart.x) * (lineEnd.y - lineStart.y);
	};

	// Check if the points of the second segment are on opposite sides of the first
	let d1 = crossProduct(a1, b1, b2);
	let d2 = crossProduct(a2, b1, b2);
	if (d1 * d2 > 0) {
		return false;
	}

	// Check if the points of the first segment are on opposite sides of the second
	let d3 = crossProduct(b1, a1, a2);
	let d4 = crossProduct(b2, a1, a2);
	return !(d3 * d4 > 0);
}

const pointsArrToDistance = (points: number[], i: number) => {
	return distanceBetweenPoints(
		{ x: points[i] as number, y: points[i + 1] as number },
		{ x: points[i + 2] as number, y: points[i + 3] as number }
	);
};

// Function to find the midpoint of a path
export const findMidpoint = (points: number[]) => {
	let totalLength = 0;
	for (let i = 0; i < points.length - 2; i += 2) totalLength += pointsArrToDistance(points, i);

	let halfLength = totalLength / 2;
	let cumulativeLength = 0;
	let midpoint = [0, 0];

	let index = 0;
	for (let i = 0; i < points.length - 2; i += 2) {
		let segmentLength = pointsArrToDistance(points, i);
		if (cumulativeLength + segmentLength > halfLength) {
			let ratio = (halfLength - cumulativeLength) / segmentLength;
			midpoint[0] = (points[i] as number) + ratio * ((points[i + 2] as number) - (points[i] as number));
			midpoint[1] = (points[i + 1] as number) + ratio * ((points[i + 3] as number) - (points[i + 1] as number));
			index = i / 2;
			break;
		}
		cumulativeLength += segmentLength;
	}

	return { midPoint: { x: midpoint[0] as number, y: midpoint[1] as number }, index };
};

export function calculatePerpendicularPoint(midpoint: Vector2d, angle: number, distance: number): Vector2d {
	// Calculate a point that is 'distance' away from 'midpoint' at 'angle' radians perpendicular to the line
	return {
		x: midpoint.x + distance * Math.cos(angle + Math.PI / 2),
		y: midpoint.y + distance * Math.sin(angle + Math.PI / 2),
	};
}

export function getRectangleNearLine(
	polyline: Vector2d[],
	rectWidth: number,
	rectHeight: number
): { topLeft: Vector2d; bottomRight: Vector2d } | null {
	// Calculate the midpoint of the entire polyline
	const { midPoint, index } = findMidpoint(vector2dToLineData(polyline));
	if (index > polyline.length - 2 || index < 0) return null;

	// Calculate the angle of the line segment at the midpoint
	const angle: number = Math.atan2(
		(polyline[index + 1] as Vector2d).y - (polyline[index] as Vector2d).y,
		(polyline[index + 1] as Vector2d).x - (polyline[index] as Vector2d).x
	);

	// Calculate the perpendicular angle
	const perpendicularAngle = angle + Math.PI / 2;

	// Try to place the rectangle above or below the polyline, checking which side is free
	for (const distance of [rectHeight / 2, -rectHeight / 2]) {
		const topLeft: Vector2d = calculatePerpendicularPoint(midPoint, perpendicularAngle, distance);
		const bottomRight: Vector2d = {
			x: topLeft.x + rectWidth,
			y: topLeft.y - rectHeight,
		};

		// If this placement does not hover, return it
		if (!isHovering(polyline, topLeft, bottomRight)) {
			return { topLeft, bottomRight };
		}
	}

	// If no placement found, throw an error or return null
	return null;
	// throw new Error("No valid rectangle placement found that does not hover over the polyline.");
}

export const mergeGroups = (groups: { side: Side; lane: Lane }[][]): { side: Side; lane: Lane }[][] => {
	let merged = true;
	while (merged) {
		merged = false;
		const newGroups: { side: Side; lane: Lane }[][] = [];
		const skippedIndices = new Set<number>();

		for (let i = 0; i < groups.length; i++) {
			if (skippedIndices.has(i)) {
				continue;
			}

			let group = [...(groups[i] as { side: Side; lane: Lane }[])]; // Create a new array based on the current group

			for (let j = i + 1; j < groups.length; j++) {
				if (skippedIndices.has(j)) {
					continue;
				}

				if (
					group.some((champ) =>
						(groups[j] as { side: Side; lane: Lane }[]).some(
							(otherChamp) => champ.side === otherChamp.side && champ.lane === otherChamp.lane
						)
					)
				) {
					// Create a new merged array without duplicating Champs
					group = [
						...group,
						...(groups[j] as { side: Side; lane: Lane }[]).filter(
							(champ) =>
								!group.some((existingChamp) => champ.side === existingChamp.side && champ.lane === existingChamp.lane)
						),
					];
					merged = true;
					skippedIndices.add(j);
				}
			}

			newGroups.push(group);
		}

		if (merged) {
			groups = newGroups;
		}
	}

	return groups;
};

export const isPointInRectangle = (rectCorner1: Vector2d, rectCorner2: Vector2d, pointToCheck: Vector2d) => {
	const minX = Math.min(rectCorner1.x, rectCorner2.x);
	const maxX = Math.max(rectCorner1.x, rectCorner2.x);
	const minY = Math.min(rectCorner1.y, rectCorner2.y);
	const maxY = Math.max(rectCorner1.y, rectCorner2.y);
	// Check if the point is within the bounds
	return pointToCheck.x >= minX && pointToCheck.x <= maxX && pointToCheck.y >= minY && pointToCheck.y <= maxY;
};

export const dragBoundFuncDefault = (
	condition: boolean,
	containerDimensions?: {
		width: number;
		height: number;
	}
) => {
	return function handleDrag(this: Konva.Node, pos: Vector2d) {
		if (condition) {
			return {
				x: containerDimensions ? Math.max(0, Math.min(pos.x, containerDimensions.width)) : pos.x,
				y: containerDimensions ? Math.max(0, Math.min(pos.y, containerDimensions.height)) : pos.y,
			};
		} else {
			return {
				x: this.absolutePosition().x,
				y: this.absolutePosition().y,
			};
		}
	};
};

export function cutPath(path: Vector2d[], totalDuration: number, stopTime: number): PathData | "error" {
	if (path.length < 1) return "error";
	if (stopTime >= totalDuration) return "error";
	if (stopTime <= 0)
		return { path: [path[0] as Vector2d], end: path[0] as Vector2d, start: path[0] as Vector2d, distance: 0 };

	let totalDistance = 0;
	for (let i = 0; i < path.length - 1; i++) {
		const oldPos = path[i];
		const newPos = path[i + 1];
		if (oldPos === undefined || newPos === undefined) continue;
		const dx = newPos.x - oldPos.x;
		const dy = newPos.y - oldPos.y;
		totalDistance += Math.sqrt(dx * dx + dy * dy);
	}

	const speed = totalDistance / totalDuration;

	let traveledDistance = 0;
	for (let i = 0; i < path.length - 1; i++) {
		const oldPos = path[i];
		const newPos = path[i + 1];
		if (oldPos === undefined || newPos === undefined) continue;
		const dx = newPos.x - oldPos.x;
		const dy = newPos.y - oldPos.y;
		const segmentDistance = Math.sqrt(dx * dx + dy * dy);
		const segmentDuration = segmentDistance / speed;

		if (stopTime < traveledDistance + segmentDuration) {
			const ratio = (stopTime - traveledDistance) / segmentDuration;
			const stoppedPoint = {
				x: oldPos.x + ratio * dx,
				y: oldPos.y + ratio * dy,
			};

			const updatedPath = path.slice(0, i + 1);
			updatedPath.push(stoppedPoint);

			if (path[0] !== undefined) {
				return { path: updatedPath, end: stoppedPoint, start: path[0], distance: traveledDistance + segmentDistance };
			}
		}

		traveledDistance += segmentDuration;
	}

	// This point should not be reached if stopTime is less than totalDuration
	return "error";
}

export function getChampsPath(champActionsToDisplay: ChampActionToDisplay[], timestampToDisplay: number) {
	let champPath = champActionsToDisplay.map(({ startTimestamp, type, time, travel }) => {
		if (startTimestamp >= timestampToDisplay) return null;
		if ((type === "Recall" || type === "Respawn") && timestampToDisplay >= startTimestamp + time) return type;
		if (travel === null) return null;
		const timeAtEndOfAction = startTimestamp + time;
		if (timeAtEndOfAction <= timestampToDisplay) return { path: travel.path, time };
		const newPathData = cutPath(travel.path, time, timestampToDisplay - startTimestamp);
		if (newPathData !== "error") {
			return { path: newPathData.path, time: timestampToDisplay - startTimestamp };
		} else return null;
	});
	while (champPath.find((path) => path === "Recall" || path === "Respawn")) {
		const recallIndex = champPath.findIndex((path) => path === "Recall" || path === "Respawn");
		if (recallIndex === -1) break;
		champPath = champPath.slice(recallIndex + 1);
	}
	return champPath;
}

export function xpToLevel(totalXP: number): number {
	let lvlUps = 0;
	let xpToLvlUp = 280;
	let remainingXp = totalXP;
	while (remainingXp >= xpToLvlUp) {
		remainingXp -= xpToLvlUp;
		xpToLvlUp += 100;
		lvlUps += 1;
	}
	return Math.max(Math.min(lvlUps + 1 + remainingXp / xpToLvlUp, 18), 1);
}

export const findSideLaneInObj = <T>(obj: TeamData<T>, value: T) => {
	for (const side in obj) {
		const parsedSide = side as keyof typeof obj;
		for (const lane in obj[side as keyof typeof obj]) {
			const parsedLane = lane as keyof (typeof obj)[Side];
			if (obj[parsedSide][parsedLane] === value) return { side: parsedSide, lane: parsedLane };
		}
	}
};

export const setGrayscaleFilterKonva = (componentToGray: Konva.Circle | Konva.Image | null, toGray: boolean) => {
	if (componentToGray) {
		componentToGray.cache();
		if (toGray) componentToGray.filters([Konva.Filters.Grayscale]);
		else componentToGray.filters([]);
		componentToGray.getLayer()?.batchDraw();
	}
};

export const isChampInHisBase = (position: Vector2d, side: Side) =>
	distanceBetweenPoints(basesPos[side], position) < 90;

export const positionsToIsInBase = (positions: TeamData<Vector2d>) => {
	let isInBase = initTeamData(false);
	sides.forEach((side) =>
		lanes.forEach((lane) => {
			isInBase[side][lane] = isChampInHisBase(positions[side][lane], side);
		})
	);
	return isInBase;
};

export const initChampionsPositions = () => {
	let initialChamps = initTeamData<Vector2d>({ x: 0, y: 0 });
	// put icons in the right spot
	champsIconsData.forEach(({ pos, side, lane }) => (initialChamps[side][lane] = pos));
	let areChampsInBase = positionsToIsInBase(initialChamps);
	return { positions: initialChamps, inTheirBase: areChampsInBase };
};

export const initTab = (regions?: Region[], wantRegions?: boolean): GlobalTabState => {
	return {
		regions: regions ?? [],
		wantRegions: wantRegions ?? false,
		drawCommandHistory: [],
		drawCommandRedo: [],
		lines: [],
		arrows: [],
		wards: [],
		wantVision: false,
		groups: [],
	};
};

export const initTeamData = <T>(defaultValue: T): TeamData<T> => {
	return {
		blue: {
			top:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			jungle:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			mid:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			bot:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			sup:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
		},
		red: {
			top:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			jungle:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			mid:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			bot:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			sup:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
		},
	};
};

export const initCampsData = <T>(defaultValue: T): CampsData<T> => {
	return {
		blue: {
			Krugs:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			Blue:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			Red:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			Wolfs:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			Gromp:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			Raptors:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			Scuttle:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
		},
		red: {
			Krugs:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			Blue:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			Red:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			Wolfs:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			Gromp:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			Raptors:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
			Scuttle:
				typeof defaultValue === "object"
					? (JSON.parse(JSON.stringify(defaultValue)) as typeof defaultValue)
					: defaultValue,
		},
	};
};

export const pixelsToTime = (pixels: number, ms: number) => {
	return pixelToLeagueUnits(pixels) / ms;
};

const pixelToLeagueUnits = (pixels: number) => {
	return pixels * 11.04;
};

const alreadyPicked = (champ: ChampionObj, pickedChamps: TeamData<null | string>) => {
	for (const side of sides) {
		for (const lane of lanes) {
			if (pickedChamps[side][lane] === champ.key) return true;
		}
	}
	return false;
};

export function secondsToMinutesString(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}m${remainingSeconds}s`;
}

export const randomChamps = (
	championsData: RiotState["championsData"],
	champs?: TeamData<null | string>,
	lockedChamps?: TeamData<boolean>
) => {
	let newChamps = champs === undefined ? initTeamData<null | string>(null) : { ...champs };
	sides.forEach((side) => {
		lanes.forEach((lane) => {
			if (lockedChamps !== undefined && lockedChamps[side][lane]) return;
			let champ: ChampionObj | null = null;
			// Ensure that the champ isn't already picked
			do {
				champ = pickRandomChamp(championsData, lane);
			} while (champ === null || alreadyPicked(champ, newChamps));
			newChamps[side][lane] = champ.key;
		});
	});
	return newChamps;
};

export const pickRandomChamp = (championsData: RiotState["championsData"], lane?: Lane) => {
	if (!championsData) return null;
	const champsCopy = [...Object.values(championsData)];
	let randomChamp: ChampionObj | null = null;

	// Ensure a random champion is picked until one suitable for the role is found
	do {
		const randomIndex = Math.floor(Math.random() * champsCopy.length);
		randomChamp = champsCopy[randomIndex] ?? null;
		if (randomChamp !== null) champsCopy.splice(randomIndex, 1);
	} while (
		champsCopy.length > 0 &&
		(randomChamp === null || (lane !== undefined && !randomChamp.roles.includes(lane)))
	);

	return randomChamp;
};

export const vector2dToLineData = (vectors2d: Vector2d[]): number[] => {
	return vectors2d.reduce((acc, vector) => {
		acc.push(vector.x, vector.y);
		return acc;
	}, [] as number[]);
};

export const addWard = (
	type: WardType,
	pos: Vector2d,
	wards: WardDef[],
	exec: (drawCommandProps: DrawCommandProps) => void
) => {
	exec({
		type: "addWard",
		ward: {
			pos: { x: pos.x, y: pos.y },
			type,
			id: uuidv4(),
		},
		wards,
	});
};

export const getPosInStage = (stage: Stage | null) => {
	if (stage === null) return null;
	const pointerPosition = stage.getPointerPosition();
	const stageScale = stage.scale();
	const stagePos = stage.position();
	if (!pointerPosition || !stageScale) return null;

	return {
		x: (pointerPosition.x - stagePos.x) / stageScale.x,
		y: (pointerPosition.y - stagePos.y) / stageScale.y,
	};
};

export const loadImg = (src: string, callback: (img: HTMLImageElement) => void) => {
	const img = new Image();
	img.src = src;
	img.onload = () => callback(img);
};

export function teamPositionToLane(teamPosition: string): Lane {
	switch (teamPosition) {
		case "TOP":
			return "top";
		case "JUNGLE":
			return "jungle";
		case "MIDDLE":
			return "mid";
		case "BOTTOM":
			return "bot";
		case "UTILITY":
			return "sup";
		default:
			return "top";
	}
}

export function getRoleAndTeam(teamPosition: string, teamId: number) {
	const team = teamId === 100 ? "blue" : "red";
	return { team: team as Side, role: teamPositionToLane(teamPosition) };
}

export function rotate90DegreesCounterClockwiseInBounds(inputPos: Vector2d) {
	const pos = {
		x: (inputPos.x * 1380) / 15000,
		y: (inputPos.y * 1379) / 15000,
	};
	const centerX = (1380 - 0) / 2;
	const centerY = (1379 - 0) / 2;

	// Translate to origin-centered space
	const translatedX = pos.x - centerX;
	const translatedY = pos.y - centerY;

	// Perform the rotation
	const rotatedX = translatedX;
	const rotatedY = -translatedY;

	// Translate back to original space
	const finalX = rotatedX + centerX;
	const finalY = rotatedY + centerY;

	return { x: finalX, y: finalY };
}

function calcTif(time: number) {
	let tif = 0;
	if (time / 60 < 15) return tif;
	if (time / 60 < 30) tif = (Math.ceil(2 * (time / 60 - 15)) * 0.425) / 100;
	else if (time / 60 < 45) tif = (12.75 + Math.ceil(2 * (time / 60 - 30)) * 0.3) / 100;
	else tif = (21.75 + Math.ceil(2 * (time / 60 - 45)) * 1.45) / 100;
	tif = Math.min(tif, 0.5);
	return tif;
}

// https://leagueoflegends.fandom.com/wiki/Death#Death_timer
export function calcRespawnTime(deathTime: number, lvl: number): number {
	const brw = lvl === 7 ? 21 : lvl < 7 ? lvl * 2 + 4 : lvl * 2.5 + 7.5;
	const tif = calcTif(deathTime);
	const respawnTime = brw + brw * tif;
	return respawnTime;
}

export const canBuyItem = (
	itemsData: RiotState["itemsData"],
	itemToBuyData: ItemObj,
	inventoryActions: InventoryAction[],
	currentGolds: number,
	timestampToDisplay: number
): { canBuy: boolean; inventoryActionsToDo: InventoryAction[]; newGolds: number } => {
	if (
		!itemToBuyData.gold.purchasable ||
		!itemToBuyData.maps[11] ||
		itemToBuyData.gold.total === 0 ||
		["3854", "3858", "3862", "1040", "3850", "1103", "1102", "1101", "2140", "2139", "2138", "2421"].includes(
			itemToBuyData.key
		)
	)
		return { canBuy: false, inventoryActionsToDo: [], newGolds: currentGolds };
	let canBuy = true;
	let newInventoryItemsKeys = getActualItems(inventoryActions, timestampToDisplay);
	let newGolds = currentGolds;
	newGolds -= itemToBuyData.gold.total;
	let froms = [...(itemToBuyData.from ?? [])];
	let cancelWhile = false;
	let inventoryActionsToDo: InventoryAction[] = [];
	while (!cancelWhile && froms.length > 0) {
		froms.forEach((fromItemKey) => {
			let inventoryIndex = newInventoryItemsKeys.indexOf(fromItemKey);
			let fromsIndex = froms.indexOf(fromItemKey);
			if (inventoryIndex > -1 && fromsIndex > -1) {
				newInventoryItemsKeys.splice(inventoryIndex, 1);
				froms.splice(fromsIndex, 1);
				const fromItem = itemsData?.[fromItemKey];
				newGolds += fromItem?.gold.total ?? 0;
				inventoryActionsToDo.push({ action: "Destroy", itemKey: fromItemKey, timestamp: timestampToDisplay });
			}
		});
		let newFroms: string[] = [];
		froms.forEach((fromItemKey) => {
			const fromItem = itemsData?.[fromItemKey];
			if (fromItem?.from !== undefined) {
				newFroms = newFroms.concat(fromItem.from);
			}
		});
		if (JSON.stringify(newFroms) === JSON.stringify(froms)) cancelWhile = true;
		froms = newFroms;
	}

	newInventoryItemsKeys.push(itemToBuyData.key);
	inventoryActionsToDo.push({
		action: "Buy",
		itemKey: itemToBuyData.key,
		timestamp: timestampToDisplay,
	});

	// Post Checks
	if (newInventoryItemsKeys.length > 6) canBuy = false;
	if (newGolds < 0) canBuy = false;

	return {
		canBuy,
		inventoryActionsToDo: canBuy ? inventoryActionsToDo : [],
		newGolds: canBuy ? newGolds : currentGolds,
	};
};

export function formatTime(seconds: number) {
	const parsedSeconds = Math.floor(seconds);
	const minutes = Math.floor(parsedSeconds / 60);
	const remainingSeconds = parsedSeconds % 60;
	return `${minutes !== 0 ? `${minutes}m` : ""}${remainingSeconds}s`;
}

interface PreCalculatedPaths {
	[key: string]: PathData;
}

export const getPath = async (pos1: Vector2d, pos2: Vector2d) => {
	// Check if pre-calculated
	const pathKey = getPathKey(
		{ x: Math.floor(pos1.x), y: Math.floor(pos1.y) },
		{ x: Math.floor(pos2.x), y: Math.floor(pos2.y) }
	);
	if (pathKey in preCalculatedPaths) {
		return (preCalculatedPaths as PreCalculatedPaths)[pathKey] as PathData;
	}
	const res = await axios.get(
		`/api/pathfinding?x1=${Math.floor(pos1.x)}&y1=${Math.floor(pos1.y)}&x2=${Math.floor(pos2.x)}&y2=${Math.floor(
			pos2.y
		)}`
	);
	return res.data as PathData;
};

export function capitalizeFirstLetter(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export function csByTime(time: number, lasthit: number = 1) {
	let tempTime = 95;
	let waveRemainBigCS = 3;
	let csRange = 0;
	let csMelee = 0;
	let csCanon = 0;
	let tempGold = 0;
	while (tempTime < time - 30) {
		waveRemainBigCS -= 1;
		if (waveRemainBigCS <= 0) {
			if (tempTime < 15 * 60) {
				tempGold += 60 * lasthit;
				waveRemainBigCS = 3;
			} else if (tempTime < 17.25 * 60) {
				tempGold += 84 * lasthit;
				waveRemainBigCS = 2;
			} else if (tempTime < 25 * 60) {
				tempGold += 90 * lasthit;
				waveRemainBigCS = 2;
			} else {
				tempGold += 90 * lasthit;
				waveRemainBigCS = 1;
			}
			csCanon += 1;
		}
		tempGold += (3 * 21 + 3 * 14) * lasthit;
		csRange += 3;
		csMelee += 3;
		tempTime += 30;
	}
	tempGold += 500;
	if (time > 110) tempGold += (time - 110) * 2;

	let currentXp = csRange * 30 + csMelee * 60 + csCanon * 90;
	let tempLvl = 1;
	let lvlupcost = 280;
	while (currentXp >= lvlupcost && tempLvl < 18) {
		tempLvl += 1;
		currentXp -= lvlupcost;
		lvlupcost += 100;
	}
	const lvl = { solo: tempLvl, duo: tempLvl };
	currentXp = (csRange * 30 + csMelee * 60 + csCanon * 90) * 0.62;
	tempLvl = 1;
	lvlupcost = 280;
	while (currentXp >= lvlupcost && tempLvl < 18) {
		tempLvl += 1;
		currentXp -= lvlupcost;
		lvlupcost += 100;
	}
	lvl.duo = tempLvl;
	let finalLvls = initTeamData(1);
	sides.forEach((side) =>
		lanes.forEach((lane) => {
			const laneType = lane === "bot" || lane === "sup" ? "duo" : "solo";
			const updatedLvl = Math.min(18, Math.max(1, lvl[laneType]));
			finalLvls[side][lane] = updatedLvl;
		})
	);
	return { canon: csCanon, range: csRange, melee: csMelee, gold: tempGold, wave: csMelee / 3 + 1, lvls: finalLvls };
}

export function riotServerToRiotRegion(riotServer: string): RiotRegion | null {
	if (!riotServers.includes(riotServer as RiotServer)) return null;
	return RiotServerLinkRegion[riotServer as RiotServer] as RiotRegion;
}

export function getDaysAgo(unixTimestamp: number): string {
	const oneDay = 24 * 60 * 60;
	const now = dayjs().unix();
	const diffDays = Math.round(Math.abs((unixTimestamp - now) / oneDay));
	return `${diffDays}`;
}

export const displayNumber = (number: number) => {
	const numberString = number.toFixed(0);
	if (numberString.length < 4) return numberString;
	if (numberString.length === 4) return `${numberString[0]}k${numberString[1]}`;
	if (numberString.length === 5) return `${numberString[0]}${numberString[1]}k`;
	if (numberString.length === 6) return `${numberString[0]}${numberString[1]}${numberString[2]}k`;
	if (numberString.length === 7) return `${numberString[0]}M${numberString[1]}`;
	if (numberString.length === 8) return `${numberString[0]}${numberString[1]}M`;
	if (numberString.length === 9) return `${numberString[0]}${numberString[1]}${numberString[2]}M`;
	return numberString;
};

export const displayTime = (seconds: number) => {
	const hours = Math.floor(seconds / 3600);
	return `${hours}h`;
};

export const logTimed = (string: any, isError?: "error") => {
	if (typeof string !== "string" && typeof string !== "number") {
		if (isError === "error") {
			console.error(`[${dayjs().format("DD/MM - HH-mm-ss")}]`);
			console.error(string);
		} else {
			console.log(`[${dayjs().format("DD/MM - HH-mm-ss")}]`);
			console.log(string);
		}
	} else {
		if (isError === "error") console.error(`[${dayjs().format("DD/MM - HH-mm-ss")}] ${string}`);
		else console.log(`[${dayjs().format("DD/MM - HH-mm-ss")}] ${string}`);
	}
};
