import { KonvaEventObject } from "konva/lib/Node";
import { addWard, getPath, getPosInStage } from "@/src/lib/utils";
import { Dispatch, MutableRefObject, SetStateAction, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import useDrawCommand from "../useDrawCommand";
import { RootState } from "@/src/lib/redux/store";
import { Stage } from "konva/lib/Stage";
import { Vector2d } from "konva/lib/types";
import useGlobalTab from "../useGlobalTab";
import { setGlobalChampIconSelected, setGlobalGroups } from "@/src/lib/redux/mapSlice/globalSlice";
import {
	pushSimulationChampAction,
	setSimulationChampPosition,
	setSimulationIsRequestingPathAPI,
} from "@/src/lib/redux/mapSlice/simulationSlice";

const useKonvaMouseDown = (
	stageRef: MutableRefObject<Stage | null>,
	isLeftClicking: MutableRefObject<boolean>,
	isRightClicking: MutableRefObject<boolean>,
	setTempLine: Dispatch<SetStateAction<number[]>>,
	eraseBelowMouse: () => void,
	setSelectRect: Dispatch<
		SetStateAction<{
			startPos: Vector2d;
			endPos: Vector2d;
			visible: boolean;
		}>
	>,
	initialMousePosition: MutableRefObject<{
		x: number;
		y: number;
	}>,
	middleMouseButtonDown: MutableRefObject<boolean>
) => {
	const dispatch = useDispatch();

	const [exec] = useDrawCommand();

	const { wards, groups } = useGlobalTab();

	const { lastClickedButton, mapTab, champIconSelected } = useSelector((state: RootState) => state.Global);

	const {
		isRequestingPathAPI,
		champs: { actions, positions },
		champThatCanDoActions,
	} = useSelector((state: RootState) => state.Simulation);

	const handleKonvaMouseDown = useCallback(
		async (e: KonvaEventObject<MouseEvent>) => {
			const stage = stageRef.current;
			const pos = getPosInStage(stage);
			if (pos === null) return;
			console.log(JSON.stringify(pos));

			// Unselect champ
			if (
				lastClickedButton === "cursor/modify" &&
				champIconSelected !== null &&
				!e.target.parent?.id().startsWith("champ-") &&
				mapTab !== "Simulation" &&
				champIconSelected !== null
			)
				dispatch(setGlobalChampIconSelected(null));

			// Left Click (down)
			if (e.evt.button === 0) {
				isLeftClicking.current = true;
				if (lastClickedButton === "draw/eraser") setTempLine([pos.x, pos.y]);
				if (lastClickedButton === "ward") addWard("yellow", pos, wards, exec);

				// Group champs
				if (e.target.id().startsWith("degroup-")) {
					const indexToDelete = parseInt(e.target.id().split("-")[1] ?? "");
					if (!isNaN(indexToDelete)) {
						const newGroups = [...groups];
						newGroups.splice(indexToDelete, 1);
						dispatch(setGlobalGroups(newGroups));
					}
				} else if (e.target.attrs.id === "lowest layer" && lastClickedButton === "cursor/modify")
					setSelectRect({ startPos: pos, endPos: pos, visible: true });

				if (
					mapTab === "Simulation" &&
					lastClickedButton === "cursor/modify" &&
					champIconSelected !== null &&
					e.target.attrs.id === "lowest layer"
				) {
					if (
						(!champThatCanDoActions && champIconSelected.lane === "jungle") ||
						(champThatCanDoActions?.side === champIconSelected.side &&
							champThatCanDoActions?.lane === champIconSelected.lane)
					) {
						if (!isRequestingPathAPI) {
							dispatch(setSimulationIsRequestingPathAPI(true));
							const side = champIconSelected.side;
							const lane = champIconSelected.lane;
							if (actions[side][lane].length > 0) {
								const pathData = await getPath(positions[side][lane], pos);
								dispatch(
									pushSimulationChampAction({
										side,
										lane,
										action: {
											type: "Walk",
											travel: pathData,
											mapSide: null,
											itemKey: null,
										},
									})
								);
								dispatch(setSimulationChampPosition({ lane: lane, side, position: pathData.end }));
							} else {
								dispatch(setSimulationChampPosition({ lane: lane, side, position: pos }));
							}
							dispatch(setSimulationIsRequestingPathAPI(false));
						}
					} else {
						dispatch(
							setSimulationChampPosition({
								lane: champIconSelected.lane,
								side: champIconSelected.side,
								position: pos,
							})
						);
					}
				}
			}

			if (e.evt.button === 1) {
				// Middle mouse button
				middleMouseButtonDown.current = true;
				const stage = stageRef.current;
				if (stage) {
					const mousePos = stage.getPointerPosition();
					if (mousePos !== null) initialMousePosition.current = { x: mousePos.x, y: mousePos.y };
				}
			}

			// Right Click (down)
			if (e.evt.button === 2) {
				isRightClicking.current = true;
				if (lastClickedButton === "ward") {
					addWard("pink", pos, wards, exec);
				}
				if (lastClickedButton === "draw/eraser") {
					eraseBelowMouse();
				}
			}
		},
		[
			actions,
			champIconSelected,
			champThatCanDoActions,
			dispatch,
			eraseBelowMouse,
			exec,
			groups,
			initialMousePosition,
			isLeftClicking,
			isRequestingPathAPI,
			isRightClicking,
			lastClickedButton,
			mapTab,
			middleMouseButtonDown,
			positions,
			setSelectRect,
			setTempLine,
			stageRef,
			wards,
		]
	);
	return { handleKonvaMouseDown };
};

export default useKonvaMouseDown;
