"use client";

import { FC } from "react";
import { Arrow, Group, Layer, Line, Rect, Image as KonvaImage } from "react-konva";
import { dragBoundFuncDefault } from "@/src/lib/utils";
import { Vector2d } from "konva/lib/types";
import { v4 } from "uuid";
import { RootState } from "@/src/lib/redux/store";
import { useSelector } from "react-redux";
import useImage from "use-image";
import useGlobalTab from "@/src/lib/hook/useGlobalTab";
import { linesColors } from "@/src/lib/types/types";
import useTab from "@/src/lib/hook/useTab";

interface DrawLayerProps {
	tempLine: number[];
	selectRect: {
		startPos: Vector2d;
		endPos: Vector2d;
		visible: boolean;
	};
}

const DrawLayer: FC<DrawLayerProps> = ({ tempLine, selectRect }) => {
	const [image] = useImage(
		"https://static.vecteezy.com/system/resources/previews/010/366/197/non_2x/bin-icon-transparent-bin-clipart-free-png.png"
	);

	const { groups, lines, arrows } = useGlobalTab();

	const {
		champs: { positions },
	} = useTab();

	const { lastClickedButton, lineColorIndex } = useSelector((state: RootState) => state.Global);

	const handleDrag = dragBoundFuncDefault(lastClickedButton === "cursor/modify");

	return (
		<Layer>
			{/* Lines */}
			{lines.map((line) => {
				return (
					<Line
						key={line.id}
						id={line.id}
						points={line.points}
						stroke={line.color}
						strokeWidth={5}
						tension={0.5}
						draggable={true}
						dragBoundFunc={handleDrag}
						lineCap="round"
					/>
				);
			})}
			<Line
				points={tempLine}
				stroke={linesColors[lineColorIndex]}
				strokeWidth={5}
				tension={0.5}
				draggable={true}
				dragBoundFunc={handleDrag}
				lineCap="round"
			/>

			{/* Arrows */}
			{arrows.map((arrow) => {
				return (
					<Arrow
						key={arrow.id}
						id={arrow.id}
						points={arrow.points}
						stroke={arrow.color}
						fill={arrow.color}
						tension={1}
						pointerWidth={6 * 5}
						pointerLength={4 * 5}
						strokeWidth={1 * 5}
						lineJoin={"round"}
						lineCap={"round"}
						draggable={true}
						dragBoundFunc={handleDrag}
						ArrowCap="round"
					/>
				);
			})}

			{selectRect.visible && (
				<Rect
					x={selectRect.startPos.x}
					y={selectRect.startPos.y}
					width={selectRect.endPos.x - selectRect.startPos.x}
					height={selectRect.endPos.y - selectRect.startPos.y}
					fill="#ffffff"
					opacity={0.3}
				/>
			)}

			{lastClickedButton === "select" && (
				<>
					{groups.map((group, index) => {
						if (group.length < 2) return;
						let minX = 99999;
						let maxX = 0;
						let minY = 99999;
						let maxY = 0;
						group.forEach(({ side, lane }) => {
							const pos = positions[side][lane];
							if (pos.x < minX) minX = pos.x;
							if (pos.x > maxX) maxX = pos.x;
							if (pos.y < minY) minY = pos.y;
							if (pos.y > maxY) maxY = pos.y;
						});
						const tolerancePx = 45;
						const x = minX - tolerancePx;
						const y = minY - tolerancePx;
						const width = maxX - minX + 2 * tolerancePx;
						const height = maxY - minY + 2 * tolerancePx;

						const buttonWidth = 50;
						const buttonHeight = 50;

						return (
							<Group key={v4()}>
								<Rect x={x} y={y - 60} width={buttonWidth} height={buttonHeight} fill="#ffffff" cornerRadius={3} />
								<KonvaImage
									image={image}
									x={x}
									y={y - 60}
									width={buttonWidth}
									height={buttonHeight}
									id={`degroup-${index}`}
								/>
								<Rect x={x} y={y} width={width} height={height} stroke="#03fce8" strokeWidth={5} />
							</Group>
						);
					})}
				</>
			)}
		</Layer>
	);
};

export default DrawLayer;
