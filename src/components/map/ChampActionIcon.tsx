import { FC } from "react";
import Image from "next/image";
import { sideColors } from "@/src/lib/values/values";
import SpriteImage from "../ui/SpriteImage";
import { ChampAction, isChampActionCamp } from "@/src/lib/types/actions";
import { Side } from "@/src/lib/types/types";

interface ChampActionIconProps {
	champAction: ChampAction;
	champSide: Side;
	className?: string;
}

const ChampActionIcon: FC<ChampActionIconProps> = ({ champAction, className, champSide }) => {
	const { type: champActionType } = champAction;
	return (
		<>
			{champActionType === "Buy" || champActionType === "Sell" ? (
				<SpriteImage
					id={champAction.itemKey}
					type="item"
					className={`inline border-2 rounded-md relative ${className} ${
						champActionType === "Sell" ? "grayscale" : ""
					}`}
					style={{
						borderColor: "#bbbdbb",
					}}
				>
					<Image src={`/stats/gold.webp`} alt={champActionType} className={"absolute-center"} width={28} height={28} />
				</SpriteImage>
			) : (
				<Image
					src={`/champActions/${champActionType.replace(" ", "")}.webp`}
					alt={champActionType}
					className={`inline border-2 rounded-md ${className}`}
					width={48}
					height={48}
					style={{
						borderColor: `${
							isChampActionCamp(champAction)
								? sideColors[champAction.mapSide === null ? champSide : champAction.mapSide]
								: "#bbbdbb"
						}`,
					}}
				/>
			)}
		</>
	);
};

export default ChampActionIcon;
