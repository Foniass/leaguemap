"use client";

import { FC } from "react";
import SpriteImage from "../ui/SpriteImage";
import { useDispatch, useSelector } from "react-redux";
import { sideColors } from "@/src/lib/values/values";
import Image from "next/image";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import { Lane, Side } from "@/src/lib/types/types";
import useTab from "@/src/lib/hook/useTab";
import { setGlobalChampIconSelected } from "@/src/lib/redux/mapSlice/globalSlice";
import { RootState } from "@/src/lib/redux/store";
import { setGameChampLocked } from "@/src/lib/redux/mapSlice/gameSlice";
import { setSimulationChampLocked } from "@/src/lib/redux/mapSlice/simulationSlice";

interface ChampIconProps {
	champId: string | null;
	side: Side;
	lane: Lane;
	cantBeLocked?: boolean;
	displayLevel?: boolean;
}

const ChampIcon: FC<ChampIconProps> = ({ champId, side, lane, cantBeLocked, displayLevel }) => {
	const dispatch = useDispatch();

	const {
		champs: { respawnsTimes, lvls },
	} = useTab();

	const { mapTab, champIconSelected } = useSelector((state: RootState) => state.Global);

	const isSelected = champIconSelected?.side === side && champIconSelected?.lane === lane;

	const champsLockedGame = useSelector((state: RootState) => state.Game.champs.locked);
	const champsLockedSimulation = useSelector((state: RootState) => state.Simulation.champs.locked);
	const champsLocked = mapTab === "Game" ? champsLockedGame : mapTab === "Simulation" ? champsLockedSimulation : null;

	return (
		<div>
			{champId ? (
				<SpriteImage
					id={champId}
					type="champion"
					className={`${isSelected ? "border-2" : "border"} relative rounded-md hover-zoom-110 ${
						respawnsTimes[side][lane] ? "grayscale" : ""
					}`}
					onClick={() => dispatch(setGlobalChampIconSelected({ side, lane }))}
					borderColor={sideColors[side]}
				>
					{!!respawnsTimes[side][lane] && (
						<p className="absolute text-3xl text-white shadow-xl absolute-center">
							{Math.ceil(respawnsTimes[side][lane])}
						</p>
					)}
				</SpriteImage>
			) : (
				<Image
					src={`/roles/${lane}.webp`}
					alt={lane}
					className={`${isSelected ? "border-2" : "border"} rounded-md hover-zoom-110`}
					width={48}
					height={48}
					onClick={() => dispatch(setGlobalChampIconSelected({ side, lane }))}
					style={{ borderColor: `${sideColors[side]}` }}
				/>
			)}

			{!cantBeLocked && champsLocked !== null && (
				<div
					className="absolute p-1 translate-x-8 border rounded-full -translate-y-14 bg-slate-800 hover-zoom-110"
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						if (mapTab === "Game") dispatch(setGameChampLocked({ side, lane, locked: !champsLocked[side][lane] }));
						if (mapTab === "Simulation")
							dispatch(setSimulationChampLocked({ side, lane, locked: !champsLocked[side][lane] }));
					}}
				>
					{champsLocked[side][lane] ? <LockClosedIcon className="w-4 h-4 " /> : <LockOpenIcon className="w-4 h-4 " />}
				</div>
			)}

			{displayLevel && (
				<div className="absolute w-6 h-6 translate-x-8 -translate-y-3 border rounded-full bg-slate-800">
					<p
						className={`absolute`}
						style={{
							translate: "transform",
							transform: `translate( ${lvls[side][lane].toString().length === 1 ? "0.35" : "0.1"}rem, -0.08rem)`,
						}}
					>
						{lvls[side][lane]}
					</p>
				</div>
			)}
		</div>
	);
};

export default ChampIcon;
