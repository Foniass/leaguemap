import { useState } from "react";
import Modal from "react-modal";
import { modalStyle } from "../values/values";

const useValidationModal = (title: string, onYes: () => any) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const ModalReturned = (
		<Modal
			isOpen={isModalOpen}
			onRequestClose={() => setIsModalOpen(false)}
			contentLabel={title}
			style={modalStyle}
			ariaHideApp={false}
		>
			<div className="flex flex-col items-center gap-4 ">
				<h2 className="text-2xl font-bold">{title}</h2>
				<div className="flex gap-2 text-xl">
					<button
						className="px-4 py-2 rounded-lg hover-zoom-110"
						onClick={() => {
							setIsModalOpen(false);
							onYes();
						}}
						type="button"
						style={{ backgroundColor: "#22c55e" }}
					>
						Oui
					</button>
					<button
						className="px-4 py-2 rounded-lg hover-zoom-110"
						onClick={() => setIsModalOpen(false)}
						type="button"
						style={{ backgroundColor: "#ef4444" }}
					>
						Non
					</button>
				</div>
			</div>
		</Modal>
	);
	return { Modal: ModalReturned, setIsModalOpen };
};

export default useValidationModal;
