"use client";

import { formatTime, getActualItems } from "@/src/lib/utils";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChampIcon from "../../ChampIcon";
import { RootState } from "@/src/lib/redux/store";
import useCsByTime from "@/src/lib/hook/useCsByTime";
import { MatchTimelineDto, MatchTimelineInfoFrameParticipantFrame } from "@/src/lib/riotApi/endpoints/matchv5";
import { setReviewTimestampToDisplay } from "@/src/lib/redux/mapSlice/reviewSlice";
import { lanes, sides } from "@/src/lib/types/types";
import { v4 } from "uuid";
import SpriteImage from "@/src/components/ui/SpriteImage";

interface ReplaySidebarProps {
	matchTimelineDto: MatchTimelineDto;
}

const ReplaySidebar: FC<ReplaySidebarProps> = ({ matchTimelineDto }) => {
	const dispatch = useDispatch();

	const champIconSelected = useSelector((state: RootState) => state.Global.champIconSelected);

	const {
		timestampToDisplay,
		champs: { ids, puuids, inventoriesActions },
	} = useSelector((state: RootState) => state.Review);

	const [selectedParticipantData, setSelectedParticipantData] = useState<
		MatchTimelineInfoFrameParticipantFrame | undefined
	>(undefined);

	const { wave, cs } = useCsByTime();

	const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newTime = parseInt(e.target.value);
		dispatch(setReviewTimestampToDisplay(newTime));
	};

	useEffect(() => {
		if (champIconSelected) {
			const participantData = matchTimelineDto.info.participants?.find(
				(participant) => participant.puuid === puuids[champIconSelected.side][champIconSelected.lane]
			);
			if (!participantData) return;
			const participantId = participantData.participantId;

			const selectedParticipantData =
				matchTimelineDto.info.frames[Math.floor((timestampToDisplay * 1000) / matchTimelineDto.info.frameInterval)]
					?.participantFrames[participantId];
			setSelectedParticipantData(selectedParticipantData);
		}
	}, [
		champIconSelected,
		matchTimelineDto.info.frameInterval,
		matchTimelineDto.info.frames,
		matchTimelineDto.info.participants,
		puuids,
		timestampToDisplay,
	]);

	return (
		<div className="flex flex-col w-full h-full gap-4 font-bold">
			<div className="flex gap-4 h-[5%] items-center">
				<input
					type="range"
					id="time-cursor"
					name="time-cursor"
					min="0"
					max={(matchTimelineDto.info.frames.length - 1) * 60}
					value={timestampToDisplay}
					step={matchTimelineDto.info.frameInterval / 1000}
					onChange={handleTimeChange}
				/>
				<p>
					Temps: <span className="text-variable">{formatTime(timestampToDisplay)}</span>
				</p>
			</div>
			<div className="h-[15%] w-full flex flex-col justify-around">
				{sides.map((side) => {
					return (
						<div key={side} className="flex w-full gap-3">
							{lanes.map((lane, index) => {
								const champId = ids[side][lane];

								return (
									<ChampIcon key={`${lane}${side}`} champId={champId} side={side} lane={lane} displayLevel={true} />
								);
							})}
						</div>
					);
				})}
			</div>

			<div className="flex flex-col gap-3 h-[5%]">
				<p>
					Wave: <span className="text-variable">{wave}</span> | Sbires spawn:{" "}
					<span className="text-variable">{cs}</span>
					<Image src="/stats/cs.webp" alt="CS" width={40} height={40} className="inline" />
				</p>
			</div>
			{champIconSelected !== null && (
				<div className="h-[30%] w-full border-2 border-white rounded-lg flex p-4">
					<div className="w-[70%] flex flex-col gap-2">
						<ChampIcon
							champId={ids[champIconSelected.side][champIconSelected.lane]}
							side={champIconSelected.side}
							lane={champIconSelected.lane}
							cantBeLocked={true}
						/>
						<p>
							Gold: {selectedParticipantData?.currentGold}
							<Image src="/stats/gold.webp" alt="Gold" width={30} height={20} className="inline ml-1" /> (
							{selectedParticipantData?.totalGold}
							<Image src="/stats/gold.webp" alt="Gold" width={30} height={20} className="inline ml-1" />)
						</p>
						<p>Lvl: {selectedParticipantData?.level}</p>
						<p>
							Cs: {(selectedParticipantData?.minionsKilled ?? 0) + (selectedParticipantData?.jungleMinionsKilled ?? 0)}
							<Image src="/stats/cs.webp" alt="CS" width={25} height={25} className="inline" />
						</p>
						<div className="flex gap-1">
							{getActualItems(
								inventoriesActions[champIconSelected.side][champIconSelected.lane],
								timestampToDisplay
							).map((itemKey) => {
								return <SpriteImage key={v4()} id={itemKey} type="item" />;
							})}
						</div>
					</div>
					<div className="w-[30%] border-l-2 border-white grid grid-cols-2 grid-rows-4 text-end mr-4 pt-4">
						{(
							[
								{ src: "ad", alt: "AD", key: "attackDamage" },
								{ src: "ap", alt: "AP", key: "abilityPower" },
								{ src: "armor", alt: "Armor", key: "armor" },
								{ src: "mr", alt: "Magic Resist", key: "magicResist" },
								{ src: "ms", alt: "Movement Speed", key: "movementSpeed" },
							] as const
						).map(({ src, alt, key }) => (
							<div key={alt}>
								{selectedParticipantData?.championStats[key]}
								<Image src={`/stats/${src}.webp`} alt={alt} width={20} height={20} className="inline ml-1" />
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default ReplaySidebar;
