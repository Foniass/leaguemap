"use client";

import { setPopupVisible } from "@/src/lib/redux/popupSlice";
import { RootState } from "@/src/lib/redux/store";
import { popupTypeToColor } from "@/src/lib/values/values";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

interface PopupProps {}

const Popup: FC<PopupProps> = ({}) => {
	const dispatch = useDispatch();

	const { message, type, visible } = useSelector((state: RootState) => state.popup);

	useEffect(() => {
		const autoClear = setTimeout(() => {
			if (visible) dispatch(setPopupVisible(false));
		}, 10000);
		return () => {
			clearTimeout(autoClear);
		};
	}, [dispatch, visible]);

	return (
		<>
			{visible && (
				<div className="relative z-50 flex items-center justify-center p-6 m-4 overflow-hidden text-xl font-bold text-white border-2 border-white popup-slide-in-from-left rounded-xl bg-slate-950 max-w-[30rem] text-center">
					<XMarkIcon
						className="absolute top-0 right-0 hover-zoom-110"
						width={30}
						onClick={() => dispatch(setPopupVisible(false))}
					/>

					<p style={{ color: popupTypeToColor[type] }}>{message}</p>
				</div>
			)}
		</>
	);
};

export default Popup;
