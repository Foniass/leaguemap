import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Lane, RiotServer, Side, TeamData, TurretEvent, TurretsAlive, lanesType } from "../../types/types";
import { InventoryAction, ReviewState, RiotState } from "@/src/lib/types/redux";
import { MatchDto, MatchTimelineDto } from "@/src/lib/riotApi/endpoints/matchv5";
import {
	getChampsMovementSpeeds,
	getWaveRegion,
	isChampInHisBase,
	positionsToIsInBase,
	processMatchDto,
	processMatchTimelineDto,
} from "@/src/lib/utils";
import { Vector2d } from "konva/lib/types";
import { defaultReviewState } from "@/src/lib/values/initReduxValues";

const reviewSlice = createSlice({
	name: "Review",
	initialState: defaultReviewState,
	reducers: {
		resetReview: () => {
			return defaultReviewState;
		},
		loadReviewSave: (state, action: PayloadAction<ReviewState>) => {
			return action.payload;
		},
		setReviewRiotData: (
			state,
			action: PayloadAction<null | {
				championsData: RiotState["championsData"];
				matchDto: MatchDto;
				matchTimelineDto: MatchTimelineDto;
			}>
		) => {
			let newState = JSON.parse(JSON.stringify({ ...defaultReviewState, history: state.history })) as ReviewState;
			if (action.payload !== null) {
				const { matchDto, matchTimelineDto, championsData } = action.payload;
				const { champsIds, participantsIds, puuids } = processMatchDto(matchDto);
				const { deathsData } = processMatchTimelineDto(matchTimelineDto, participantsIds);
				newState.matchDto = matchDto;
				newState.matchTimelineDto = matchTimelineDto;
				newState.champs.ids = champsIds;
				newState.champs.participantsIds = participantsIds;
				newState.champs.puuids = puuids;
				newState.champs.deathsData = deathsData;
				newState.champs.movementSpeeds = getChampsMovementSpeeds(championsData, champsIds);
			}
			return newState;
		},
		setReviewChampsLvls: (state, action: PayloadAction<TeamData<number>>) => {
			state.champs.lvls = action.payload;
		},
		setReviewChampsGolds: (state, action: PayloadAction<TeamData<number>>) => {
			state.champs.golds = action.payload;
		},
		setReviewChampsPositions: (state, action: PayloadAction<TeamData<Vector2d>>) => {
			state.champs.positions = action.payload;
			state.champs.inTheirBase = positionsToIsInBase(action.payload);
		},
		setReviewChampPosition: (state, action: PayloadAction<{ side: Side; lane: Lane; position: Vector2d }>) => {
			const { side, lane, position } = action.payload;
			state.champs.positions[side][lane] = position;
			state.champs.inTheirBase[side][lane] = isChampInHisBase(position, side);
		},
		setReviewRespawnsTimes: (state, action: PayloadAction<TeamData<number>>) => {
			state.champs.respawnsTimes = action.payload;
		},
		setReviewTimestampToDisplay: (state, action: PayloadAction<number>) => {
			state.timestampToDisplay = action.payload;
		},
		setReviewChampsInventoriesActions: (state, action: PayloadAction<TeamData<InventoryAction[]>>) => {
			state.champs.inventoriesActions = action.payload;
		},
		setReviewHistorySelectedServer: (state, action: PayloadAction<RiotServer>) => {
			state.history.selectedServer = action.payload;
		},
		setReviewHistorySummonerName: (state, action: PayloadAction<string>) => {
			state.history.summonerName = action.payload;
		},
		setReviewHistoryError: (state, action: PayloadAction<string>) => {
			state.history.error = action.payload;
		},
		setReviewHistoryIsLoading: (state, action: PayloadAction<boolean>) => {
			state.history.isLoading = action.payload;
		},
		setReviewHistoryPuuid: (state, action: PayloadAction<string>) => {
			state.history.puuid = action.payload;
		},
		setReviewHistoryGamesIds: (state, action: PayloadAction<null | string[]>) => {
			state.history.gamesIds = action.payload;
		},
		setReviewHistoryGamesData: (state, action: PayloadAction<MatchDto[]>) => {
			state.history.gamesData = action.payload;
		},
		setReviewHistoryGameIndex: (state, action: PayloadAction<number>) => {
			state.history.gameIndex = action.payload;
		},
		pushReviewHistoryGameData: (state, action: PayloadAction<MatchDto>) => {
			state.history.gamesData.push(action.payload);
		},
		resetReviewHistoryFetchedData: (state) => {
			state.history.gamesData = [];
			state.history.gamesIds = null;
			state.history.gameIndex = 0;
			state.history.puuid = "";
		},
		setReviewTurretsAlive: (state, action: PayloadAction<TurretsAlive>) => {
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
		setReviewTurretsEvents: (state, action: PayloadAction<TurretEvent[]>) => {
			state.turretsEvents = action.payload;
		},
	},
});

export const {
	setReviewRespawnsTimes,
	setReviewTurretsEvents,
	setReviewTurretsAlive,
	resetReviewHistoryFetchedData,
	pushReviewHistoryGameData,
	setReviewHistoryError,
	setReviewHistoryGameIndex,
	setReviewHistoryGamesData,
	setReviewHistoryGamesIds,
	setReviewHistoryIsLoading,
	setReviewHistoryPuuid,
	setReviewHistorySelectedServer,
	setReviewHistorySummonerName,
	resetReview,
	loadReviewSave,
	setReviewChampsInventoriesActions,
	setReviewTimestampToDisplay,
	setReviewChampsPositions,
	setReviewRiotData,
	setReviewChampsGolds,
	setReviewChampsLvls,
	setReviewChampPosition,
} = reviewSlice.actions;

export default reviewSlice.reducer;
