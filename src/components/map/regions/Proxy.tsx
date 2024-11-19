import { proxyPoints, proxyText } from "@/src/lib/mapData";
import { RegionLane, lanesType } from "@/src/lib/types/types";
import { FC } from "react";
import { Group, Line, Text } from "react-konva";

const colors = {
	lane1: "#03dbfc",
	lane2: "#034afc",
	lane3: "#4503fc",
	proxy1: "#fc0303",
	proxy2: "#fc6f03",
	proxy3: "#fcca03",
};

const tension = 0.05;
const opacity = 0.3;

interface ProxyRegionsProps {}

const ProxyRegions: FC<ProxyRegionsProps> = () => {
	return (
		<Group id="laningphaseRegionss">
			{lanesType.map((laneType) => {
				const lanePoints = proxyPoints[laneType];
				if (lanePoints)
					return Object.keys(lanePoints).map((rNumber) => {
						const txt = rNumber.replace("lane", `${laneType} `).replace("proxy", "proxy ");
						return (
							<Group key={laneType + rNumber}>
								<Line
									closed
									points={lanePoints[rNumber]}
									strokeEnabled={false}
									tension={tension}
									fill={colors[rNumber as RegionLane]}
									opacity={opacity}
								/>
								<Text
									x={proxyText[laneType][rNumber as RegionLane].x}
									y={proxyText[laneType][rNumber as RegionLane].y}
									text={txt.charAt(0).toUpperCase() + txt.slice(1)}
									fontSize={24}
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

export default ProxyRegions;
