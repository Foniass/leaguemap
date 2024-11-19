import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
	ButtonFunctionnality,
	ChampActionsFilter,
	DrawCommandProps,
	DrawMode,
	Lane,
	LineType,
	MapTab,
	Region,
	Side,
	SidebarTab,
	WardDef,
} from "../../types/types";
import { v4 as uuidv4 } from "uuid";
import { GlobalState } from "@/src/lib/types/redux";
import { defaultGlobalState } from "@/src/lib/values/initReduxValues";

export const globalSlice = createSlice({
	name: "global",
	initialState: defaultGlobalState,
	reducers: {
		loadGlobalSave: (state, action: PayloadAction<GlobalState>) => {
			return action.payload;
		},
		resetGlobal: () => {
			return { ...defaultGlobalState, id: uuidv4() };
		},
		resetGlobalCurrentTab: (state) => {
			state[state.mapTab] = defaultGlobalState[state.mapTab];
		},
		setGlobalChampIconSelected: (state, action: PayloadAction<{ side: Side; lane: Lane } | null>) => {
			state.champIconSelected = action.payload;
			if (action.payload !== null) state.lastChampIconSelected = action.payload;
		},
		setGlobalLastClickedButton: (state, action: PayloadAction<ButtonFunctionnality>) => {
			state.lastClickedButton = action.payload;
		},
		setGlobalSidebarTab: (state, action: PayloadAction<SidebarTab>) => {
			state.sidebarTab = action.payload;
		},
		setGlobalMapTab: (state, action: PayloadAction<MapTab>) => {
			state.mapTab = action.payload;
		},
		setGlobalLines: (state, action: PayloadAction<LineType[]>) => {
			state[state.mapTab].lines = action.payload;
		},
		setGlobalArrows: (state, action: PayloadAction<LineType[]>) => {
			state[state.mapTab].arrows = action.payload;
		},
		setGlobalWards: (state, action: PayloadAction<WardDef[]>) => {
			state[state.mapTab].wards = action.payload;
		},
		setGlobalRegions: (state, action: PayloadAction<Region[]>) => {
			state[state.mapTab].regions = action.payload;
		},
		setGlobalWantRegions: (state, action: PayloadAction<boolean>) => {
			state[state.mapTab].wantRegions = action.payload;
		},
		setGlobalWantVision: (state, action: PayloadAction<boolean>) => {
			state[state.mapTab].wantVision = action.payload;
		},
		pushGlobalDrawCommandHistory: (state, action: PayloadAction<DrawCommandProps>) => {
			state[state.mapTab].drawCommandHistory.push(action.payload);
		},
		popGlobalDrawCommandHistory: (state) => {
			state[state.mapTab].drawCommandHistory.pop();
		},
		pushGlobalDrawCommandRedo: (state, action: PayloadAction<DrawCommandProps>) => {
			state[state.mapTab].drawCommandRedo.push(action.payload);
		},
		popGlobalDrawCommandRedo: (state) => {
			state[state.mapTab].drawCommandRedo.pop();
		},
		setGlobalGroups: (state, action: PayloadAction<{ side: Side; lane: Lane }[][]>) => {
			state[state.mapTab].groups = action.payload;
		},
		setGlobalDrawMode: (state, action: PayloadAction<DrawMode>) => {
			state.drawMode = action.payload;
		},
		setGlobalLineColorIndex: (state, action: PayloadAction<0 | 1 | 2 | 3>) => {
			state.lineColorIndex = action.payload;
		},
		setGlobalChampsActionsFilter: (state, action: PayloadAction<{ side: Side; filter: ChampActionsFilter | null }>) => {
			const { side, filter } = action.payload;
			state.champsActionsFilter[side] = filter;
		},
	},
});

export const {
	popGlobalDrawCommandHistory,
	setGlobalChampsActionsFilter,
	setGlobalLineColorIndex,
	setGlobalDrawMode,
	popGlobalDrawCommandRedo,
	pushGlobalDrawCommandHistory,
	pushGlobalDrawCommandRedo,
	setGlobalArrows,
	setGlobalGroups,
	setGlobalLastClickedButton,
	setGlobalLines,
	setGlobalMapTab,
	setGlobalRegions,
	resetGlobal,
	loadGlobalSave,
	setGlobalSidebarTab,
	setGlobalWantRegions,
	setGlobalWantVision,
	setGlobalWards,
	resetGlobalCurrentTab,
	setGlobalChampIconSelected,
} = globalSlice.actions;
export default globalSlice.reducer;
