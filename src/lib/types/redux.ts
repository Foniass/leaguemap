import { Vector2d } from "konva/lib/types";
import {
	Binds,
	ButtonFunctionnality,
	CampsData,
	ChampActionsFilter,
	DrawCommandProps,
	DrawMode,
	FolderStructureItem,
	InventoryActionType,
	Lane,
	LaneType,
	LineType,
	MapTab,
	Region,
	RiotServer,
	Side,
	SidebarTab,
	TeamData,
	TurretEvent,
	TurretsAlive,
	WardDef,
	WaveRegion,
} from "./types";
import { ChampAction, ChampActionToDisplay } from "./actions";
import { MatchDto, MatchTimelineDto } from "../riotApi/endpoints/matchv5";
import { FolderDb } from "../db/folders/collection";

export interface GameState {
	timestampToDisplay: number;
	showWaves: Record<LaneType, boolean>;
	wavesRegions: Record<LaneType, WaveRegion>;
	turretsEvents: TurretEvent[];
	turretsAlive: TurretsAlive;

	champs: {
		lvls: TeamData<number>;
		positions: TeamData<Vector2d>;
		ids: TeamData<string | null>;
		deathsData: TeamData<{ timestamp: number; respawnTime: number }[]>;
		respawnsTimes: TeamData<number>;
		golds: TeamData<number>;
		movementSpeeds: TeamData<number>;
		inTheirBase: TeamData<boolean>;
		inventoriesActions: TeamData<InventoryAction[]>;

		locked: TeamData<boolean>;
		lasthit: TeamData<number>;
		kills: TeamData<number>;
		assists: TeamData<number>;
	};
}

export interface ReviewState {
	timestampToDisplay: number;
	wavesRegions: Record<LaneType, WaveRegion>;
	turretsEvents: TurretEvent[];
	turretsAlive: TurretsAlive;

	matchDto: MatchDto | null;
	matchTimelineDto: MatchTimelineDto | null;

	champs: {
		lvls: TeamData<number>;
		positions: TeamData<Vector2d>;
		ids: TeamData<string | null>;
		deathsData: TeamData<{ timestamp: number; respawnTime: number }[]>;
		respawnsTimes: TeamData<number>;
		golds: TeamData<number>;
		movementSpeeds: TeamData<number>;
		inTheirBase: TeamData<boolean>;
		inventoriesActions: TeamData<InventoryAction[]>;

		participantsIds: TeamData<number | null>;
		puuids: TeamData<string | null>;
	};

	history: {
		selectedServer: RiotServer;
		summonerName: string;
		error: string;
		isLoading: boolean;
		puuid: string;
		gamesIds: null | string[];
		gamesData: MatchDto[];
		gameIndex: number;
	};
}

export interface SimulationState {
	timestampToDisplay: number;
	wavesRegions: Record<LaneType, WaveRegion>;
	turretsEvents: TurretEvent[];
	turretsAlive: TurretsAlive;

	isRequestingPathAPI: boolean;
	campsKilledTimestamps: CampsData<number[]>;
	forcedModifs: { id: string; time: number }[];

	champThatCanDoActions: { side: Side; lane: Lane } | null;

	champs: {
		lvls: TeamData<number>;
		positions: TeamData<Vector2d>;
		ids: TeamData<string | null>;
		deathsData: TeamData<{ timestamp: number; respawnTime: number }[]>;
		respawnsTimes: TeamData<number>;
		golds: TeamData<number>;
		movementSpeeds: TeamData<number>;
		inTheirBase: TeamData<boolean>;
		inventoriesActions: TeamData<InventoryAction[]>;

		locked: TeamData<boolean>;
		actions: TeamData<ChampAction[]>;
		actionsToDisplay: TeamData<ChampActionToDisplay[]>;
	};
}

export interface GlobalState extends GlobalTabsStates {
	id: string;
	lastClickedButton: ButtonFunctionnality;
	mapTab: MapTab;
	drawMode: DrawMode;
	lineColorIndex: number;
	sidebarTab: SidebarTab;
	lastChampIconSelected: { side: Side; lane: Lane };
	champIconSelected: null | {
		side: Side;
		lane: Lane;
	};
	champsActionsFilter: Record<Side, ChampActionsFilter | null>;
}

export type GlobalTabsStates = Record<MapTab, GlobalTabState>;

export interface GlobalTabState {
	lines: LineType[];
	arrows: LineType[];
	regions: Region[];
	wards: WardDef[];
	wantRegions: boolean;
	wantVision: boolean;
	groups: { side: Side; lane: Lane }[][];
	drawCommandHistory: DrawCommandProps[];
	drawCommandRedo: DrawCommandProps[];
}

export type InventoryAction = { timestamp: number; itemKey: string; action: InventoryActionType };

export interface PopupState {
	message: string;
	visible: boolean;
	type: PopupType;
}

export type PopupType = "error" | "success" | "info";

export interface UserState {
	binds: Binds;
	folderStructure: FolderStructureItem[];
	loadedFolder: FolderDb | null;
}

export interface RiotState {
	version: string;
	championsData: undefined | Record<string, ChampionObj>;
	itemsData: undefined | Record<string, ItemObj>;
}

export type ChampionObj = {
	name: string;
	key: string;
	id: string;
	roles: Lane[];
	stats: { movespeed: number };
	image: {
		sprite: string;
		x: number;
		y: number;
		w: number;
		h: number;
	};
};

export type ItemObj = {
	name: string;
	key: string;
	from?: string[];
	stats: { FlatMovementSpeedMod: number };
	gold: { purchasable: boolean; total: number; sell: number };
	maps: { 11: boolean };
};
