"use client";

import { FC, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import SpriteImage from "../../../ui/SpriteImage";
import Image from "next/image";
import ChampIcon from "../../ChampIcon";
import { RootState } from "@/src/lib/redux/store";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/outline";
import { createRandomSetup } from "@/src/lib/utils";
import { Lane, lanes, sides } from "@/src/lib/types/types";
import useTab from "@/src/lib/hook/useTab";
import {
	setGameChampId,
	setGameChampsIds,
	setGameChampsPositions,
	setGameDeathsData,
	setGameTimestampToDisplay,
	setGameTurretsEvents,
	setGameWavesRegions,
} from "@/src/lib/redux/mapSlice/gameSlice";
import { setSimulationChampId, setSimulationChampsIds } from "@/src/lib/redux/mapSlice/simulationSlice";

interface ChampionsSidebarProps {}

const ChampionsSidebar: FC<ChampionsSidebarProps> = ({}) => {
	const dispatch = useDispatch();

	const {
		champs: { ids },
	} = useTab();

	const { mapTab, champIconSelected } = useSelector((state: RootState) => state.Global);

	const championsData = useSelector((state: RootState) => state.riot.championsData);

	const [inputValue, setInputValue] = useState<string>("");
	const [roleFilter, setRoleFilter] = useState<Lane | null>(null);

	const champsLockedGame = useSelector((state: RootState) => state.Game.champs.locked);
	const champsLockedSimulation = useSelector((state: RootState) => state.Simulation.champs.locked);
	const champsLocked =
		mapTab === "Game" ? champsLockedGame : mapTab === "Simulation" ? champsLockedSimulation : undefined;

	useEffect(() => {
		setRoleFilter(champIconSelected?.lane ? champIconSelected?.lane : null);
	}, [champIconSelected]);

	const setRandomSetup = useCallback(() => {
		if (mapTab === "Review") return;

		const {
			randomChampionsIds,
			randomChampsPositions,
			randomDeathsData,
			randomTime,
			randomTurretsEvents,
			randomWavesRegions,
		} = createRandomSetup(championsData, ids, champsLocked);

		if (mapTab === "Game") {
			dispatch(setGameChampsIds({ champsIds: randomChampionsIds, championsData }));
			dispatch(setGameTimestampToDisplay(randomTime));
			dispatch(setGameTurretsEvents(randomTurretsEvents));
			dispatch(setGameWavesRegions(randomWavesRegions));
			dispatch(setGameChampsPositions(randomChampsPositions));
			dispatch(setGameDeathsData(randomDeathsData));
		}
		if (mapTab === "Simulation") dispatch(setSimulationChampsIds({ championsData, champsIds: randomChampionsIds }));
	}, [championsData, champsLocked, dispatch, ids, mapTab]);

	return (
		<div className="flex flex-col w-full h-full gap-1 ">
			<div className="h-[15%] w-full flex">
				<div className="flex flex-col justify-around w-2/3 h-full">
					{sides.map((side) => {
						return (
							<div key={side} className="flex w-full gap-3">
								{lanes.map((lane) => {
									const champId = ids[side][lane];
									return <ChampIcon key={`${lane}${side}`} champId={champId} side={side} lane={lane} />;
								})}
							</div>
						);
					})}
				</div>
				{mapTab === "Game" && (
					<div className="flex items-center justify-center w-1/3 h-full">
						<button className="w-16 h-16 p-2 border-2 rounded-xl hover-zoom-110" onClick={setRandomSetup}>
							<ArrowPathRoundedSquareIcon className="w-full f-full" />
						</button>
					</div>
				)}
			</div>

			<input onChange={(e) => setInputValue(e.target.value)} type="text" className="pl-1 h-[3%] text-black" />
			<div className="flex gap-5 h-[5%]">
				{lanes.map((lane) => {
					return (
						<button
							key={lane}
							type="button"
							onClick={() => setRoleFilter(lane === roleFilter ? null : lane)}
							className={roleFilter === lane ? "border-b-2" : ""}
						>
							<Image src={`/roles/${lane}.webp`} alt={lane} width={32} height={32} />
						</button>
					);
				})}
			</div>
			<div className="flex flex-col justify-start h-[77%]  overflow-auto custom-scrollbar">
				<div className="flex flex-wrap justify-start gap-1">
					{championsData &&
						Object.values(championsData).map((champData) => {
							let isNameMatch = true;
							inputValue
								.toLocaleLowerCase()
								.split("")
								.forEach((inputLetter) => {
									if (!champData.name.toLocaleLowerCase().includes(inputLetter)) isNameMatch = false;
								});
							let isRoleMatch = true;
							if (roleFilter && !champData.roles.find((champRole) => champRole === roleFilter)) isRoleMatch = false;

							return (
								<SpriteImage
									type="champion"
									key={champData.id}
									id={champData.key}
									className={
										!isNameMatch || !isRoleMatch
											? "hidden"
											: champIconSelected?.side && ids[champIconSelected.side][champIconSelected.lane] === champData.key
											? "border-2 border-white hover-zoom-110"
											: "hover-zoom-110"
									}
									onClick={() => {
										if (champIconSelected && mapTab !== "Review") {
											const { side, lane } = champIconSelected;
											const newChampKey = ids[side][lane] === champData.key ? null : champData.key;
											if (mapTab === "Game") dispatch(setGameChampId({ side, lane, id: newChampKey, championsData }));
											if (mapTab === "Simulation")
												dispatch(setSimulationChampId({ side, lane, id: newChampKey, championsData }));
										}
									}}
								/>
							);
						})}
				</div>
			</div>
		</div>
	);
};

export default ChampionsSidebar;
