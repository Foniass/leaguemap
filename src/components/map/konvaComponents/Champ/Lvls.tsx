"use client";

import useTab from "@/src/lib/hook/useTab";
import { Lane, Side } from "@/src/lib/types/types";
import { FC } from "react";
import { Circle, Text } from "react-konva";

interface LvlsProps {
	side: Side;
	lane: Lane;
}

const Lvls: FC<LvlsProps> = ({ lane, side }) => {
	const {
		champs: { lvls },
	} = useTab();

	return (
		<>
			<Circle radius={15.18} fill={"#2b2b2b"} stroke={"#000000"} opacity={1} offsetY={-30.36} />
			<Text
				offsetX={(lvls[side][lane].toString().length === 2 ? 5.52 : 0) + 6.9}
				offsetY={(lvls[side][lane].toString().length === 2 ? -1.38 : 0) - 20.7}
				text={Math.floor(lvls[side][lane]).toString()}
				fontSize={lvls[side][lane].toString().length === 2 ? 21 : 24}
				fontStyle="bold"
				fill="#ffffff"
			/>
		</>
	);
};

export default Lvls;
