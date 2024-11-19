import { Stage } from "konva/lib/Stage";
import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import useImage from "use-image";
import { KonvaEventObject } from "konva/lib/Node";

const useKonvaDisplayManagement = (stageRef: MutableRefObject<Stage | null>) => {
	const [mapImage] = useImage("./map.webp");

	const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

	const minScale = useRef<number | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const updateSize = () => {
			if (containerRef.current) {
				setContainerDimensions({
					width: containerRef.current.offsetWidth,
					height: containerRef.current.offsetHeight,
				});
			}
		};
		updateSize();
		window.addEventListener("resize", updateSize);
		return () => {
			window.removeEventListener("resize", updateSize);
		};
	}, [containerRef]);

	const fitImage = useCallback(() => {
		if (stageRef.current && mapImage) {
			let stageRatio = containerDimensions.width / containerDimensions.height;
			let imgRatio = mapImage.naturalWidth / mapImage.naturalHeight;
			let scale;
			let xPos = 0;
			let yPos = 0;

			if (stageRatio > imgRatio) {
				// scale based on height
				scale = containerDimensions.height / mapImage.naturalHeight;
				xPos = (containerDimensions.width - mapImage.naturalWidth * scale) / 2;
			} else {
				// scale based on width
				scale = containerDimensions.width / mapImage.naturalWidth;
				yPos = (containerDimensions.height - mapImage.naturalHeight * scale) / 2;
			}
			stageRef.current.scale({ x: scale, y: scale });
			minScale.current = scale;
			stageRef.current.position({ x: xPos, y: yPos });
			stageRef.current.batchDraw();
		}
	}, [containerDimensions.height, containerDimensions.width, mapImage, stageRef]);

	useEffect(() => {
		fitImage();
	}, [fitImage]);

	const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();

		if (!stageRef.current || !minScale.current) return;

		const scaleBy = 1.1;
		const stage = stageRef.current;
		const oldScale = stage.scaleX();

		const pointerPosition = stage.getPointerPosition();
		if (!pointerPosition) return;
		const mousePointTo = {
			x: (pointerPosition.x - stage.x()) / oldScale,
			y: (pointerPosition.y - stage.y()) / oldScale,
		};

		const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

		if (newScale <= minScale.current) return fitImage();
		stage.scale({ x: newScale, y: newScale });

		const newPos = {
			x: pointerPosition.x - mousePointTo.x * newScale,
			y: pointerPosition.y - mousePointTo.y * newScale,
		};

		stage.position(newPos);
		stage.batchDraw();
	};

	return { containerDimensions, mapImage, handleWheel, containerRef };
};

export default useKonvaDisplayManagement;
