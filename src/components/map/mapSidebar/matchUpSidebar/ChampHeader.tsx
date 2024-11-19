"use client";

import { Lane, Side } from "@/src/lib/types/types";
import { FC } from "react";
import ChampIcon from "../../ChampIcon";
import Image from "next/image";
import useTab from "@/src/lib/hook/useTab";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/lib/redux/store";
import { pushSimulationChampAction, setSimulationChampPosition } from "@/src/lib/redux/mapSlice/simulationSlice";
import { setGlobalChampIconSelected } from "@/src/lib/redux/mapSlice/globalSlice";
import { setGameChampPosition } from "@/src/lib/redux/mapSlice/gameSlice";
import { setReviewChampPosition } from "@/src/lib/redux/mapSlice/reviewSlice";
import { basesPos } from "@/src/lib/values/values";
import useInventoriesActionsFct from "@/src/lib/hook/champ/useInventoriesActionsFct";

interface ChampHeaderProps {
	side: Side;
	lane: Lane;
}

const ChampHeader: FC<ChampHeaderProps> = ({ side, lane }) => {
	const dispatch = useDispatch();

	const {
		champs: { ids },
	} = useTab();

	const { getChampMs } = useInventoriesActionsFct();

	const mapTab = useSelector((state: RootState) => state.Global.mapTab);
	const champThatCanDoActions = useSelector((state: RootState) => state.Simulation.champThatCanDoActions);
	const championKey = ids[side][lane];

	return (
		<div className="flex items-center w-full gap-4 text-2xl font-bold">
			<ChampIcon key={`${side}`} champId={championKey} side={side} lane={lane} cantBeLocked={true} />
			<Image
				src="/champActions/Recall.webp"
				alt="Recall League of Legends"
				width={40}
				height={40}
				className="border border-white rounded-lg hover-zoom-110"
				onClick={() => {
					dispatch(setGlobalChampIconSelected({ lane, side }));
					switch (mapTab) {
						case "Simulation":
							if (
								champThatCanDoActions &&
								lane !== "jungle" &&
								(champThatCanDoActions.side !== side || champThatCanDoActions.lane !== lane)
							)
								break;
							dispatch(setSimulationChampPosition({ lane, side, position: basesPos[side] }));
							dispatch(
								pushSimulationChampAction({
									side,
									lane,
									action: { travel: null, type: "Recall", mapSide: null, itemKey: null },
								})
							);
							break;
						case "Game":
							dispatch(setGameChampPosition({ lane, side, position: basesPos[side] }));
							break;
						case "Review":
							dispatch(setReviewChampPosition({ lane, side, position: basesPos[side] }));
							break;
					}
				}}
			/>
			<p className="inline text-lg">
				{getChampMs(side, lane)}
				<Image src="/stats/ms.webp" alt="ms" width={24} height={16} className="inline ml-1" />
			</p>
		</div>
	);
};

export default ChampHeader;
