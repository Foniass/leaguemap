"use client";

import { resetSimulationSoft } from "@/src/lib/redux/mapSlice/simulationSlice";
import { RootState } from "@/src/lib/redux/store";
import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

interface ResetSimulationButtonProps {}

const ResetSimulationButton: FC<ResetSimulationButtonProps> = ({}) => {
	const dispatch = useDispatch();

	const mapTab = useSelector((state: RootState) => state.Global.mapTab);
	if (mapTab !== "Simulation") return;

	return (
		<div className={"w-full mb-2 flex justify-center"}>
			<button
				className={"px-3 py-2 bg-red-500 rounded-md text-white font-bold"}
				onClick={() => dispatch(resetSimulationSoft())}
			>
				Reset Simulation
			</button>
		</div>
	);
};

export default ResetSimulationButton;
