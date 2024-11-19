"use client";

import useTab from "@/src/lib/hook/useTab";
import { Lane, Side } from "@/src/lib/types/types";
import { FC } from "react";
import { Text } from "react-konva";

interface DeathTimerProps {
	side: Side;
	lane: Lane;
}

const DeathTimer: FC<DeathTimerProps> = ({ side, lane }) => {
	const {
		champs: { respawnsTimes },
	} = useTab();

	if (!respawnsTimes[side][lane]) return <></>;

	const respawnTime = Math.ceil(respawnsTimes[side][lane]);

	return (
		<Text
			offsetX={(respawnTime.toString().length === 2 ? 5.52 : 0) + 15}
			offsetY={(respawnTime.toString().length === 2 ? 1.38 : 0) + 16}
			text={respawnTime.toString()}
			fontSize={respawnTime.toString().length === 2 ? 35 : 40}
			fontStyle="bold"
			fill="#ffffff"
			shadowColor="#000000"
			shadowBlur={2}
			shadowOpacity={1}
		/>
	);
};

export default DeathTimer;
