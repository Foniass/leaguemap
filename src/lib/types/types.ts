import {
	DrawLineCommand,
	AddWardCommand,
	RemoveLineCommand,
	RemoveWardCommand,
	ResetDrawingCommand,
	DrawArrowCommand,
	RemoveArrowCommand,
	WantRegionsCommand,
	AddRegionCommand,
	RemoveRegionCommand,
	WantVisionCommand,
} from "@/src/lib/drawClass";
import { Vector2d } from "konva/lib/types";

export type TurretsData<T> = Record<100 | 200, Record<LaneType, Record<TowerType | "INHIBITOR_BUILDING", T>>>;

export type TurretsAlive = TurretsData<{ usingPlates: boolean; value: number }>;
export type TurretsPos = TurretsData<Vector2d>;

export type TurretEvent = {
	killerId?: number;
	laneType: LaneType;
	teamId: TeamId;
	timestamp: number;
	type: TurretEventType;
	buildingType: BuildingType;
};

export type TeamData<T> = Record<Side, Record<Lane, T>>;
export type CampsData<T> = Record<Side, Record<Camp, T>>;

export type PathData = { path: Vector2d[]; distance: number; start: Vector2d; end: Vector2d };

export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[]
		? DeepPartial<U>[]
		: T[P] extends ReadonlyArray<infer U>
		? ReadonlyArray<DeepPartial<U>>
		: DeepPartial<T[P]>;
};

export type Binds = Record<BindKey, string | null>;

export interface MapItem {
	id: string;
	name: string | null;
	type: "map";
}

export function isMapItem(folderStructureItem: FolderStructureItem): folderStructureItem is MapItem {
	return folderStructureItem.type === "map";
}

export interface FolderItem {
	id: string;
	name: string | null;
	type: "folder";
	children: FolderStructureItem[];
	isOpen: boolean;
}

export function isFolderItem(folderStructureItem: FolderStructureItem): folderStructureItem is FolderItem {
	return folderStructureItem.type === "folder";
}

export type FolderStructureItem = FolderItem | MapItem;

export type WardDef = {
	pos: {
		x: number;
		y: number;
	};
	type: WardType;
	id: string;
};

export type LineType = {
	id: string;
	points: number[];
	color: LineColor;
	end: boolean;
};

export type DrawLineCommandProps = { type: "drawLine"; line: LineType; lines: LineType[] };
export type RemoveLineCommandProps = { type: "removeLine"; line: LineType; lines: LineType[] };
export type DrawArrowCommandProps = { type: "drawArrow"; arrow: LineType; arrows: LineType[] };
export type RemoveArrowCommandProps = { type: "removeArrow"; arrow: LineType; arrows: LineType[] };
export type AddWardCommandProps = { type: "addWard"; ward: WardDef; wards: WardDef[] };
export type RemoveWardCommandProps = { type: "removeWard"; ward: WardDef; wards: WardDef[] };
export type ResetDrawingCommandProps = {
	type: "resetDrawing";
	lines: LineType[];
	arrows: LineType[];
	wards: WardDef[];
};
export type WantRegionsCommandProps = { type: "wantRegions"; wantRegions: boolean };
export type AddRegionCommandProps = { type: "addRegion"; region: Region; regions: Region[] };
export type RemoveRegionCommandProps = { type: "removeRegion"; region: Region; regions: Region[] };
export type WantVisionCommandProps = { type: "wantVision"; wantVision: boolean };

export type DrawCommandProps =
	| DrawLineCommandProps
	| RemoveLineCommandProps
	| DrawArrowCommandProps
	| RemoveArrowCommandProps
	| AddWardCommandProps
	| RemoveWardCommandProps
	| ResetDrawingCommandProps
	| WantRegionsCommandProps
	| AddRegionCommandProps
	| RemoveRegionCommandProps
	| WantVisionCommandProps;

