"use client";

import { RootState } from "@/src/lib/redux/store";
import { FC } from "react";
import { useSelector } from "react-redux";
import ChampionsSidebar from "./ChampionsSidebar";

interface ChampionsSidebarHandlerProps {}

const ChampionsSidebarHandler: FC<ChampionsSidebarHandlerProps> = ({}) => {
	const mapTab = useSelector((state: RootState) => state.Global.mapTab);

	if (mapTab === "Review") {
		return (
			<div className="w-full h-full text-4xl font-bold text-center text-white">{"Indisponible en mode Review"}</div>
		);
	}

	return <ChampionsSidebar />;
};

export default ChampionsSidebarHandler;
