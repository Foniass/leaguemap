"use client";

import { FC, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BindButton from "./BindButton";
import { RootState } from "@/src/lib/redux/store";
import { useSession } from "next-auth/react";
import { bindButtons } from "@/src/lib/values/values";
import { BindKey, isBindKey } from "@/src/lib/types/types";
import { setUserBind } from "@/src/lib/redux/userSlice";
import axios from "axios";
import { setPopup } from "@/src/lib/redux/popupSlice";
import useSafeKeyDown from "@/src/lib/hook/useSafeKeyDown";

interface MapSettingsProps {}

const MapSettings: FC<MapSettingsProps> = () => {
	const session = useSession();

	const dispatch = useDispatch();

	const binds = useSelector((state: RootState) => state.user.binds);

	const [bindWaiting, setBindWaiting] = useState<BindKey | null>(null);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (bindWaiting) {
				dispatch(setUserBind({ bind: bindWaiting, value: event.key }));
				if (session.data?.user?.email) {
					try {
						axios.post("/api/mongodb/users/setBind", {
							email: session.data?.user?.email,
							bindKey: bindWaiting,
							bindValue: event.key,
						});
					} catch (error) {
						dispatch(setPopup({ message: "Erreur lors de la sauvegarde du bind", type: "error" }));
					}
				}
				setBindWaiting(null);
			}
		},
		[bindWaiting, dispatch, session.data?.user?.email]
	);

	useSafeKeyDown(handleKeyDown);

	return (
		<div className="grid grid-cols-2 gap-5 p-6">
			{bindButtons.map((bindButton, index) => {
				const bindButtonAction = bindButton.action;
				if (!isBindKey(bindButtonAction)) return;
				return (
					<BindButton
						onClick={() => {
							if (!bindButton.keyBind) setBindWaiting(bindButtonAction);
						}}
						keyBind={bindButton.keyBind || binds[bindButtonAction]}
						isWaitingForKey={bindWaiting === bindButtonAction}
						key={index}
					>
						{bindButton.icon1 && <bindButton.icon1 width={18} className="inline" />}
						{bindButton.icon2 && <bindButton.icon2 width={18} className="inline" />}
						{!bindButton.icon1 && !bindButton.icon2 && <p className="inline">{bindButtonAction}: </p>}
					</BindButton>
				);
			})}
		</div>
	);
};

export default MapSettings;
