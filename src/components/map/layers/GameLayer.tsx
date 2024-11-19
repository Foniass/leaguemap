"use client";

import { FC, useEffect, useRef, useState } from "react";
import Champ from "../konvaComponents/Champ/Champ";
import { KonvaEventObject } from "konva/lib/Node";
import { useDispatch, useSelector } from "react-redux";
import { Group, Image as KonvaImage, Layer, Line, Text, Rect } from "react-konva";
import { RootState } from "@/src/lib/redux/store";
import Ward from "../konvaComponents/Ward";
import JungleCamps from "../konvaComponents/JungleCamps";
import { v4 as uuidv4 } from "uuid";
import {
	findMidpoint,
	formatTime,
	getChampsPath,
	getRectangleNearLine,
	initTeamData,
	vector2dToLineData,
} from "@/src/lib/utils";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import SetupGame from "../konvaComponents/SetupGame";
import useGlobalTab from "@/src/lib/hook/useGlobalTab";
import useSimulationLayer from "@/src/lib/hook/simulation/useSimulationLayer";
import useTab from "@/src/lib/hook/useTab";
import { lanes, sides } from "@/src/lib/types/types";
import { setGlobalChampIconSelected, setGlobalSidebarTab } from "@/src/lib/redux/mapSlice/globalSlice";

interface GameLayerProps {
	containerDimensions: {
		width: number;
		height: number;
	};
}

const pathColors = {
	blue: "#21eded",
	red: "#e2f720",
};

const GameLayer: FC<GameLayerProps> = ({ containerDimensions }) => {
	const dispatch = useDispatch();

	const { wards, wantVision } = useGlobalTab();

	const {
		timestampToDisplay,
		champs: { positions, ids },
	} = useTab();

	const { mapTab, champIconSelected } = useSelector((state: RootState) => state.Global);
	const champsActionsToDisplay = useSelector((state: RootState) => state.Simulation.champs.actionsToDisplay);
	const lastClickedButton = useSelector((state: RootState) => state.Global.lastClickedButton);

	const [champPaths, setChampPaths] = useState<
		(
			| "Recall"
			| "Respawn"
			| {
					path: Vector2d[];
					time: number;
			  }
			| null
		)[]
	>([]);

	const champsGroupsRef = useRef(initTeamData<Konva.Group | null>(null));

	const { tooltip, handleMouseEnter, handleMouseLeave, bootsImage } = useSimulationLayer();

	useEffect(() => {
		if (champIconSelected === null || mapTab !== "Simulation") return setChampPaths([]);
		setChampPaths(
			getChampsPath(champsActionsToDisplay[champIconSelected.side][champIconSelected.lane], timestampToDisplay)
		);
	}, [champIconSelected, champsActionsToDisplay, mapTab, timestampToDisplay]);

	return (
		<Layer>
			{/* Jungles Paths */}
			{champPaths.map((champPath) => {
				if (champPath === null || champPath === "Recall" || champPath === "Respawn") return;
				const { path, time } = champPath;
				const points = vector2dToLineData(path);
				const textHeight = 26;
				const textWidth = 80;
				const rect = getRectangleNearLine(path, textWidth, textHeight);
				const { midPoint } = findMidpoint(points);

				return (
					<>
						<Line
							key={uuidv4()}
							points={points}
							stroke={pathColors[champIconSelected?.side ?? "blue"]}
							strokeWidth={5}
							tension={0.5}
							lineCap="round"
							dash={[15, 20]}
						/>
						<Group
							x={rect ? rect.topLeft.x : midPoint.x}
							y={rect ? rect.topLeft.y : midPoint.y}
							offsetY={rect ? textHeight : textHeight / 2} // To vertically center the text
							offsetX={rect ? 0 : (`${Math.round(time * 10) / 10.0}s`.length - 1) * 5}
						>
							<KonvaImage image={bootsImage} offsetY={4} offsetX={30} />
							<Text
								text={`${Math.round(time * 10) / 10.0}s`}
								fontSize={26}
								fill="#ffffff"
								fontStyle="bold"
								stroke="#000000"
								strokeWidth={0.5} // Adjusts the thickness of the border
							/>
						</Group>
					</>
				);
			})}

			{/* Turrets & Waves */}
			<SetupGame />

			{/* Time Display on top of the map */}
			<Rect x={600} y={0} width={`${formatTime(timestampToDisplay)}`.length * 30 * 1.25} height={60} fill="#000000" />
			<Text
				x={600}
				y={0}
				offsetX={-1}
				offsetY={-1}
				text={`${formatTime(timestampToDisplay)}`}
				fontSize={60}
				fontStyle="bold"
				fill="#ffffff"
			/>

			{mapTab === "Simulation" && (
				<JungleCamps tooltip={tooltip} handleMouseEnter={handleMouseEnter} handleMouseLeave={handleMouseLeave} />
			)}

			{/* Wards */}
			{wards.map((ward) => {
				return (
					<Ward
						key={ward.id}
						id={ward.id}
						wardType={ward.type}
						wardPose={ward.pos}
						lastClickedButton={lastClickedButton}
					/>
				);
			})}
			{/* Icons of champions */}
			{sides.map((side) =>
				lanes.map((lane) => {
					const posToDisplay = positions[side][lane];
					return (
						<Champ
							key={`${side}${lane}`}
							handleMouseEnter={handleMouseEnter}
							handleMouseLeave={handleMouseLeave}
							lane={lane}
							lastClickedButton={lastClickedButton}
							pos={posToDisplay}
							side={side}
							containerDimensions={containerDimensions}
							onClick={(e: KonvaEventObject<MouseEvent>) => {
								if (e.evt.button === 0 && lastClickedButton === "cursor/modify") {
									dispatch(setGlobalChampIconSelected({ side, lane }));
									dispatch(setGlobalSidebarTab("MatchUp"));
								}
							}}
							champId={ids[side][lane]}
							wantVision={wantVision}
							champsGroupsRef={champsGroupsRef}
						/>
					);
				})
			)}
		</Layer>
	);
};

export default GameLayer;
