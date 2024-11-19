import { useSession } from "next-auth/react";
import { useState } from "react";
import ReactModal from "react-modal";
import { mainbg } from "../colors";
import { GoogleSignInButton } from "@/src/components/ui/authButtons";

const useConnectionModal = (info: string): [JSX.Element, () => boolean] => {
	const session = useSession();
	const [modalIsOpen, setIsOpen] = useState(false);

	const checkConnected = (): boolean => {
		if (!session.data) {
			setIsOpen(true);
			return false;
		} else {
			return true;
		}
	};

	const closeModal = () => {
		setIsOpen(false);
	};

	const customStyles = {
		overlay: {
			backgroundColor: "rgba(44, 48, 50, 0.5)",
		},
		content: {
			top: "50%",
			left: "50%",
			right: "auto",
			bottom: "auto",
			marginRight: "-50%",
			transform: "translate(-50%, -50%)",
			width: "30%",
			height: "30%",
			backgroundColor: mainbg,
			color: "#ffffff",
		},
	};

	const modal = (
		<ReactModal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} ariaHideApp={false}>
			<div className="flex flex-col items-center justify-center w-full h-full">
				<p className="text-2xl font-bold text-center">
					{info || "Vous devez vous connecter pour accéder à cette fonctionnalitée"}
				</p>
				<GoogleSignInButton />
			</div>
		</ReactModal>
	);

	return [modal, checkConnected];
};

export default useConnectionModal;
