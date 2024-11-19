"use client";

import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { capitalizeFirstLetter } from "@/src/lib/utils";
import { Lane, Side } from "@/src/lib/types/types";
import { RootState } from "@/src/lib/redux/store";
import { setGameChampAssists, setGameChampKills, setGameChampLasthit } from "@/src/lib/redux/mapSlice/gameSlice";

interface ChampCursorsProps {
	side: Side;
	lane: Lane;
}

const ChampCursors: FC<ChampCursorsProps> = ({ side, lane }) => {
	const dispatch = useDispatch();

	const { lasthit, kills, assists } = useSelector((state: RootState) => state.Game.champs);

	const mapTab = useSelector((state: RootState) => state.Global.mapTab);

	if (mapTab !== "Game") return;

	return (
		<div className="flex flex-col gap-2">
			<div className="flex justify-between">
				<input
					type="range"
					id="lasthit-cursor"
					name="lasthit-cursor"
					min="0"
					max="100"
					value={Math.floor(lasthit[side][lane] * 100)}
					step="1"
					onChange={(e) => {
						const lasthit = Math.floor(parseInt(e.target.value)) / 100;
						dispatch(setGameChampLasthit({ lane, side, lasthit }));
					}}
				/>
				<p>Lasthit: {lasthit[side][lane] * 100}%</p>
			</div>
			{(
				[
					{ name: "kills", fct: setGameChampKills, teamData: kills },
					{ name: "assists", fct: setGameChampAssists, teamData: assists },
				] as const
			).map((cursor) => (
				<div className="flex gap-4" key={cursor.name}>
					<div className="flex gap-1">
						{["-", "+"].map((buttonName) => {
							return (
								<button
									key={buttonName}
									className="w-8 text-white border border-white rounded-md bg-slate-800 hover-zoom-110"
									onClick={() => dispatch(cursor.fct({ lane, side, diff: buttonName === "-" ? -1 : 1 }))}
								>
									{buttonName}
								</button>
							);
						})}
					</div>
					<p>
						{cursor.teamData[side][lane]} {capitalizeFirstLetter(cursor.name)}
					</p>
				</div>
			))}
		</div>
	);
};

export default ChampCursors;
