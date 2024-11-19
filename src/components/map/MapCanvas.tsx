"use client";

import { FC, useRef, useEffect, useState } from "react";

import { Stage, Layer, Image as KonvaImage } from "react-konva";
import Konva from "konva";

import DrawLayer from "./layers/DrawLayer";
import GameLayer from "./layers/GameLayer";
import Regions from "@/src/components/map/konvaComponents/Regions";

import useCalculated from "@/src/lib/hook/calculated/useCalculated";
import useWindowMouseEvents from "@/src/lib/hook/map/useWindowMouseEvents";
import useKonvaDisplayManagement from "@/src/lib/hook/map/useKonvaDisplayManagement";
import useWindowKeyDown from "@/src/lib/hook/map/useWindowKeyDown";
import useKonvaMouseDown from "@/src/lib/hook/map/useKonvaMouseDown";
import { Vector2d } from "konva/lib/types";
import useGlobalTab from "@/src/lib/hook/useGlobalTab";
import useUrl from "@/src/lib/hook/url/useUrl";
import useAutoSave from "@/src/lib/hook/save/useAutoSave";
import useRiot from "@/src/lib/hook/useRiot";
import useUser from "@/src/lib/hook/useUser";
import useSafeKeyDown from "@/src/lib/hook/useSafeKeyDown";

interface MapCanvasProps {
	className?: string;
}

const MapCanvas: FC<MapCanvasProps> = ({ className }) => {
	useCalculated();
	useUrl();
	useAutoSave();
	useRiot();
	useUser();

	const { wantRegions } = useGlobalTab();

	const stageRef = useRef<Konva.Stage | null>(null);
	const isLeftClicking = useRef(false);
	const isRightClicking = useRef(false);

	const [tempLine, setTempLine] = useState<number[]>([]);
	const [selectRect, setSelectRect] = useState<{ startPos: Vector2d; endPos: Vector2d; visible: boolean }>({
		startPos: { x: 0, y: 0 },
		endPos: { x: 0, y: 0 },
		visible: false,
	});

	const { handleKeyDown } = useWindowKeyDown();

	const { containerDimensions, mapImage, handleWheel, containerRef } = useKonvaDisplayManagement(stageRef);

	const { handleMouseMove, handleMouseUp, eraseBelowMouse, initialMousePosition, middleMouseButtonDown } =
		useWindowMouseEvents(stageRef, isLeftClicking, isRightClicking, tempLine, setTempLine, selectRect, setSelectRect);

	const { handleKonvaMouseDown } = useKonvaMouseDown(
		stageRef,
		isLeftClicking,
		isRightClicking,
		setTempLine,
		eraseBelowMouse,
		setSelectRect,
		initialMousePosition,
		middleMouseButtonDown
	);

	useEffect(() => {
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [handleKeyDown, handleMouseMove, handleMouseUp]);

	useSafeKeyDown(handleKeyDown);

	return (
		<div className={className + " overflow-hidden z-10 rounded-2xl border border-white"} ref={containerRef}>
			{/* MAP */}
			<Stage
				width={containerDimensions.width}
				height={containerDimensions.height}
				ref={stageRef}
				onWheel={handleWheel}
				onContextMenu={(e) => e.evt.preventDefault()}
				onMouseDown={handleKonvaMouseDown}
			>
				{/* MAP LAYER */}
				<Layer>
					<KonvaImage id={"lowest layer"} image={mapImage} alt="League of Legends Map" />
				</Layer>

				{/* MAP INFOS LAYER */}
				<Layer>{wantRegions && <Regions />}</Layer>

				{/* GAME LAYER LAYER */}
				<GameLayer containerDimensions={containerDimensions} />

				{/* DRAW LAYER */}
				<DrawLayer tempLine={tempLine} selectRect={selectRect} />
			</Stage>
		</div>
	);
};

export default MapCanvas;
