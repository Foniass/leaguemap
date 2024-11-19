"use client";

import { TeamId } from "@/src/lib/types/types";
import { Vector2d } from "konva/lib/types";
import { FC } from "react";
import { Circle, Group, Image as KonvaImage, Text } from "react-konva";
import useImage from "use-image";

interface TurretProps {
	pos: Vector2d;
	isTurret: boolean;
	plates: number | null;
	teamId: TeamId;
	onClick?: () => void;
	opacity?: number;
}

const Turret: FC<TurretProps> = ({ pos, isTurret, plates, teamId, onClick, opacity }) => {
	const [blueTurretImage] = useImage("/mapIcons/blueTurret.webp");
	const [redTurretImage] = useImage("/mapIcons/redTurret.webp");

	return (
		<Group x={pos.x} y={pos.y} onClick={onClick} opacity={opacity}>
			{isTurret ? (
				<Circle radius={26} fill={teamId === 100 ? "#08bcd4" : "#ff0404"} />
			) : (
				<KonvaImage
					image={teamId === 100 ? blueTurretImage : redTurretImage}
					scale={{ x: 0.4, y: 0.4 }}
					offsetX={64}
					offsetY={64}
				/>
			)}

			{plates !== null && (
				<Text
					fontSize={25}
					fontStyle="bold"
					fill="#ffffff"
					shadowColor="#000000"
					shadowBlur={2}
					shadowOpacity={1}
					text={plates.toString()}
					offsetX={8}
					offsetY={6}
				/>
			)}
		</Group>
	);
};

export default Turret;
