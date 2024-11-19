import { Side } from "@/src/lib/types/types";
import { FC } from "react";
import { Group, Line, Text } from "react-konva";

const colors = {
	blue: "#0307fc",
	red: "#fc1c03",
};

const tension = 1;
const opacity = 0.3;

let points: Points = {
	top: {
		blue: [
			188.88775607347665, 657.7850162866449, 361.2639352056266, 539.413680781759, 476.6810290593268, 696.742671009772,
			302.80592663037567, 810.6188925081434,
		],
		red: [
			547.7498046665646, 382.08469055374593, 592.3582848946754, 187.85081433224755, 788.4570747939978, 355.114006514658,
			649.0572081914767, 528.9250814332247,
		],
	},
	bot: {
		blue: [
			587.6013530226232, 1021.8892508143323, 680.534597424304, 831.5960912052118, 834.9236969948382, 990.4234527687296,
			735.9947594059523, 1174.7231270358307,
		],
		red: [
			1064.2589614054375, 860.0651465798046, 1215.650214382369, 771.6612377850163, 1033.0417341542584,
			566.3843648208469, 906.8720152413007, 665.2768729641693,
		],
	},
};

let text = {
	top: {
		blue: {
			x: 266.83176750714443,
			y: 674.2671009771987,
		},
		red: {
			x: 587.6013530226232,
			y: 386.5798045602606,
		},
	},
	bot: {
		blue: {
			x: 644.5604383010727,
			y: 953.0420846905537,
		},
		red: {
			x: 1022.289109095001,
			y: 688.6964169381107,
		},
	},
};

interface JungleRegionsProps {}

interface Points {
	[key: string]: { [key: string]: number[] };
}

type LineLanes = "top" | "bot";

const JungleRegions: FC<JungleRegionsProps> = () => {
	return (
		<Group id="JungleRegionss">
			{Object.keys(points).map((lane) => {
				const lanePoints = points[lane];
				if (lanePoints)
					return Object.keys(lanePoints).map((rNumber) => {
						let txt = rNumber.replace("blue", "Jungle ").replace("red", "Invade ");
						txt += lane.charAt(0).toUpperCase() + lane.slice(1);
						return (
							<Group key={lane + rNumber}>
								<Line
									closed
									points={lanePoints[rNumber]}
									strokeEnabled={false}
									tension={tension}
									fill={colors[rNumber as Side]}
									opacity={opacity}
								/>
								<Text
									x={text[lane as LineLanes][rNumber as Side].x}
									y={text[lane as LineLanes][rNumber as Side].y}
									text={txt}
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

export default JungleRegions;
