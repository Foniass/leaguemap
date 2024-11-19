"use client";

import useTab from "@/src/lib/hook/useTab";
import { setGameShowLaneWave, setGameTimestampToDisplay, setGameWaveRegion } from "@/src/lib/redux/mapSlice/gameSlice";
import { setReviewTimestampToDisplay } from "@/src/lib/redux/mapSlice/reviewSlice";
import { RootState } from "@/src/lib/redux/store";
import { LaneType, isLane, lanesType } from "@/src/lib/types/types";
import { capitalizeFirstLetter, secondsToMinutesString } from "@/src/lib/utils";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";

interface GlobalCursorsProps {}

const GlobalCursors: FC<GlobalCursorsProps> = ({}) => {
	const dispatch = useDispatch();

	const { timestampToDisplay } = useTab();

	const mapTab = useSelector((state: RootState) => state.Global.mapTab);

	const { wavesRegions, showWaves } = useSelector((state: RootState) => state.Game);

	const matchTimelineDto = useSelector((state: RootState) => state.Review.matchTimelineDto);

	const handleWaveRegionChange = (e: React.ChangeEvent<HTMLInputElement>, laneType: LaneType) => {
		const waveRegionIndex = parseInt(e.target.value);
		const payload = { laneType, newWaveRegionIndex: waveRegionIndex as 1 | 2 | 3 };
		dispatch(setGameWaveRegion(payload));
	};

	return (
		<>
			{(mapTab === "Game" || mapTab === "Review") && (
				<div className={"w-full mb-2 flex flex-col font-bold"}>
					<div className="grid grid-cols-2 gap-x-4 gap-y-2">
						<div className="flex justify-end">
							<input
								type="range"
								id="time-cursor"
								name="time-cursor"
								min="0"
								max={mapTab === "Review" && matchTimelineDto ? (matchTimelineDto.info.frames.length - 1) * 60 : 1800}
								value={timestampToDisplay}
								step={mapTab === "Review" && matchTimelineDto ? matchTimelineDto.info.frameInterval / 1000 : 30}
								onChange={(e) => {
									const newTimestampToDisplay = Math.floor(parseInt(e.target.value));
									if (mapTab === "Game") dispatch(setGameTimestampToDisplay(newTimestampToDisplay));
									if (mapTab === "Review") dispatch(setReviewTimestampToDisplay(newTimestampToDisplay));
								}}
							/>
						</div>
						<p>
							Temps: <span className="text-variable">{secondsToMinutesString(timestampToDisplay)}</span>
						</p>
						{mapTab === "Game" &&
							lanesType.map((laneType) => {
								const lane = laneType.split("_")[0]?.toLocaleLowerCase();
								if (lane === undefined || !isLane(lane ?? "")) return;
								return (
									<>
										<div className="flex justify-end">
											<input
												type="range"
												id={`wave${lane}-cursor`}
												name={`wave${lane}-cursor`}
												min="1"
												max="3"
												value={parseInt(wavesRegions[laneType][1] ?? "")}
												step="1"
												onChange={(e) => handleWaveRegionChange(e, laneType)}
											/>
										</div>
										<div className="flex gap-2">
											<button
												className="p-1 border border-white rounded-xl"
												onClick={() => {
													dispatch(setGameShowLaneWave({ laneType, boolean: !showWaves[laneType] }));
												}}
											>
												{showWaves[laneType] ? <XMarkIcon className="w-4" /> : <CheckIcon className="w-4" />}
											</button>
											<p>
												Wave {capitalizeFirstLetter(lane)}:{" "}
												<span className="text-variable">{wavesRegions[laneType]}</span>
											</p>
										</div>
									</>
								);
							})}
					</div>
				</div>
			)}
		</>
	);
};

export default GlobalCursors;
