import { riverPoints, riverText } from "@/src/lib/mapData";
import { FC } from "react";
import { Group, Line, Text } from "react-konva";

const color = "#ebe534";

const tension = 0.05;
const opacity = 0.3;

interface RiverRegionsProps {}

const RiverRegions: FC<RiverRegionsProps> = () => {
	return (
		<Group id="RiverRegionss">
			<Group id="topRegions">
				<Line closed points={riverPoints.top} strokeEnabled={false} tension={tension} fill={color} opacity={opacity} />
				<Text x={riverText.top.x} y={riverText.top.y} text="River Top" fontSize={26} fontStyle="bold" fill="#ffffff" />
			</Group>
			<Group id="botRegions">
				<Line closed points={riverPoints.bot} strokeEnabled={false} tension={tension} fill={color} opacity={opacity} />
				<Text x={riverText.bot.x} y={riverText.bot.y} text="River Bot" fontSize={26} fontStyle="bold" fill="#ffffff" />
			</Group>
		</Group>
	);
};

export default RiverRegions;
