import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const useTab = () => {
	const mapTab = useSelector((state: RootState) => state.Global.mapTab);
	const Game = useSelector((state: RootState) => state.Game);
	const Review = useSelector((state: RootState) => state.Review);
	const Simulation = useSelector((state: RootState) => state.Simulation);
	const allTabs = { Game, Review, Simulation };

	return allTabs[mapTab];
};

export default useTab;
