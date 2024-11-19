import { LaneType, WaveRegion } from "@/src/lib/types/types";
import { sideColors, wavesPos } from "@/src/lib/values/values";
import { FC } from "react";
import { Circle, Group } from "react-konva";

interface WavesPointsProps {
	laneType: LaneType;
	waveRegion: WaveRegion;
}

const WavesPoints: FC<WavesPointsProps> = ({ laneType, waveRegion }) => {
	const { x, y, angle } = wavesPos[laneType][waveRegion];
	return (
		<Group x={x} y={y} rotation={angle}>
			{/* Blue CS */}
			<Circle offsetX={8} offsetY={17} fill={sideColors.blue} radius={8} />
			<Circle offsetX={8} offsetY={0} fill={sideColors.blue} radius={8} />
			<Circle offsetX={8} offsetY={-17} fill={sideColors.blue} radius={8} />
			<Circle offsetX={31} offsetY={17} fill={sideColors.blue} radius={8} />
			<Circle offsetX={35} offsetY={0} fill={sideColors.blue} radius={8} />
			<Circle offsetX={31} offsetY={-17} fill={sideColors.blue} radius={8} />
			{/* Red CS */}
			<Circle offsetX={-8} offsetY={17} fill={sideColors.red} radius={8} />
			<Circle offsetX={-8} offsetY={0} fill={sideColors.red} radius={8} />
			<Circle offsetX={-8} offsetY={-17} fill={sideColors.red} radius={8} />
			<Circle offsetX={-31} offsetY={17} fill={sideColors.red} radius={8} />
			<Circle offsetX={-35} offsetY={0} fill={sideColors.red} radius={8} />
			<Circle offsetX={-31} offsetY={-17} fill={sideColors.red} radius={8} />
		</Group>
	);
};

export default WavesPoints;
