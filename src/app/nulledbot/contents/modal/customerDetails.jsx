import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

export default function CustomerInfoModal({ isOpen, onClose, onSubmit }) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [key, setKey] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit({ name, email, key });
		onClose();
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					key="modal"
					className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-5"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
				>
					<motion.div
						className="bg-[#0a0a0a] ring-1 ring-white rounded-2xl shadow-xl p-6 w-full max-w-md text-white"
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="flex justify-between">
							<h2 className="text-xl font-bold mb-4">Buyer SignUp</h2>
							<button type="button" onClick={onClose} className="mb-10">
								<FaTimes className="delete-icon" />
							</button>
						</div>
						<form onSubmit={handleSubmit} className="space-y-4">
							<input
								type="text"
								placeholder="Full Name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full border rounded-lg p-2"
								required
							/>
							<input
								type="email"
								placeholder="Email Address"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full border rounded-lg p-2"
								required
							/>
							<input
								type="password"
								placeholder="Account Key"
								value={key}
								onChange={(e) => setKey(e.target.value)}
								className="w-full border rounded-lg p-2"
								required
								autoComplete="off"
							/>
							<div className="flex justify-end gap-2">
								<button type="submit" className={`tombol hover:ring-green-600`}>
									Continue
								</button>
							</div>
						</form>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
