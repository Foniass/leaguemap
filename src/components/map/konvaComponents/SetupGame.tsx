"use client";

import { turretsPos } from "@/src/lib/mapData";
import { FC } from "react";
import Turret from "./Turret";
import WavesPoints from "./WavesPoints";
import { useDispatch, useSelector } from "react-redux";
import { getTurretEvent } from "@/src/lib/utils";
import { buildingsType, lanesType, teamsId } from "@/src/lib/types/types";
import useTab from "@/src/lib/hook/useTab";
import { RootState } from "@/src/lib/redux/store";
import { pushGameTurretEvent, resetGameTurretEvents } from "@/src/lib/redux/mapSlice/gameSlice";

interface TurretsGamesProps {}

const TurretsGames: FC<TurretsGamesProps> = ({}) => {
	const dispatch = useDispatch();

	const { timestampToDisplay, wavesRegions, turretsAlive } = useTab();

	const mapTab = useSelector((state: RootState) => state.Global.mapTab);
	const showWaves = useSelector((state: RootState) => state.Game.showWaves);

	return (
		<>
			{/* Turrets */}
			{teamsId.map((teamId, index1) =>
				lanesType.map((laneType, index2) =>
					buildingsType.map((buildingType, index3) => {
						const { usingPlates, value } = turretsAlive[teamId][laneType][buildingType];
						const { x, y } = turretsPos[teamId][laneType][buildingType];
						if (x === 0 && y === 0) return;
						return (
							<Turret
								key={`${index1}${index2}${index3}`}
								plates={usingPlates ? value : null}
								isTurret={buildingType === "INHIBITOR_BUILDING"}
								teamId={teamId}
								pos={{ x, y }}
								opacity={value > 0 ? 1 : 0.01}
								onClick={() => {
									if (mapTab === "Game") {
										if (turretsAlive[teamId][laneType][buildingType].value === 0)
											dispatch(resetGameTurretEvents({ buildingType, laneType, teamId }));
										else
											dispatch(pushGameTurretEvent(getTurretEvent(teamId, laneType, buildingType, timestampToDisplay)));
									}
								}}
							/>
						);
					})
				)
			)}

			{/* Waves */}
			{lanesType.map((laneType) => {
				if (showWaves[laneType])
					return <WavesPoints laneType={laneType} waveRegion={wavesRegions[laneType]} key={laneType} />;
			})}
		</>
	);
};

export default TurretsGames;
