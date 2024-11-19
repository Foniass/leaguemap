import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { defaultPopupState } from "../values/initReduxValues";
import { PopupType } from "../types/redux";

const popupSlice = createSlice({
	name: "popup",
	initialState: defaultPopupState,
	reducers: {
		setPopup: (state, action: PayloadAction<{ message: string; type: PopupType }>) => {
			return { ...action.payload, visible: true };
		},
		setPopupVisible: (state, action: PayloadAction<boolean>) => {
			state.visible = action.payload;
		},
	},
});

export const { setPopup, setPopupVisible } = popupSlice.actions;

export default popupSlice.reducer;
