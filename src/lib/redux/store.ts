import { configureStore } from "@reduxjs/toolkit";
import riotReducer from "./riotSlice";
import popupReducer from "./popupSlice";
import globalReducer from "./mapSlice/globalSlice";
import gameReducer from "./mapSlice/gameSlice";
import reviewReducer from "./mapSlice/reviewSlice";
import simulationReducer from "./mapSlice/simulationSlice";
import userReducer from "./userSlice";

export const store = configureStore({
	reducer: {
		user: userReducer,
		riot: riotReducer,
		popup: popupReducer,
		Global: globalReducer,
		Game: gameReducer,
		Review: reviewReducer,
		Simulation: simulationReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
