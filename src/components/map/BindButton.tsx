"use client";

import { FC, ReactNode } from "react";

interface BindButtonProps {
	isWaitingForKey: boolean;
	children: ReactNode;
	keyBind: null | string;
	onClick?: () => void;
}

const BindButton: FC<BindButtonProps> = ({ isWaitingForKey, children, keyBind, onClick }) => {
	return (
		<button
			onClick={onClick}
			type="button"
			className="inline-block px-4 py-2 text-xl border-2 border-black rounded-lg bg-arrowbuttonbg hover-zoom-110"
		>
			{isWaitingForKey ? (
				<p>{"Attente d'une touche"}</p>
			) : keyBind ? (
				<p>
					{children} {keyBind}
				</p>
			) : (
				<p>{children} Appuyer pour bind</p>
			)}
		</button>
	);
};

export default BindButton;
