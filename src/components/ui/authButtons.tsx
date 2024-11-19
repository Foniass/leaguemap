"use client";

import Image from "next/image";
import { FC } from "react";
import { signIn, signOut } from "next-auth/react";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";

interface GoogleSignInButtonProps {}

export const GoogleSignInButton: FC<GoogleSignInButtonProps> = ({}) => {
	const handleClick = () => {
		signIn("google");
	};
	return (
		<button
			onClick={handleClick}
			className="flex items-center justify-center w-full px-6 mt-6 text-base font-semibold text-black transition-colors duration-300 bg-white border-2 border-black rounded-lg h-14 focus:shadow-outline hover:bg-slate-200 hover-zoom-110"
		>
			<Image src="https://authjs.dev/img/providers/google.svg" alt="Google Logo" width={20} height={20} />
			<span className="ml-4">Continuer avec Google</span>
		</button>
	);
};

interface SignOutButtonProps {}

export const SignOutButton: FC<SignOutButtonProps> = ({}) => {
	const handleClick = () => {
		signOut();
	};
	return (
		<button
			onClick={handleClick}
			className="flex items-center justify-center h-10 px-1 text-sm font-semibold text-black transition-colors duration-300 bg-white border-2 border-black rounded-lg w-25 focus:shadow-outline hover:bg-slate-200 hover-zoom-110"
		>
			<ArrowLeftOnRectangleIcon className="w-5 h-5" />
			<span className="ml-4">Déconnexion</span>
		</button>
	);
};
