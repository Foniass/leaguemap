import { useEffect } from "react";

const useSafeKeyDown = (callback: (event: KeyboardEvent) => any) => {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.repeat) return;
			callback(event);
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [callback]);
};

export default useSafeKeyDown;