export type DrawCommand =
	| DrawLineCommand
	| RemoveLineCommand
	| DrawArrowCommand
	| RemoveArrowCommand
	| AddWardCommand
	| RemoveWardCommand
	| ResetDrawingCommand
	| WantRegionsCommand
	| AddRegionCommand
	| RemoveRegionCommand
	| WantVisionCommand;

// CUSTOM STRINGS / NUMBERS

export const lanes = ["top", "jungle", "mid", "bot", "sup"] as const;
export type Lane = (typeof lanes)[number];
export const isLane = (str: string): str is Lane => lanes.includes(str as Lane);

export const regionsNumber = ["R1", "R2", "R3"] as const;
export type RegionNumber = (typeof regionsNumber)[number];
export const isRegionNumber = (str: string): str is RegionNumber => regionsNumber.includes(str as RegionNumber);

// Temp fix don't includes lane3 and proxy3
export const regionsLane = ["lane1", "lane2", "proxy1", "proxy2"] as const;
export type RegionLane = (typeof regionsLane)[number];
export const isRegionLane = (str: string): str is RegionLane => regionsLane.includes(str as RegionLane);

export const camps = ["Krugs", "Blue", "Red", "Wolfs", "Gromp", "Raptors", "Scuttle"] as const;
export type Camp = (typeof camps)[number];
export const isCamp = (str: string): str is Camp => camps.includes(str as Camp);

export const riotServers = [
	"euw1",
	"na1",
	"kr",
	"eun1",
	"br1",
	"tr1",
	"la1",
	"la2",
	"ru",
	"oc1",
	"jp1",
	"ph2",
	"sg2",
	"tw2",
	"th2",
	"vn2",
] as const;
export type RiotServer = (typeof riotServers)[number];
export const isRiotServer = (str: string): str is RiotServer => riotServers.includes(str as RiotServer);

export const riotRegions = ["americas", "europe", "asia", "sea"] as const;
export type RiotRegion = (typeof riotRegions)[number];
export const isRiotRegion = (str: string): str is RiotRegion => riotRegions.includes(str as RiotRegion);

export const buttonsFunctionnality = ["draw/eraser", "cursor/modify", "ward", "select"] as const;
export type ButtonFunctionnality = (typeof buttonsFunctionnality)[number];
export const isButtonFunctionnality = (str: string): str is ButtonFunctionnality =>
	buttonsFunctionnality.includes(str as ButtonFunctionnality);

export const playersId = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export type PlayerId = (typeof playersId)[number];
export const isPlayerId = (num: number): num is PlayerId => playersId.includes(num as PlayerId);

export const teamsId = [100, 200] as const;
export type TeamId = (typeof teamsId)[number];
export const isTeamId = (num: number): num is TeamId => teamsId.includes(num as TeamId);

export const lanesType = ["TOP_LANE", "MID_LANE", "BOT_LANE"] as const;
export type LaneType = (typeof lanesType)[number];
export const isLaneType = (str: string): str is LaneType => lanesType.includes(str as LaneType);

export const towersType = ["OUTER_TURRET", "INNER_TURRET", "BASE_TURRET", "NEXUS_TURRET"] as const;
export type TowerType = (typeof towersType)[number];
export const isTowerType = (str: string): str is TowerType => towersType.includes(str as TowerType);

export const buildingsType = [...towersType, "INHIBITOR_BUILDING"] as const;
export type BuildingType = (typeof buildingsType)[number];
export const isBuildingType = (str: string): str is BuildingType => buildingsType.includes(str as BuildingType);

export const mapTabs = ["Game", "Review", "Simulation"] as const;
export type MapTab = (typeof mapTabs)[number];
export const isMapTab = (str: string): str is MapTab => mapTabs.includes(str as MapTab);

export const waveRegions = ["r1", "r2", "r3", "r1b", "r3b"] as const;
export type WaveRegion = (typeof waveRegions)[number];
export const isWaveRegion = (str: string): str is WaveRegion => waveRegions.includes(str as WaveRegion);

