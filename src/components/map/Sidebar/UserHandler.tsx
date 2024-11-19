"use client";

import { FC } from "react";
import Image from "next/image";
import useBinds from "@/src/lib/hook/useBinds";
import { useSession } from "next-auth/react";
import { GoogleSignInButton, SignOutButton } from "@/src/components/ui/authButtons";

interface UserHandlerProps {
	className?: string;
}

const UserHandler: FC<UserHandlerProps> = ({ className }) => {
	const session = useSession();
	useBinds(session.data);
	const sessionUser = session.data?.user;

	return (
		<div className={className}>
			{/* LOGIN / RIOT */}
			{/* USER */}
			{sessionUser ? (
				<div className="flex flex-col gap-3">
					<div className="flex items-center justify-center gap-4">
						{sessionUser.image && (
							<Image
								src={sessionUser?.image}
								alt="Image de l'utilisateur"
								width={40}
								height={40}
								className="rounded-xl"
							/>
						)}
						<p className="text-xl">{sessionUser.name}</p>
					</div>
					<div className="flex items-center justify-center">
						<SignOutButton />
					</div>
				</div>
			) : (
				<div className="flex items-center justify-center ">
					<GoogleSignInButton />
				</div>
			)}
		</div>
	);
};

export default UserHandler;
