import { useCallback } from "react";
import useDrawCommand from "../useDrawCommand";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { basesPos } from "../../values/values";
import { setGlobalLastClickedButton } from "@/src/lib/redux/mapSlice/globalSlice";
import useGlobalTab from "../useGlobalTab";
import { pushSimulationChampAction, setSimulationChampPosition } from "@/src/lib/redux/mapSlice/simulationSlice";
import { setGameChampPosition } from "@/src/lib/redux/mapSlice/gameSlice";
import { setReviewChampPosition } from "@/src/lib/redux/mapSlice/reviewSlice";

const useWindowKeyDown = () => {
	const dispatch = useDispatch();

	const [exec, undo, redo] = useDrawCommand();

	const { lines, wards, arrows, wantRegions, wantVision } = useGlobalTab();

	const { mapTab, champIconSelected } = useSelector((state: RootState) => state.Global);
	const champThatCanDoActions = useSelector((state: RootState) => state.Simulation.champThatCanDoActions);
	const binds = useSelector((state: RootState) => state.user.binds);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			// Undo
			if (event.ctrlKey && event.key === "z") {
				event.preventDefault();
				undo();
				return;
			}

			// Redo
			if (event.ctrlKey && event.key === "y") {
				event.preventDefault();
				redo();
				return;
			}

			switch (event.key) {
				case binds.cursor:
					dispatch(setGlobalLastClickedButton("cursor/modify"));
					break;
				case binds.select:
					dispatch(setGlobalLastClickedButton("select"));
					break;
				case binds.pencil:
					dispatch(setGlobalLastClickedButton("draw/eraser"));
					break;
				case binds.ward:
					dispatch(setGlobalLastClickedButton("ward"));
					break;
				case binds.vision:
					exec({ type: "wantVision", wantVision });
					break;
				case binds.region:
					exec({ type: "wantRegions", wantRegions });
					break;
				case binds.reset:
					exec({ type: "resetDrawing", lines, arrows, wards });
					break;
				case binds.recall:
					if (champIconSelected) {
						if (
							mapTab === "Simulation" &&
							((!champThatCanDoActions && champIconSelected.lane === "jungle") ||
								(champThatCanDoActions?.side === champIconSelected.side &&
									champThatCanDoActions?.lane === champIconSelected.lane))
						)
							dispatch(
								pushSimulationChampAction({
									side: champIconSelected.side,
									lane: champIconSelected.lane,
									action: {
										type: "Recall",
										mapSide: null,
										travel: null,
										itemKey: null,
									},
								})
							);

						const payloadToSend = {
							lane: champIconSelected.lane,
							side: champIconSelected.side,
							position: basesPos[champIconSelected.side],
						};
						if (mapTab === "Game") dispatch(setGameChampPosition(payloadToSend));
						if (mapTab === "Review") dispatch(setReviewChampPosition(payloadToSend));
						if (mapTab === "Simulation") dispatch(setSimulationChampPosition(payloadToSend));
					}
					break;
			}
		},
		[
			arrows,
			binds.cursor,
			binds.pencil,
			binds.recall,
			binds.region,
			binds.reset,
			binds.select,
			binds.vision,
			binds.ward,
			champIconSelected,
			champThatCanDoActions,
			dispatch,
			exec,
			lines,
			mapTab,
			redo,
			undo,
			wantRegions,
			wantVision,
			wards,
		]
	);
	return { handleKeyDown };
};

export default useWindowKeyDown;
