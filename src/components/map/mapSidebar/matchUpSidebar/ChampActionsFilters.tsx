"use client";

import { Lane, Side, champActionsFilters } from "@/src/lib/types/types";
import { FC } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { setGlobalChampIconSelected, setGlobalChampsActionsFilter } from "@/src/lib/redux/mapSlice/globalSlice";
import { setSimulationChampActions } from "@/src/lib/redux/mapSlice/simulationSlice";
import { TrashIcon } from "@heroicons/react/24/outline";
import { RootState } from "@/src/lib/redux/store";

interface ChampActionsFiltersProps {
	side: Side;
	lane: Lane;
}

const ChampActionsFilters: FC<ChampActionsFiltersProps> = ({ lane, side }) => {
	const dispatch = useDispatch();

	const { mapTab, champsActionsFilter } = useSelector((state: RootState) => state.Global);
	const champThatCanDoActions = useSelector((state: RootState) => state.Simulation.champThatCanDoActions);

	if (mapTab !== "Simulation") return;

	return (
		<div className="flex justify-between">
			<div className="flex gap-3">
				{champActionsFilters.map((filter) => (
					<div key={filter} className={filter === champsActionsFilter[side] ? "border-b-2" : ""}>
						<button
							onClick={() => {
								if (filter !== champsActionsFilter[side]) dispatch(setGlobalChampsActionsFilter({ side, filter }));
								else dispatch(setGlobalChampsActionsFilter({ side, filter: null }));
							}}
							className={"h-10 hover-zoom-110"}
						>
							{filter === "Travel" ? (
								<Image src="/stats/ms.webp" alt="ms" width={24} height={16} />
							) : filter === "Camp" ? (
								<Image src="/roles/jungle.webp" alt="Jungle" width={24} height={16} />
							) : (
								<Image src="/stats/gold.webp" alt="Gold" width={24} height={16} />
							)}
						</button>
					</div>
				))}
			</div>
			{side === champThatCanDoActions?.side && lane === champThatCanDoActions?.lane && (
				<button
					className="relative flex flex-col gap-1 p-1 mr-1 border rounded-lg hover-zoom-110"
					onClick={() => {
						dispatch(setGlobalChampIconSelected({ lane, side }));
						dispatch(
							setSimulationChampActions({
								side,
								lane,
								actions: [],
							})
						);
					}}
				>
					<TrashIcon className="w-8" />
				</button>
			)}
		</div>
	);
};

export default ChampActionsFilters;
