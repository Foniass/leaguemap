"use client";

import { RootState } from "@/src/lib/redux/store";
import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import useConnectionModal from "@/src/lib/hook/useConnectionModal";
import { mapTabs } from "@/src/lib/types/types";
import { setGlobalMapTab } from "@/src/lib/redux/mapSlice/globalSlice";

interface MapTabsProps {
	className?: string;
}

const MapTabs: FC<MapTabsProps> = ({ className }) => {
	const dispatch = useDispatch();

	const { mapTab } = useSelector((state: RootState) => state.Global);

	const [modal, checkConnected] = useConnectionModal("Vous devez être connecté !");

	return (
		<div className={className + " flex gap-1 pl-4"}>
			{mapTabs.map((tabName) => {
				return (
					<button
						type="button"
						className={`rounded-lg flex justify-center items-center px-3 py-1  ${
							mapTab === tabName ? "bg-tabbg border-white border" : "bg-slate-950"
						}`}
						key={tabName}
						onClick={() => {
							if (checkConnected()) dispatch(setGlobalMapTab(tabName));
						}}
					>
						<p> {tabName}</p>
					</button>
				);
			})}
			{modal}
		</div>
	);
};

export default MapTabs;
