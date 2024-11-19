"use client";

import SpriteImage from "@/src/components/ui/SpriteImage";
import useTab from "@/src/lib/hook/useTab";
import { pushGameChampInventoryAction } from "@/src/lib/redux/mapSlice/gameSlice";
import { pushSimulationChampActions } from "@/src/lib/redux/mapSlice/simulationSlice";
import { RootState } from "@/src/lib/redux/store";
import { Lane, Side } from "@/src/lib/types/types";
import { canBuyItem } from "@/src/lib/utils";
import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

interface ChampShopProps {
	side: Side;
	lane: Lane;
}

const ChampShop: FC<ChampShopProps> = ({ side, lane }) => {
	const dispatch = useDispatch();

	const {
		champs: { inventoriesActions, golds, inTheirBase },
		timestampToDisplay,
	} = useTab();

	const mapTab = useSelector((state: RootState) => state.Global.mapTab);

	const itemsData = useSelector((state: RootState) => state.riot.itemsData);

	if (mapTab === "Review") return;

	const timestampItems = mapTab === "Simulation" ? timestampToDisplay : Infinity;

	return (
		<div className="flex flex-col min-h-[8rem] max-h-[8rem]">
			<p className="py-1">Shop</p>
			<div className="flex flex-wrap flex-grow gap-1 overflow-auto border border-white custom-scrollbar">
				{itemsData &&
					Object.values(itemsData)
						.filter(
							(itemData) =>
								canBuyItem(itemsData, itemData, inventoriesActions[side][lane], golds[side][lane], timestampItems)
									.canBuy
						)
						.sort((a, b) => b.gold.total - a.gold.total)
						.map((itemData) => {
							const isBase = inTheirBase[side][lane];
							const { canBuy: canBeBought, inventoryActionsToDo } = canBuyItem(
								itemsData,
								itemData,
								inventoriesActions[side][lane],
								golds[side][lane],
								timestampItems
							);
							const canBuy = mapTab === "Simulation" ? isBase && canBeBought : canBeBought;

							return (
								<SpriteImage
									id={itemData.key}
									type="item"
									key={itemData.key}
									className={canBuy ? "hover-zoom-110" : ""}
									onClick={() => {
										if (canBuy) {
											if (mapTab === "Simulation")
												dispatch(
													pushSimulationChampActions({
														side,
														lane,
														actions: inventoryActionsToDo.map(({ action, itemKey }) => ({
															itemKey,
															mapSide: null,
															travel: null,
															type: action,
														})),
													})
												);
											if (mapTab === "Game")
												dispatch(
													pushGameChampInventoryAction({
														side,
														lane,
														action: { itemKey: itemData.key, action: "Buy", timestamp: 0 },
													})
												);
										}
									}}
								/>
							);
						})}
			</div>
		</div>
	);
};

export default ChampShop;