export const bindsKey = ["cursor", "pencil", "ward", "vision", "region", "reset", "recall", "select"] as const;
export type BindKey = (typeof bindsKey)[number];
export const isBindKey = (str: string): str is BindKey => bindsKey.includes(str as BindKey);

export const sidebarTabs = ["Champions", "MatchUp", "Historique", "Replay"] as const;
export type SidebarTab = (typeof sidebarTabs)[number];
export const isSidebarTab = (str: string): str is SidebarTab => sidebarTabs.includes(str as SidebarTab);

export const drawModes = ["line", "arrow"] as const;
export type DrawMode = (typeof drawModes)[number];
export const isDrawMode = (str: string): str is DrawMode => drawModes.includes(str as DrawMode);

export const linesColors = ["#ffffff", "#000000", "#176ce3", "#e31717"] as const;
export type LineColor = (typeof linesColors)[number];
export const isLineColor = (str: string): str is LineColor => linesColors.includes(str as LineColor);

export const wardTypes = ["yellow", "pink"] as const;
export type WardType = (typeof wardTypes)[number];
export const isWardType = (str: string): str is WardType => wardTypes.includes(str as WardType);

export const regions = ["laningphase", "jungle", "river", "proxy"] as const;
export type Region = (typeof regions)[number];
export const isRegion = (str: string): str is Region => regions.includes(str as Region);

export const sides = ["blue", "red"] as const;
export type Side = (typeof sides)[number];
export const isSide = (str: string): str is Side => sides.includes(str as Side);

export const champActionsFilters = ["Camp", "Travel", "Shop"] as const;
export type ChampActionsFilter = (typeof champActionsFilters)[number];
export const isChampActionsFilter = (str: string): str is ChampActionsFilter =>
	champActionsFilters.includes(str as ChampActionsFilter);

export const lowTiers = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND"] as const;
export type LowTier = (typeof lowTiers)[number];
export const isLowTier = (str: string): str is LowTier => lowTiers.includes(str as LowTier);

export const tiers = [...lowTiers, "MASTER", "GRANDMASTER", "CHALLENGER"] as const;
export type Tier = (typeof tiers)[number];
export const isTier = (str: string): str is Tier => tiers.includes(str as Tier);

export const queues = ["RANKED_SOLO_5x5", "RANKED_FLEX_SR", "RANKED_FLEX_TT"] as const;
export type Queue = (typeof queues)[number];
export const isQueue = (str: string): str is Queue => queues.includes(str as Queue);

export const divisions = ["I", "II", "III", "IV"] as const;
export type Division = (typeof divisions)[number];
export const isDivision = (str: string): str is Division => divisions.includes(str as Division);

export const riotItemEvents = ["ITEM_PURCHASED", "ITEM_SOLD", "ITEM_DESTROYED", "ITEM_UNDO"] as const;
export type RiotItemEvent = (typeof riotItemEvents)[number];
export const isRiotItemEvent = (str: string): str is RiotItemEvent => riotItemEvents.includes(str as RiotItemEvent);

export const inventoriesActionsTypes = ["Buy", "Sell", "Undo", "Destroy"] as const;
export type InventoryActionType = (typeof inventoriesActionsTypes)[number];
export const isInventoryActionType = (str: string): str is InventoryActionType =>
	inventoriesActionsTypes.includes(str as InventoryActionType);

export const turretsEventsTypes = ["TURRET_PLATE_DESTROYED", "BUILDING_KILL"] as const;
export type TurretEventType = (typeof turretsEventsTypes)[number];
export const isTurretEventType = (str: string): str is TurretEventType =>
	turretsEventsTypes.includes(str as TurretEventType);

export const campsLvls = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] as const;
export type CampLvl = (typeof campsLvls)[number];
export const isCampLvl = (num: number): num is CampLvl => campsLvls.includes(num as CampLvl);
