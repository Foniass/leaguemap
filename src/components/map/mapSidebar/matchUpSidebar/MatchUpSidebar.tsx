"use client";

import { FC } from "react";
import GlobalCursors from "./GlobalCursors";
import ChampCursors from "./ChampCursors";
import ChampHeader from "./ChampHeader";
import ChampAssets from "./ChampAssets";
import ChampInventory from "./ChampInventory";
import ChampShop from "./ChampShop";
import ChampActions from "./ChampActions";
import ChampActionsFilters from "./ChampActionsFilters";
import { useSelector } from "react-redux";
import { RootState } from "@/src/lib/redux/store";
import ResetSimulationButton from "./ResetSimulationButton";

interface MatchUpSidebarProps {}

const MatchUpSidebar: FC<MatchUpSidebarProps> = ({}) => {
	const lastChampIconSelected = useSelector((state: RootState) => state.Global.lastChampIconSelected);

	return (
		<div className="flex flex-col w-full h-full">
			<ResetSimulationButton />
			<GlobalCursors />
			<div className="flex-grow overflow-hidden">
				<div className="flex w-full h-full gap-3 font-bold">
					{(["blue", null, "red"] as const).map((side, index) => {
						const lane = lastChampIconSelected.lane;
						let tempLvl = 1;
						if (side === null) return <div className="w-0 border"></div>;
						return (
							<div key={index} className="flex flex-col flex-grow-[10000] w-full h-full gap-2 overflow-hidden">
								<ChampHeader side={side} lane={lane} />
								<ChampCursors side={side} lane={lane} />
								<div className="flex w-full gap-1">
									<ChampAssets side={side} lane={lane} />
									<ChampInventory side={side} lane={lane} />
								</div>
								<ChampShop side={side} lane={lane} />
								<ChampActionsFilters side={side} lane={lane} />
								<ChampActions side={side} lane={lane} tempLvl={tempLvl} />
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default MatchUpSidebar;
