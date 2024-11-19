import { Camp, PathData, Side, camps, isCamp } from "./types";

// SHOP

export const champActionsShopTypes = ["Buy", "Sell", "Destroy", "Undo"] as const;
export type ChampActionShopType = (typeof champActionsShopTypes)[number];
export const isChampActionShopType = (str: string): str is ChampActionShopType =>
	champActionsShopTypes.includes(str as ChampActionShopType);

export type ChampActionShop = {
	type: ChampActionShopType;
	travel: null;
	mapSide: null;
	itemKey: string;
};

export function isChampActionShop(action: ChampAction): action is ChampActionShop & { id: string } {
	return isChampActionShopType(action.type);
}

// TELEPORT

export const champActionsTeleportTypes = ["Recall", "Respawn"] as const;
export type ChampActionTeleportType = (typeof champActionsTeleportTypes)[number];
export const isChampActionTeleportType = (str: string): str is ChampActionTeleportType =>
	champActionsTeleportTypes.includes(str as ChampActionTeleportType);

export type ChampActionTeleport = {
	type: ChampActionTeleportType;
	travel: null;
	mapSide: null;
	itemKey: null;
};

export function isChampActionTeleport(action: ChampAction): action is ChampActionTeleport & { id: string } {
	return isChampActionTeleportType(action.type);
}

// FIGHT

export const champActionsFightTypes = ["Fight"] as const;
export type ChampActionFightType = (typeof champActionsFightTypes)[number];
export const isChampActionFightType = (str: string): str is ChampActionFightType =>
	champActionsFightTypes.includes(str as ChampActionFightType);

export type ChampActionFight = {
	type: ChampActionFightType;
	travel: null;
	mapSide: null;
	itemKey: null;
};

export function isChampActionFight(action: ChampAction): action is ChampActionFight & { id: string } {
	return isChampActionFightType(action.type);
}

// TRAVEL

export const champActionsTravelTypes = ["Walk"] as const;
export type ChampActionTravelType = (typeof champActionsTravelTypes)[number];
export const isChampActionTravelType = (str: string): str is ChampActionTravelType =>
	champActionsTravelTypes.includes(str as ChampActionTravelType);

export type ChampActionTravel = {
	travel: PathData;
	type: ChampActionTravelType;
	mapSide: null;
	itemKey: null;
};

export function isChampActionTravel(action: ChampAction): action is ChampActionTravel & { id: string } {
	return isChampActionTravelType(action.type);
}

// WAVE

export const champActionsWaveTypes = ["Push", "Freeze"] as const;
export type ChampActionWaveType = (typeof champActionsWaveTypes)[number];
export const isChampActionWaveType = (str: string): str is ChampActionWaveType =>
	champActionsWaveTypes.includes(str as ChampActionWaveType);

export type ChampActionWave = {
	travel: null | PathData;
	type: ChampActionWaveType;
	mapSide: null;
	itemKey: null;
};

export function isChampActionWave(action: ChampAction): action is ChampActionWave & { id: string } {
	return isChampActionWaveType(action.type);
}

// CAMP

export type ChampActionCamp = {
	type: Camp;
	travel: null;
	mapSide: Side;
	itemKey: null;
};

export function isChampActionCamp(action: ChampAction): action is ChampActionCamp & { id: string } {
	return isCamp(action.type);
}

// MERGED

export const champActionsType = [
	...champActionsShopTypes,
	...champActionsTravelTypes,
	...champActionsTeleportTypes,
	...champActionsWaveTypes,
	...champActionsFightTypes,
	...camps,
] as const;
export type ChampActionType = (typeof champActionsType)[number];
export const isChampActionType = (str: string): str is ChampActionType =>
	champActionsType.includes(str as ChampActionType);

export type ChampActionWithoutId =
	| ChampActionShop
	| ChampActionFight
	| ChampActionTeleport
	| ChampActionTravel
	| ChampActionCamp
	| ChampActionWave;

export type ChampAction = { id: string } & ChampActionWithoutId;

export type ChampActionToDisplay = ChampAction & {
	time: number;
	ms: number;
	goldPostAction: number;
	xpPostAction: number;
	startTimestamp: number;
	started: boolean;
	ended: boolean;
};
