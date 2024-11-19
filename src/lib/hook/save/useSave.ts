import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useSession } from "next-auth/react";
import axios from "axios";
import { MapDb } from "../../db/maps/collection";
import dayjs from "dayjs";
import { useCallback, useEffect, useRef } from "react";
import { loadGlobalSave, resetGlobal } from "@/src/lib/redux/mapSlice/globalSlice";
import { loadGameSave, resetGame } from "@/src/lib/redux/mapSlice/gameSlice";
import { loadReviewSave, resetReview } from "@/src/lib/redux/mapSlice/reviewSlice";
import { loadSimulationSave, resetSimulation } from "@/src/lib/redux/mapSlice/simulationSlice";

const useSave = () => {
	const dispatch = useDispatch();
	const session = useSession();

	const Global = useSelector((state: RootState) => state.Global);
	const Game = useSelector((state: RootState) => state.Game);
	const Review = useSelector((state: RootState) => state.Review);
	const Simulation = useSelector((state: RootState) => state.Simulation);
	const latestMapData = useRef({ Global, Game, Review, Simulation });

	useEffect(() => {
		latestMapData.current = { Global, Game, Review, Simulation };
	}, [Global, Game, Review, Simulation]);

	const saveCurrentMap = useCallback(async () => {
		if (session.data?.user?.email) {
			const mapDb: MapDb = {
				lastUpdate: dayjs().unix(),
				...latestMapData.current,
			};
			try {
				await axios.post("/api/mongodb/global/saveMap", { newMap: mapDb, email: session.data?.user?.email });
			} catch (error) {}
		}
	}, [session.data?.user?.email]);

	const loadNewMapWithoutSave = useCallback(
		(newMap?: MapDb | undefined, options?: { onlyGlobal?: boolean }) => {
			if (newMap === undefined) {
				dispatch(resetGlobal());
				if (!options?.onlyGlobal) {
					dispatch(resetGame());
					dispatch(resetReview());
					dispatch(resetSimulation());
				}
			} else {
				dispatch(loadGlobalSave(newMap.Global));
				if (!options?.onlyGlobal) {
					dispatch(loadGameSave(newMap.Game));
					dispatch(loadReviewSave(newMap.Review));
					dispatch(loadSimulationSave(newMap.Simulation));
				}
			}
		},
		[dispatch]
	);

	const loadNewMap = useCallback(
		async (newMap?: MapDb | undefined, options?: { nopresave?: boolean; onlyGlobal?: boolean }) => {
			if (!options?.nopresave) await saveCurrentMap();
			if (newMap === undefined) {
				dispatch(resetGlobal());
				if (!options?.onlyGlobal) {
					dispatch(resetGame());
					dispatch(resetReview());
					dispatch(resetSimulation());
				}
			} else {
				dispatch(loadGlobalSave(newMap.Global));
				if (!options?.onlyGlobal) {
					dispatch(loadGameSave(newMap.Game));
					dispatch(loadReviewSave(newMap.Review));
					dispatch(loadSimulationSave(newMap.Simulation));
				}
			}
		},
		[dispatch, saveCurrentMap]
	);

	return { saveCurrentMap, loadNewMap, loadNewMapWithoutSave };
};

export default useSave;
