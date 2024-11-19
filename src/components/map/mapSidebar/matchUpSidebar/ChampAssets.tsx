"use client";

import { FC } from "react";
import Image from "next/image";
import useTab from "@/src/lib/hook/useTab";
import { Lane, Side } from "@/src/lib/types/types";

interface ChampAssetsProps {
	side: Side;
	lane: Lane;
}

const ChampAssets: FC<ChampAssetsProps> = ({ lane, side }) => {
	const {
		champs: { lvls, golds },
	} = useTab();

	return (
		<div className="flex flex-col items-start justify-center w-20 gap-4 py-5">
			<p>Lvl: {Math.floor(lvls[side][lane])}</p>
			<p>
				{Math.floor(golds[side][lane])}
				<Image src="/stats/gold.webp" alt="Gold" width={24} height={16} className="inline ml-1" />
			</p>
		</div>
	);
};

export default ChampAssets;
