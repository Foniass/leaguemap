import { FC } from "react";
import { Group } from "react-konva";
import JungleRegions from "../regions/Jungle";
import RiverRegions from "../regions/River";
import LanesRegions from "../regions/Proxy";
import LaningPhaseRegions from "../regions/LaningPhase";
import useGlobalTab from "@/src/lib/hook/useGlobalTab";

interface RegionsProps {}

const Regions: FC<RegionsProps> = ({}) => {
	const { regions } = useGlobalTab();
	return (
		<Group>
			{regions.find((region) => region === "laningphase") && <LaningPhaseRegions />}
			{regions.find((region) => region === "jungle") && <JungleRegions />}
			{regions.find((region) => region === "river") && <RiverRegions />}
			{regions.find((region) => region === "proxy") && <LanesRegions />}
		</Group>
	);
};

export default Regions;
