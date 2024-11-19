import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CampsData, Lane, Side, TeamData, TurretsAlive, lanesType } from "../../types/types";
import {
	getChampMovementSpeed,
	getChampsMovementSpeeds,
	getWaveRegion,
	isChampInHisBase,
	positionsToIsInBase,
} from "../../utils";
import { Vector2d } from "konva/lib/types";
import { InventoryAction, RiotState, SimulationState } from "@/src/lib/types/redux";
import { ChampAction, ChampActionToDisplay, ChampActionWithoutId } from "@/src/lib/types/actions";
import { v4 } from "uuid";
import { defaultSimulationState } from "@/src/lib/values/initReduxValues";

const simulationSlice = createSlice({
	name: "Simulation",
	initialState: defaultSimulationState,
	reducers: {
		resetSimulation: () => {
			return defaultSimulationState;
		},
		resetSimulationSoft: (state) => {
			state.champs.actions = defaultSimulationState.champs.actions;
			state.champThatCanDoActions = defaultSimulationState.champThatCanDoActions;
		},
		loadSimulationSave: (state, action: PayloadAction<SimulationState>) => {
			return action.payload;
		},
		setSimulationIsRequestingPathAPI: (state, action: PayloadAction<boolean>) => {
			state.isRequestingPathAPI = action.payload;
		},
		setSimulationTimestampToDisplay: (state, action: PayloadAction<number>) => {
			state.timestampToDisplay = action.payload;
		},
		setSimulationChampsActions: (state, action: PayloadAction<TeamData<ChampAction[]>>) => {
			state.champs.actions = action.payload;
		},
		setSimulationChampActions: (state, action: PayloadAction<{ side: Side; lane: Lane; actions: ChampAction[] }>) => {
			const { side, lane, actions } = action.payload;
			state.champs.actions[side][lane] = actions;
		},
		setSimulationChampsActionsToDisplay: (state, action: PayloadAction<TeamData<ChampActionToDisplay[]>>) => {
			state.champs.actionsToDisplay = action.payload;
		},
		pushSimulationChampAction: (
			state,
			action: PayloadAction<{ side: Side; lane: Lane; action: ChampActionWithoutId }>
		) => {
			let { side, lane, action: actionToPush } = action.payload;
			if (!state.champThatCanDoActions) state.champThatCanDoActions = { side, lane };
			state.champs.actions[side][lane].push({ ...actionToPush, id: v4() });
		},
		pushSimulationForcedModif: (state, action: PayloadAction<{ id: string; time: number }>) => {
			const index = state.forcedModifs.findIndex(({ id }) => id === action.payload.id);
			if (index !== -1) (state.forcedModifs[index] as { id: string; time: number }).time = action.payload.time;
			else state.forcedModifs.push(action.payload);
		},
		setSimulationCampsKilledTimestamps: (state, action: PayloadAction<CampsData<number[]>>) => {
			state.campsKilledTimestamps = action.payload;
		},
		setSimulationChampsInventoriesActions: (state, action: PayloadAction<TeamData<InventoryAction[]>>) => {
			state.champs.inventoriesActions = action.payload;
		},
		delSimulationForcedModifById: (state, action: PayloadAction<string>) => {
			const idToDelete = action.payload;
			state.forcedModifs = state.forcedModifs.filter(({ id }) => id !== idToDelete);
		},
		setSimulationChampsGolds: (state, action: PayloadAction<TeamData<number>>) => {
			state.champs.golds = action.payload;
		},
		setSimulationChampsLvls: (state, action: PayloadAction<TeamData<number>>) => {
			state.champs.lvls = action.payload;
		},
		setSimulationChampsPositions: (state, action: PayloadAction<TeamData<Vector2d>>) => {
			state.champs.positions = action.payload;
			state.champs.inTheirBase = positionsToIsInBase(action.payload);
		},
		setSimulationChampPosition: (state, action: PayloadAction<{ side: Side; lane: Lane; position: Vector2d }>) => {
			const { side, lane, position } = action.payload;
			state.champs.positions[side][lane] = position;
			state.champs.inTheirBase[side][lane] = isChampInHisBase(position, side);
		},
		setSimulationRespawnsTimes: (state, action: PayloadAction<TeamData<number>>) => {
			state.champs.respawnsTimes = action.payload;
		},
		setSimulationChampLocked: (state, action: PayloadAction<{ side: Side; lane: Lane; locked: boolean }>) => {
			const { side, lane, locked } = action.payload;
			state.champs.locked[side][lane] = locked;
		},
		setSimulationChampsIds: (
			state,
			action: PayloadAction<{ champsIds: TeamData<string | null>; championsData: RiotState["championsData"] }>
		) => {
			const { champsIds, championsData } = action.payload;
			state.champs.ids = champsIds;
			state.champs.movementSpeeds = getChampsMovementSpeeds(championsData, champsIds);
		},
		setSimulationChampId: (
			state,
			action: PayloadAction<{ lane: Lane; side: Side; id: string | null; championsData: RiotState["championsData"] }>
		) => {
			const { lane, side, id, championsData } = action.payload;
			state.champs.ids[side][lane] = id;
			state.champs.movementSpeeds[side][lane] = getChampMovementSpeed(championsData, id);
		},
		pushSimulationChampActions: (
			state,
			action: PayloadAction<{ side: Side; lane: Lane; actions: ChampActionWithoutId[] }>
		) => {
			let { side, lane, actions: actionsToPush } = action.payload;
			state.champs.actions[side][lane] = state.champs.actions[side][lane].concat(
				actionsToPush.map((action) => ({ ...action, id: v4() }))
			);
		},
		setSimulationTurretsAlive: (state, action: PayloadAction<TurretsAlive>) => {
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
		setSimulationChampThatCanDoActions: (state, action: PayloadAction<{ side: Side; lane: Lane } | null>) => {
			state.champThatCanDoActions = action.payload;
		},
	},
});

export const {
	resetSimulationSoft,
	delSimulationForcedModifById,
	setSimulationChampThatCanDoActions,
	setSimulationTurretsAlive,
	loadSimulationSave,
	pushSimulationChampActions,
	setSimulationChampActions,
	setSimulationChampId,
	setSimulationChampsIds,
	setSimulationChampLocked,
	setSimulationRespawnsTimes,
	setSimulationChampPosition,
	setSimulationChampsPositions,
	setSimulationChampsLvls,
	setSimulationChampsGolds,
	pushSimulationForcedModif,
	pushSimulationChampAction,
	resetSimulation,
	setSimulationCampsKilledTimestamps,
	setSimulationChampsActions,
	setSimulationChampsActionsToDisplay,
	setSimulationChampsInventoriesActions,
	setSimulationIsRequestingPathAPI,
	setSimulationTimestampToDisplay,
} = simulationSlice.actions;

export default simulationSlice.reducer;
