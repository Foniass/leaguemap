import { Dispatch, MutableRefObject, SetStateAction, useCallback, useRef } from "react";
import { getPosInStage, isPointInRectangle, mergeGroups } from "../../utils";
import { Stage } from "konva/lib/Stage";
import { RootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import Konva from "konva";
import useGlobalTab from "../useGlobalTab";
import useDrawCommand from "../useDrawCommand";
import { v4 } from "uuid";
import { Lane, Side, isLane, isSide, linesColors } from "../../types/types";
import { Vector2d } from "konva/lib/types";
import { setGlobalGroups } from "@/src/lib/redux/mapSlice/globalSlice";

const useWindowMouseEvents = (
	stageRef: MutableRefObject<Stage | null>,
	isLeftClicking: MutableRefObject<boolean>,
	isRightClicking: MutableRefObject<boolean>,
	tempLine: number[],
	setTempLine: Dispatch<SetStateAction<number[]>>,
	selectRect: {
		startPos: Vector2d;
		endPos: Vector2d;
		visible: boolean;
	},
	setSelectRect: Dispatch<
		SetStateAction<{
			startPos: Vector2d;
			endPos: Vector2d;
			visible: boolean;
		}>
	>
) => {
	const dispatch = useDispatch();

	const { lines, wards, arrows, groups } = useGlobalTab();

	const { lastClickedButton, drawMode, lineColorIndex } = useSelector((state: RootState) => state.Global);

	const [exec, undo, redo] = useDrawCommand();

	const middleMouseButtonDown = useRef(false);
	const initialMousePosition = useRef({ x: 0, y: 0 });

	const eraseBelowMouse = useCallback(() => {
		let pointerPosition = stageRef.current?.getPointerPosition();
		const clickedOn = pointerPosition ? stageRef.current?.getIntersection(pointerPosition) : null;

		if (clickedOn) {
			let itemToRemove;
			switch (clickedOn.constructor) {
				case Konva.Line:
					itemToRemove = lines.find((line) => line.id === clickedOn.attrs.id);
					if (itemToRemove) {
						exec({ type: "removeLine", line: itemToRemove, lines });
					}
					break;
				case Konva.Arrow:
					itemToRemove = arrows.find((arrow) => arrow.id === clickedOn.attrs.id);
					if (itemToRemove) {
						exec({ type: "removeArrow", arrow: itemToRemove, arrows });
					}
					break;
				case Konva.Circle:
					if (clickedOn.attrs.id) {
						itemToRemove = wards.find((ward) => ward.id === clickedOn.attrs.id);
						if (itemToRemove) {
							exec({ type: "removeWard", ward: itemToRemove, wards });
						}
					}
					break;
				default:
					break;
			}
		}
	}, [arrows, exec, lines, stageRef, wards]);

	const handleMouseMove = useCallback(() => {
		const stage = stageRef.current;
		const pos = getPosInStage(stage);
		if (pos === null) return;

		switch (lastClickedButton) {
			case "draw/eraser":
				if (isLeftClicking.current) {
					if (!stageRef.current) break;
					setTempLine([...tempLine, pos.x, pos.y]);
				} else if (isRightClicking.current) eraseBelowMouse();
				break;
		}
		if (selectRect.visible) setSelectRect((prev) => ({ ...prev, endPos: pos }));

		if (middleMouseButtonDown.current) {
			const stage = stageRef.current;
			if (stage) {
				const mousePos = stage.getPointerPosition();
				if (mousePos) {
					const dx = mousePos.x - initialMousePosition.current.x;
					const dy = mousePos.y - initialMousePosition.current.y;
					stage.position({
						x: stage.x() + dx,
						y: stage.y() + dy,
					});
					stage.batchDraw();
					initialMousePosition.current = { x: mousePos.x, y: mousePos.y };
				}
			}
		}
	}, [
		eraseBelowMouse,
		isLeftClicking,
		isRightClicking,
		lastClickedButton,
		selectRect.visible,
		setSelectRect,
		setTempLine,
		stageRef,
		tempLine,
	]);

	const handleMouseUp = useCallback(
		(e: MouseEvent) => {
			if (e.button === 0) {
				isLeftClicking.current = false;
				if (selectRect.visible) {
					setSelectRect((prev) => ({ ...prev, visible: false }));
					const champsIn: { side: Side; lane: Lane }[] = [];
					stageRef.current?.getChildren().forEach((layer) => {
						layer.getChildren((konvaItem) => {
							const konvaItemId = konvaItem.id();
							if (konvaItemId.startsWith("champ-")) {
								const [_champ, side, lane] = konvaItemId.split("-");
								if (
									side !== undefined &&
									isSide(side) &&
									lane !== undefined &&
									isLane(lane) &&
									isPointInRectangle(selectRect.startPos, selectRect.endPos, konvaItem.getPosition())
								)
									champsIn.push({ side, lane });
							}
							return true;
						});
					});
					const blueChampsIn = champsIn.filter(({ side }) => side === "blue");
					const redChampsIn = champsIn.filter(({ side }) => side === "red");
					const newGroup = blueChampsIn.length >= redChampsIn.length ? blueChampsIn : redChampsIn;
					if (newGroup.length >= 2) {
						let newGroups = [...groups, newGroup];
						dispatch(setGlobalGroups(mergeGroups(newGroups)));
					}
				}
				if (tempLine.length > 0) {
					const newLine = {
						id: v4(),
						points: tempLine,
						color: linesColors[lineColorIndex] || "#ffffff",
						end: false,
					};
					switch (drawMode) {
						case "line":
							exec({ type: "drawLine", line: newLine, lines });
							break;
						case "arrow":
							exec({ type: "drawArrow", arrow: newLine, arrows });
							break;
					}
					setTempLine([]);
				}
			}
			if (e.button === 1) middleMouseButtonDown.current = false;
			if (e.button === 2) isRightClicking.current = false;
		},
		[
			arrows,
			dispatch,
			drawMode,
			exec,
			groups,
			isLeftClicking,
			isRightClicking,
			lineColorIndex,
			lines,
			selectRect.endPos,
			selectRect.startPos,
			selectRect.visible,
			setSelectRect,
			setTempLine,
			stageRef,
			tempLine,
		]
	);

	return {
		handleMouseMove,
		handleMouseUp,
		eraseBelowMouse,
		middleMouseButtonDown,
		initialMousePosition,
	};
};

export default useWindowMouseEvents;
