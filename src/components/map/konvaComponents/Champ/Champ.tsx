"use client";

import { FC, MutableRefObject, useEffect, useState } from "react";
import { getPath } from "@/src/lib/utils";
import { KonvaEventObject } from "konva/lib/Node";
import { jungleCampsData, sideColors } from "@/src/lib/values/values";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/lib/redux/store";
import { Vector2d } from "konva/lib/types";
import useChampImage from "@/src/lib/hook/champ/useChampImage";
import Lvls from "./Lvls";
import DeathTimer from "./DeathTimer";
import Konva from "konva";
import { Group, Circle } from "react-konva";
import { ButtonFunctionnality, Camp, Side, TeamData } from "@/src/lib/types/types";
import useTab from "@/src/lib/hook/useTab";
import { setGlobalChampIconSelected } from "@/src/lib/redux/mapSlice/globalSlice";
import {
	pushSimulationChampAction,
	setSimulationChampsPositions,
	setSimulationIsRequestingPathAPI,
} from "@/src/lib/redux/mapSlice/simulationSlice";
import useGlobalTab from "@/src/lib/hook/useGlobalTab";
import { setGameChampsPositions } from "@/src/lib/redux/mapSlice/gameSlice";
import { setReviewChampsPositions } from "@/src/lib/redux/mapSlice/reviewSlice";

const champVision = 124.0344;

interface ChampProps {
	pos: {
		x: number;
		y: number;
	};
	lastClickedButton: ButtonFunctionnality;
	champId: string | null;
	side: Side;
	lane: "top" | "jungle" | "mid" | "bot" | "sup";
	onClick: (e: KonvaEventObject<MouseEvent>) => void;
	wantVision: boolean;
	containerDimensions: {
		width: number;
		height: number;
	};
	handleMouseEnter: (camp: Camp, campSide: Side, type: "inCamp" | "inTooltip", pos?: Vector2d) => void;
	handleMouseLeave: (camp: Camp, campSide: Side, type: "inCamp" | "inTooltip") => void;
	champsGroupsRef: MutableRefObject<TeamData<Konva.Group | null>>;
}

