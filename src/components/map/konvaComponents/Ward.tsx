"use client";

import { FC } from "react";
import { Group, Circle } from "react-konva";
import { dragBoundFuncDefault } from "@/src/lib/utils";
import { ButtonFunctionnality } from "@/src/lib/types/types";

const wardVision = { sm: 15.0144, lg: 82.5792 };

interface WardProps {
	id: string;
	wardType: "yellow" | "pink";
	wardPose: {
		x: number;
		y: number;
	};
	lastClickedButton: ButtonFunctionnality;
}

const color = {
	yellow: "#2db32d",
	pink: "#fa529b",
};

const Ward: FC<WardProps> = ({ wardType, wardPose, lastClickedButton, id }) => {
	return (
		<Group
			x={wardPose.x}
			y={wardPose.y}
			draggable={true}
			dragBoundFunc={dragBoundFuncDefault(lastClickedButton === "cursor/modify")}
		>
			<Circle radius={wardVision.lg} fill={color[wardType]} opacity={0.2} />

			<Circle id={id} radius={wardVision.sm} fill={color[wardType]} />
		</Group>
	);
};

export default Ward;
