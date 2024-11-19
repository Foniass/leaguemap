import { v4 } from "uuid";
import { GameState, GlobalState, PopupState, ReviewState, RiotState, SimulationState, UserState } from "../types/redux";
import { Binds, riotServers } from "../types/types";
import { initCampsData, initChampionsPositions, initTab, initTeamData } from "../utils";
import { defaultTurretsAlive } from "./values";

export const defaultChampsPositions = initChampionsPositions();

export const defaultBinds: Binds = {
	cursor: null,
	select: null,
	pencil: null,
	ward: null,
	vision: null,
	region: null,
	reset: null,
	recall: "b",
};

export const defaultUserState: UserState = {
	binds: defaultBinds,
	folderStructure: [],
	loadedFolder: null,
};

export const defaultRiotState: RiotState = {
	version: "",
	championsData: undefined,
	itemsData: undefined,
};

export const defaultPopupState: PopupState = { message: "", visible: false, type: "info" };

export const defaultGlobalState: GlobalState = {
	id: v4(),
	lastClickedButton: "cursor/modify",
	mapTab: "Game",
	sidebarTab: "Champions",
	drawMode: "line",
	lineColorIndex: 0,
	lastChampIconSelected: { side: "blue", lane: "jungle" },
	champIconSelected: null,
	champsActionsFilter: { blue: "Camp", red: "Camp" },
	Game: initTab(),
	Review: initTab(),
	Simulation: initTab(),
};

export const defaultGameState: GameState = {
	timestampToDisplay: 0,

	showWaves: {
		BOT_LANE: true,
		MID_LANE: true,
		TOP_LANE: true,
	},
	wavesRegions: {
		TOP_LANE: "r2",
		MID_LANE: "r2",
		BOT_LANE: "r2",
	},
	turretsAlive: defaultTurretsAlive,
	turretsEvents: [],

	champs: {
		lvls: initTeamData(1),
		positions: defaultChampsPositions.positions,
		ids: initTeamData(null),
		deathsData: initTeamData([]),
		respawnsTimes: initTeamData(0),
		golds: initTeamData(0),
		inTheirBase: defaultChampsPositions.inTheirBase,
		movementSpeeds: initTeamData(345),
		inventoriesActions: initTeamData([]),

		locked: initTeamData(false),
		lasthit: {
			blue: {
				top: 0.8,
				jungle: 0.6,
				mid: 0.8,
				bot: 0.8,
				sup: 0.2,
			},
			red: {
				top: 0.8,
				jungle: 0.6,
				mid: 0.8,
				bot: 0.8,
				sup: 0.2,
			},
		},
		kills: initTeamData(0),
		assists: initTeamData(0),
	},
};

export const defaultReviewState: ReviewState = {
	timestampToDisplay: 0,
	wavesRegions: {
		TOP_LANE: "r2",
		MID_LANE: "r2",
		BOT_LANE: "r2",
	},
	turretsAlive: defaultTurretsAlive,
	turretsEvents: [],

	matchDto: null,
	matchTimelineDto: null,

	champs: {
		lvls: initTeamData(1),
		positions: defaultChampsPositions.positions,
		ids: initTeamData(null),
		deathsData: initTeamData([]),
		respawnsTimes: initTeamData(0),
		golds: initTeamData(0),
		inTheirBase: defaultChampsPositions.inTheirBase,
		movementSpeeds: initTeamData(345),
		inventoriesActions: initTeamData([]),

		puuids: initTeamData(null),
		participantsIds: initTeamData(null),
	},
	history: {
		selectedServer: riotServers[0],
		summonerName: "",
		error: "",
		isLoading: false,
		puuid: "",
		gamesIds: null,
		gamesData: [],
		gameIndex: 0,
	},
};

export const defaultSimulationState: SimulationState = {
	timestampToDisplay: 90,
	wavesRegions: {
		TOP_LANE: "r2",
		MID_LANE: "r2",
		BOT_LANE: "r2",
	},
	turretsAlive: defaultTurretsAlive,
	turretsEvents: [],

	champThatCanDoActions: null,

	champs: {
		lvls: initTeamData(1),
		positions: defaultChampsPositions.positions,
		ids: initTeamData(null),
		deathsData: initTeamData([]),
		respawnsTimes: initTeamData(0),
		golds: initTeamData(0),
		inTheirBase: defaultChampsPositions.inTheirBase,
		movementSpeeds: initTeamData(345),
		inventoriesActions: initTeamData([]),

		locked: initTeamData(false),
		actions: initTeamData([]),
		actionsToDisplay: initTeamData([]),
	},

	isRequestingPathAPI: false,
	campsKilledTimestamps: initCampsData([]),
	forcedModifs: [],
};
