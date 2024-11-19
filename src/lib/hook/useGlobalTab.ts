import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const useGlobalTab = () => {
	const mapTab = useSelector((state: RootState) => state.Global.mapTab);
	return useSelector((state: RootState) => state.Global[mapTab]);
};

export default useGlobalTab;
