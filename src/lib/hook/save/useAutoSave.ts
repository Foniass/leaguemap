import { useEffect, useRef } from "react";
import useSave from "./useSave";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const useAutoSave = () => {
	const { saveCurrentMap } = useSave();
	const globalId = useSelector((state: RootState) => state.Global.id);

	const saveInterval = useRef<NodeJS.Timeout>();

	useEffect(() => {
		if (saveInterval.current) clearInterval(saveInterval.current);
		saveCurrentMap();
		saveInterval.current = setInterval(() => {
			saveCurrentMap();
		}, 5000);

		return () => {
			if (saveInterval.current) clearInterval(saveInterval.current);
		};
	}, [saveCurrentMap, globalId]); // Dependency only on saveCurrentMap and Global.id
};

export default useAutoSave;