const Champ: FC<ChampProps> = (props) => {
	const {
		pos: champPos,
		lastClickedButton,
		champId,
		side,
		onClick,
		lane,
		wantVision,
		containerDimensions,
		handleMouseEnter,
		handleMouseLeave,
		champsGroupsRef,
	} = props;

	const dispatch = useDispatch();

	const { groups } = useGlobalTab();

	const {
		champs: { positions },
	} = useTab();

	const { mapTab, champIconSelected } = useSelector((state: RootState) => state.Global);

	const {
		isRequestingPathAPI,
		champThatCanDoActions,
		champs: { actions },
	} = useSelector((state: RootState) => state.Simulation);

	const [isSelected, setIsSelected] = useState(false);

	const { champImage, champImageRef, fillPatternOffset } = useChampImage(champId, lane, side);

	const onMouseEnter = () => {
		const campOn = jungleCampsData.find((camp) => camp.pos.x === champPos.x && camp.pos.y === champPos.y);
		if (campOn !== undefined) handleMouseEnter(campOn.type, campOn.side, "inCamp", champPos);
	};

	const onMouseLeave = () => {
		const campOn = jungleCampsData.find((camp) => camp.pos.x === champPos.x && camp.pos.y === champPos.y);
		if (campOn !== undefined) handleMouseLeave(campOn.type, campOn.side, "inCamp");
	};

	const onDragEnd = async (e: KonvaEventObject<DragEvent>) => {
		if (lastClickedButton == "cursor/modify") {
			const oldPos = positions[side][lane];
			const newPos = e.target.position();
			const dx = newPos.x - oldPos.x;
			const dy = newPos.y - oldPos.y;
			let newChampsPos = JSON.parse(JSON.stringify(positions)) as TeamData<Vector2d>;
			newChampsPos[side][lane] = newPos;
			if (
				mapTab === "Simulation" &&
				((!champThatCanDoActions && lane === "jungle") ||
					(champThatCanDoActions?.side === side && champThatCanDoActions?.lane === lane))
			) {
				dispatch(setGlobalChampIconSelected({ side, lane }));
				if (!isRequestingPathAPI) {
					dispatch(setSimulationIsRequestingPathAPI(true));
					if (actions[side][lane].length > 0) {
						const pathData = await getPath(oldPos, newPos);
						dispatch(
							pushSimulationChampAction({
								side,
								lane,
								action: {
									travel: pathData,
									mapSide: null,
									type: "Walk",
									itemKey: null,
								},
							})
						);
						newChampsPos[side][lane] = pathData.end;
					}
					dispatch(setSimulationIsRequestingPathAPI(false));
				}
			}
			groups.forEach((group) => {
				if (!group.find((elem) => elem.side === side && elem.lane === lane)) return;
				group.forEach((elem) => {
					if (elem.side === side && elem.lane === lane) return;
					newChampsPos[elem.side][elem.lane] = {
						x: newChampsPos[elem.side][elem.lane].x + dx,
						y: newChampsPos[elem.side][elem.lane].y + dy,
					};
				});
			});
			if (mapTab === "Game") dispatch(setGameChampsPositions(newChampsPos));
			if (mapTab === "Review") dispatch(setReviewChampsPositions(newChampsPos));
			if (mapTab === "Simulation") dispatch(setSimulationChampsPositions(newChampsPos));
		}
	};

	useEffect(() => {
		setIsSelected(champIconSelected?.lane === lane && champIconSelected?.side === side);
	}, [champIconSelected, lane, side]);

	return (
		<Group
			id={`champ-${side}-${lane}`}
			x={champPos.x}
			y={champPos.y}
			ref={(ref) => {
				champsGroupsRef.current[side][lane] = ref;
			}}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			draggable={true}
			dragBoundFunc={function handleDrag(this: Konva.Node, pos: Vector2d) {
				if (lastClickedButton === "cursor/modify") {
					const newPos = {
						x: containerDimensions ? Math.max(0, Math.min(pos.x, containerDimensions.width)) : pos.x,
						y: containerDimensions ? Math.max(0, Math.min(pos.y, containerDimensions.height)) : pos.y,
					};
					const dx = newPos.x - this.absolutePosition().x;
					const dy = newPos.y - this.absolutePosition().y;

					groups.forEach((group) => {
						if (!group.find((elem) => elem.side === side && elem.lane === lane)) return;
						group.forEach((elem) => {
							if (elem.side === side && elem.lane === lane) return;
							const currentElem = champsGroupsRef.current[elem.side][elem.lane];
							if (currentElem === null) return;
							const currentElemPos = currentElem?.absolutePosition();
							currentElem.absolutePosition({
								x: currentElemPos.x + dx,
								y: currentElemPos.y + dy,
							});
						});
					});
					return newPos;
				} else {
					return {
						x: this.absolutePosition().x,
						y: this.absolutePosition().y,
					};
				}
			}}
			onDragEnd={onDragEnd}
		>
			{wantVision && <Circle radius={champVision} fill={sideColors[side]} opacity={0.2} />}

			{/* Champ Circle Display */}
			<Circle
				radius={champVision / 4}
				stroke={champId ? sideColors[side] : "#ffffff"}
				strokeWidth={isSelected ? 6 : 3}
			/>
			<Circle radius={champVision / 4} fill={sideColors[side]} />
			<Circle
				radius={champVision / 4}
				ref={champImageRef}
				fillPatternImage={champImage || undefined}
				fillPatternScale={{ x: 1.4 * (champId ? 1 : 0.3), y: 1.4 * (champId ? 1 : 0.3) }}
				fillPatternOffset={fillPatternOffset}
			/>

			<DeathTimer side={side} lane={lane} />

			<Lvls side={side} lane={lane} />
		</Group>
	);
};

export default Champ;
