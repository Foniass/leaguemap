import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setChampionsData, setItemsData, setRiotVersion } from "../redux/riotSlice";
import { Lane } from "../types/types";
import { teamPositionToLane } from "../utils";
import { RiotState } from "../types/redux";

const useRiot = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		const main = async () => {
			try {
				const res = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json");
				const latestVersion = (res.data as string[])[0];
				if (latestVersion) {
					dispatch(setRiotVersion(latestVersion));
					try {
						const resChampionsData = await axios.get(
							`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`
						);
						const championsData: RiotState["championsData"] = resChampionsData.data.data;
						if (championsData) {
							let championsRates = {} as Record<
								string,
								{
									TOP: { playRate: number };
									JUNGLE: { playRate: number };
									MIDDLE: { playRate: number };
									BOTTOM: { playRate: number };
									UTILITY: { playRate: number };
								}
							>;

							try {
								const resChampionsRates = await axios.get("/api/wiki/championrates");
								championsRates = resChampionsRates.data;
							} catch (e) {}

							Object.entries(championsData ?? {}).forEach(([key, value]) => {
								const roles: Lane[] = [];
								Object.entries(championsRates[value?.key] ?? {}).forEach(([teamPosition, { playRate }]) => {
									if (playRate > 1) {
										roles.push(teamPositionToLane(teamPosition as Lane));
									}
								});
								const champData = championsData[key];
								if (champData) champData.roles = roles;
							});
							dispatch(setChampionsData(championsData));
						}
					} catch (e) {}
					try {
						const resItemsData = await axios.get(
							`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/item.json`
						);
						const itemsData = resItemsData.data.data;
						dispatch(setItemsData(itemsData));
					} catch (e) {}
				}
			} catch (error) {}
		};
		main();
	}, [dispatch]);
};
export default useRiot;
