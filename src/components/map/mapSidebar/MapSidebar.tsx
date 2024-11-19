"use client";

import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import MatchUpSidebar from "./matchUpSidebar/MatchUpSidebar";
import HistoriqueSidebar from "./HistoriqueSidebar";
import ReplaySidebarHandler from "./replaySidebar/ReplaySidebarHandler";
import { sidebarTabs } from "@/src/lib/types/types";
import { setGlobalSidebarTab } from "@/src/lib/redux/mapSlice/globalSlice";
import { RootState } from "@/src/lib/redux/store";
import ChampionsSidebarHandler from "./championsSidebar/ChampionsSidebarHandler";
import MapTabs from "../MapTabs";
import { tabsData } from "@/src/lib/values/values";

interface MapSidebarProps {
	className: string;
}

const MapSidebar: FC<MapSidebarProps> = ({ className }) => {
	const dispatch = useDispatch();

	const { mapTab, sidebarTab } = useSelector((state: RootState) => state.Global);

	return (
		<div className={` flex flex-col ${className}`}>
			<MapTabs className="mb-1" />
			<div className="flex w-full gap-1 pl-4">
				{sidebarTabs.map((tabName) => {
					const isPickable = tabsData[mapTab].usableSidebarTabs.includes(tabName);
					return (
						<button
							type="button"
							className={`rounded-tl-lg rounded-tr-lg flex justify-center items-center px-3 py-1  ${
								sidebarTab === tabName ? "bg-tabbg border-white border-x border-t" : "bg-slate-950"
							} ${!isPickable && "opacity-50 cursor-not-allowed"}`}
							key={uuidv4()}
							onClick={() => {
								if (isPickable) dispatch(setGlobalSidebarTab(tabName));
							}}
						>
							{tabName}
						</button>
					);
				})}
			</div>
			<div className="flex-grow w-full px-4 py-2 overflow-hidden border border-white bg-tabbg rounded-xl">
				{sidebarTab === "Champions" && <ChampionsSidebarHandler />}
				{sidebarTab === "MatchUp" && <MatchUpSidebar />}
				{sidebarTab === "Historique" && <HistoriqueSidebar />}
				{sidebarTab === "Replay" && <ReplaySidebarHandler />}
			</div>
		</div>
	);
};

export default MapSidebar;
