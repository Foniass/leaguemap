import { regionsPoints, regionsTexts } from "@/src/lib/mapData";
import { RegionNumber } from "@/src/lib/types/types";
import { FC } from "react";
import { Group, Line, Text } from "react-konva";

const colors = {
	R1: "#7703fc",
	R2: "#fc03e3",
	R3: "#fc0349",
};

const tension = 0;
const opacity = 0.3;

interface LaningPhaseRegionsProps {}

type LineLanes = "top" | "mid" | "bot";

const LaningPhaseRegions: FC<LaningPhaseRegionsProps> = () => {
	return (
		<Group id="laningphaseRegionss">
			{Object.keys(regionsPoints).map((lane) => {
				const lanePoints = regionsPoints[lane];
				if (lanePoints)
					return Object.keys(lanePoints).map((rNumber) => {
						return (
							<Group key={`${lane}${rNumber}Region`}>
								<Line
									closed
									points={lanePoints[rNumber]}
									strokeEnabled={false}
									tension={tension}
									fill={colors[rNumber as RegionNumber]}
									opacity={opacity}
								/>
								<Text
									x={regionsTexts[lane as LineLanes][rNumber as RegionNumber].x}
									y={regionsTexts[lane as LineLanes][rNumber as RegionNumber].y}
									text={rNumber}
									fontSize={30}
									fontStyle="bold"
									fill="#ffffff"
								/>
							</Group>
						);
					});
			})}
		</Group>
	);
};

export default LaningPhaseRegions;
