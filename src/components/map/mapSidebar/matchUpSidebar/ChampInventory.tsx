"use client";

import SpriteImage from "@/src/components/ui/SpriteImage";
import useTab from "@/src/lib/hook/useTab";
import { distanceBetweenPoints } from "@/src/lib/pathfinding";
import { pushGameChampInventoryAction } from "@/src/lib/redux/mapSlice/gameSlice";
import { pushSimulationChampAction } from "@/src/lib/redux/mapSlice/simulationSlice";
import { RootState } from "@/src/lib/redux/store";
import { Lane, Side } from "@/src/lib/types/types";
import { getActualItems } from "@/src/lib/utils";
import { basesPos } from "@/src/lib/values/values";
import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from "uuid";

interface ChampInventoryProps {
	side: Side;
	lane: Lane;
}

const ChampInventory: FC<ChampInventoryProps> = ({ side, lane }) => {
	const dispatch = useDispatch();

	const {
		champs: { positions, inventoriesActions },
		timestampToDisplay,
	} = useTab();

	const mapTab = useSelector((state: RootState) => state.Global.mapTab);
	const champThatCanDoActions = useSelector((state: RootState) => state.Simulation.champThatCanDoActions);

	const timestampItems = mapTab === "Simulation" ? timestampToDisplay : Infinity;

	return (
		<div className="grid flex-grow h-full grid-cols-3 grid-rows-2 p-1 overflow-hidden border border-white rounded-md grid-flow-dense">
			{getActualItems(inventoriesActions[side][lane], timestampItems).map((itemKey) => {
				const isBase = distanceBetweenPoints(basesPos[side], positions[side][lane]) < 90;
				const canSell = mapTab === "Simulation" ? isBase : true;
				return (
					<SpriteImage
						id={itemKey}
						type="item"
						className={canSell ? "hover-zoom-110" : ""}
						key={v4()}
						onClick={() => {
							if (canSell) {
								if (
									mapTab === "Simulation" &&
									((!champThatCanDoActions && lane === "jungle") ||
										(champThatCanDoActions?.side === side && champThatCanDoActions?.lane === lane))
								)
									dispatch(
										pushSimulationChampAction({
											side,
											lane,
											action: {
												mapSide: null,
												travel: null,
												type: "Sell",
												itemKey,
											},
										})
									);
								if (mapTab === "Game")
									dispatch(
										pushGameChampInventoryAction({ side, lane, action: { itemKey, action: "Sell", timestamp: 0 } })
									);
							}
						}}
					/>
				);
			})}
		</div>
	);
};

export default ChampInventory;
