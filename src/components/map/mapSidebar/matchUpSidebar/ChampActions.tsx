"use client";

import {
	delSimulationForcedModifById,
	pushSimulationForcedModif,
	setSimulationChampActions,
} from "@/src/lib/redux/mapSlice/simulationSlice";
import { isChampActionShopType, isChampActionTravelType } from "@/src/lib/types/actions";
import { Lane, Side, isCamp } from "@/src/lib/types/types";
import { secondsToMinutesString, xpToLevel } from "@/src/lib/utils";
import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from "uuid";
import ChampActionIcon from "../../ChampActionIcon";
import TextInput from "@/src/components/ui/TextInput";
import Image from "next/image";
import { RootState } from "@/src/lib/redux/store";

interface ChampActionsProps {
	side: Side;
	lane: Lane;
	tempLvl: number;
}

const ChampActions: FC<ChampActionsProps> = ({ side, lane, tempLvl }) => {
	const dispatch = useDispatch();

	const champThatCanDoActions = useSelector((state: RootState) => state.Simulation.champThatCanDoActions);
	const champsActionsToDisplay = useSelector((state: RootState) => state.Simulation.champs.actionsToDisplay);

	const champActionsToDisplay = champsActionsToDisplay[side][lane];

	const { mapTab, champsActionsFilter } = useSelector((state: RootState) => state.Global);

	if (mapTab !== "Simulation") return;

	return (
		<div className="flex flex-col flex-grow gap-1 overflow-auto custom-scrollbar">
			{champActionsToDisplay.map((champAction) => {
				const { type, time: timeSpent, started, ended, id } = champAction;

				const isLvlUp = ended && tempLvl !== Math.floor(xpToLevel(champAction.xpPostAction));
				if (ended) tempLvl = Math.floor(xpToLevel(champAction.xpPostAction));
				if (champsActionsFilter[side] === "Camp" && !isCamp(type)) return;
				if (champsActionsFilter[side] === "Travel" && !isChampActionTravelType(type)) return;
				if (champsActionsFilter[side] === "Shop" && !isChampActionShopType(type)) return;

				if (
					!champThatCanDoActions ||
					side !== champThatCanDoActions.side ||
					(lane !== champThatCanDoActions.lane && !started)
				)
					return;

				return (
					<div
						key={v4()}
						className={`w-full relative p-2 rounded-sm ${started ? "" : "grayscale"}`}
						style={{ backgroundColor: `${side === "blue" ? "#1e293b" : "#450a0a"}` }}
					>
						{champThatCanDoActions && side === champThatCanDoActions.side && lane === champThatCanDoActions.lane && (
							<span
								className="absolute cursor-pointer -top-1 right-1"
								onClick={() => {
									const newChampActions = [...champActionsToDisplay].filter(({ id: idIterate }) => idIterate !== id);
									dispatch(setSimulationChampActions({ side, lane, actions: newChampActions }));
									dispatch(delSimulationForcedModifById(champAction.id));
								}}
							>
								×
							</span>
						)}
						<div className="flex w-full gap-2">
							<ChampActionIcon className="w-12" champAction={champAction} champSide={side} />
							{started && (
								<div className="flex flex-col w-max">
									<p>
										{secondsToMinutesString(champAction.startTimestamp)} {"=>"}{" "}
										{ended ? secondsToMinutesString(champAction.startTimestamp + champAction.time) : "?"}
									</p>
									<p>
										(
										{ended ? (
											champThatCanDoActions &&
											side === champThatCanDoActions.side &&
											lane === champThatCanDoActions.lane ? (
												<TextInput
													value={timeSpent}
													setValue={(newValue: string) => {
														const newTime = parseInt(newValue);
														dispatch(pushSimulationForcedModif({ time: newTime, id }));
													}}
												/>
											) : (
												<span>{timeSpent}</span>
											)
										) : (
											<span>{"?"}</span>
										)}
										s){" "}
										<span style={{ color: isLvlUp ? "#63f542" : "" }}>
											LvL {ended ? Math.floor(xpToLevel(champAction.xpPostAction)) : "?"}
										</span>
										{"  "}
										{ended ? Math.floor(champAction.goldPostAction) : "?"}
										<Image src="/stats/gold.webp" alt="Gold" width={24} height={16} className="inline ml-1" />
									</p>
								</div>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default ChampActions;
