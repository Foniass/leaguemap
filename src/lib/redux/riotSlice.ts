import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { defaultRiotState } from "../values/initReduxValues";
import { RiotState } from "../types/redux";

const riotSlice = createSlice({
	name: "riot",
	initialState: defaultRiotState,
	reducers: {
		setRiotVersion: (state, action: PayloadAction<string>) => {
			state.version = action.payload;
		},
		setChampionsData: (state, action: PayloadAction<RiotState["championsData"]>) => {
			state.championsData = action.payload;
		},
		setItemsData: (state, action: PayloadAction<RiotState["itemsData"]>) => {
			state.itemsData = action.payload;
		},
	},
});

export const { setRiotVersion, setChampionsData, setItemsData } = riotSlice.actions;

export default riotSlice.reducer;
