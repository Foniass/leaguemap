import { defaultGameState } from "@/src/lib/values/initReduxValues";
import { GameState, InventoryAction, RiotState } from "@/src/lib/types/redux";
import {
	BuildingType,
	Lane,
	LaneType,
	Side,
	TeamData,
	TeamId,
	TurretEvent,
	TurretsAlive,
	WaveRegion,
	lanesType,
} from "@/src/lib/types/types";
import {
	csByTime,
	getChampMovementSpeed,
	getChampsMovementSpeeds,
	getWaveRegion,
	isChampInHisBase,
	positionsToIsInBase,
} from "@/src/lib/utils";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Vector2d } from "konva/lib/types";

const gameSlice = createSlice({
	name: "Game",
	initialState: defaultGameState,
	reducers: {
		resetGame: () => {
			return defaultGameState;
		},
		loadGameSave: (state, action: PayloadAction<GameState>) => {
			return action.payload;
		},
		setGameChampKills: (state, action: PayloadAction<{ lane: Lane; side: Side; diff: number }>) => {
			const { lane, side, diff } = action.payload;
			const newKills = Math.floor(Math.max(0, state.champs.kills[side][lane] + diff));
			state.champs.kills[side][lane] = newKills;
		},
		setGameChampAssists: (state, action: PayloadAction<{ lane: Lane; side: Side; diff: number }>) => {
			const { lane, side, diff } = action.payload;
			const newAssists = Math.floor(Math.max(0, state.champs.assists[side][lane] + diff));
			state.champs.assists[side][lane] = newAssists;
		},
		setGameChampsGolds: (state, action: PayloadAction<TeamData<number>>) => {
			state.champs.golds = action.payload;
		},
		setGameChampPosition: (state, action: PayloadAction<{ lane: Lane; side: Side; position: Vector2d }>) => {
			const { lane, side, position } = action.payload;
			state.champs.positions[side][lane] = position;
			state.champs.inTheirBase[side][lane] = isChampInHisBase(position, side);
		},
		setGameChampsPositions: (state, action: PayloadAction<TeamData<Vector2d>>) => {
			state.champs.positions = action.payload;
			state.champs.inTheirBase = positionsToIsInBase(action.payload);
		},
		setGameRespawnsTimes: (state, action: PayloadAction<TeamData<number>>) => {
			state.champs.respawnsTimes = action.payload;
		},
		setGameChampLocked: (state, action: PayloadAction<{ lane: Lane; side: Side; locked: boolean }>) => {
			const { lane, side, locked } = action.payload;
			state.champs.locked[side][lane] = locked;
		},
		setGameTimestampToDisplay: (state, action: PayloadAction<number>) => {
			state.timestampToDisplay = action.payload;
			const { lvls } = csByTime(action.payload);
			state.champs.lvls = lvls;
		},
		setGameChampsIds: (
			state,
			action: PayloadAction<{ championsData: RiotState["championsData"]; champsIds: TeamData<string | null> }>
		) => {
			const { championsData, champsIds } = action.payload;
			state.champs.ids = champsIds;
			state.champs.movementSpeeds = getChampsMovementSpeeds(championsData, champsIds);
		},
		setGameWavesRegions: (state, action: PayloadAction<Record<LaneType, WaveRegion>>) => {
			state.wavesRegions = action.payload;
		},
		setGameDeathsData: (state, action: PayloadAction<TeamData<{ timestamp: number; respawnTime: number }[]>>) => {
			state.champs.deathsData = action.payload;
		},
		setGameChampId: (
			state,
			action: PayloadAction<{ championsData: RiotState["championsData"]; lane: Lane; side: Side; id: string | null }>
		) => {
			const { lane, side, id, championsData } = action.payload;
			state.champs.ids[side][lane] = id;
			state.champs.movementSpeeds[side][lane] = getChampMovementSpeed(championsData, id);
		},
		setGameChampLasthit: (state, action: PayloadAction<{ side: Side; lane: Lane; lasthit: number }>) => {
			const { side, lane, lasthit } = action.payload;
			state.champs.lasthit[side][lane] = lasthit;
		},
		setGameChampsInventoriesActions: (state, action: PayloadAction<TeamData<InventoryAction[]>>) => {
			state.champs.inventoriesActions = action.payload;
		},
		pushGameChampInventoryAction: (
			state,
			action: PayloadAction<{ side: Side; lane: Lane; action: InventoryAction }>
		) => {
			const { side, lane, action: newAction } = action.payload;
			state.champs.inventoriesActions[side][lane].push(newAction);
		},
		setGameWaveRegion: (state, action: PayloadAction<{ laneType: LaneType; newWaveRegionIndex: 1 | 2 | 3 }>) => {
			const { laneType, newWaveRegionIndex } = action.payload;
			state.wavesRegions[laneType] = getWaveRegion(state.turretsAlive, laneType, newWaveRegionIndex);
		},
		setGameTurretsAlive: (state, action: PayloadAction<TurretsAlive>) => {
			state.turretsAlive = action.payload;

			// Update WaveRegions
			lanesType.forEach((laneType) => {
				const waveRegionIndex = parseInt(state.wavesRegions[laneType][1] ?? "");
				if ([3, 1, 2].includes(waveRegionIndex)) {
					const newWaveRegion = getWaveRegion(action.payload, laneType, waveRegionIndex as 1 | 2 | 3);
					state.wavesRegions[laneType] = newWaveRegion;
				}
			});
		},
		pushGameTurretEvent: (state, action: PayloadAction<TurretEvent>) => {
			state.turretsEvents.push(action.payload);
		},
		setGameTurretsEvents: (state, action: PayloadAction<TurretEvent[]>) => {
			state.turretsEvents = action.payload;
		},
		resetGameTurretEvents: (
			state,
			action: PayloadAction<{ laneType: LaneType; teamId: TeamId; buildingType: BuildingType }>
		) => {
			const { buildingType, laneType, teamId } = action.payload;
			state.turretsEvents = state.turretsEvents.filter(
				(turretEvent) =>
					turretEvent.buildingType !== buildingType ||
					turretEvent.laneType !== laneType ||
					turretEvent.teamId !== teamId
			);
		},
		setGameShowLaneWave: (state, action: PayloadAction<{ laneType: LaneType; boolean: boolean }>) => {
			state.showWaves[action.payload.laneType] = action.payload.boolean;
		},
	},
});

export const {
	setGameChampLasthit,
	setGameShowLaneWave,
	resetGameTurretEvents,
	setGameTurretsEvents,
	resetGame,
	loadGameSave,
	pushGameChampInventoryAction,
	setGameChampsInventoriesActions,
	setGameChampId,
	setGameDeathsData,
	setGameWavesRegions,
	setGameChampsIds,
	setGameTimestampToDisplay,
	setGameChampLocked,
	setGameRespawnsTimes,
	setGameChampPosition,
	setGameChampsPositions,
	setGameWaveRegion,
	setGameChampAssists,
	setGameChampKills,
	setGameChampsGolds,
	pushGameTurretEvent,
	setGameTurretsAlive,
} = gameSlice.actions;

export default gameSlice.reducer;
