"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaGithub, FaFacebook, FaTelegram, FaTimes } from "react-icons/fa";
import { RogIconHome } from "../icons/nulledbotIcons";
import Link from "next/link";
import { useRouter } from "next/navigation";

const modalContentStatic = {
	terms: {
		title: "Terms of Service",
		body: "By using NulledBot, you agree to use it responsibly and remain solely responsible for ensuring your actions comply with all applicable laws and regulations.",
	},
	privacy: {
		title: "Privacy Policy",
		body: "We are committed to protecting your privacy. No personal data is collected or stored without your explicit consent.",
	},
	about: {
		title: "About Us",
		body: "NulledBot is a cutting-edge web security platform designed to detect, mitigate, and block malicious bot traffic.",
	},
	contact: {
		title: "Contact Us",
		body: (
			<div className="flex justify-center gap-6 text-xl text-zinc-400 p-10">
				<Link
					href="https://github.com/MiquellaX/nulledbot"
					target="_blank"
					rel="noreferrer"
				>
					<FaGithub className="w-7 h-7 fill-white hover:fill-amber-500 transition duration-300" />
				</Link>
				<Link href="#" rel="noreferrer">
					<FaFacebook className="w-7 h-7 fill-white hover:fill-blue-600 transition duration-300" />
				</Link>
				<Link href="#" rel="noreferrer">
					<FaTelegram className="w-7 h-7 fill-white hover:fill-cyan-700 transition duration-300" />
				</Link>
			</div>
		),
	},
	status: {
		title: "System Status",
		body: null,
	},
};

function Modal({
	isVisible,
	onClose,
	title,
	body,
	statusSystem,
	loadingStatus,
}) {
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					<motion.div
						className="ring-1 bg-gradient-to-br from-black to-red-900 text-white max-w-md w-full p-6 rounded-lg shadow-xl relative"
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.95, opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						<h2 className="text-xl font-bold mb-2 flex">
							{title}
							{statusSystem !== undefined && (
								<span
									className={`ml-2 ${
										statusSystem === "LIVE" ? "text-green-600" : "text-red-700"
									}`}
								>
									{loadingStatus ? (
										<svg
											className="w-6 h-6 fill-white mt-1"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<circle cx="4" cy="12" r="3">
												<animate
													id="spinner1"
													begin="0;spinner3.end-0.25s"
													attributeName="r"
													dur="0.75s"
													values="3;.2;3"
												/>
											</circle>
											<circle cx="12" cy="12" r="3">
												<animate
													begin="spinner1.end-0.6s"
													attributeName="r"
													dur="0.75s"
													values="3;.2;3"
												/>
											</circle>
											<circle cx="20" cy="12" r="3">
												<animate
													id="spinner3"
													begin="spinner1.end-0.45s"
													attributeName="r"
													dur="0.75s"
													values="3;.2;3"
												/>
											</circle>
										</svg>
									) : (
										statusSystem
									)}
								</span>
							)}
						</h2>
						<div className="text-sm text-zinc-300">
							{typeof body === "string" ? (
								<div dangerouslySetInnerHTML={{ __html: body }} />
							) : (
								body
							)}
						</div>
						<button
							onClick={onClose}
							className="absolute top-3 right-4 text-zinc-500 hover:text-white text-xl"
							aria-label="Close modal"
						>
							<FaTimes className="close-icon" />
						</button>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

export default function HomeFooter() {
	const [activeModal, setActiveModal] = useState(null);
	const [isModalVisible, setModalVisible] = useState(false);
	const [statusSystem, setStatusSystem] = useState(null);
	const [statusBodyHtml, setStatusBodyHtml] = useState(null);
	const [loadingStatus, setLoadingStatus] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (activeModal === "status") {
			setLoadingStatus(true);
			setStatusSystem(null);
			setStatusBodyHtml(null);
			fetch("/system/status")
				.then((res) => res.json())
				.then((data) => {
					setStatusSystem(data.status || "Unknown");
					setStatusBodyHtml(data.body || "Unknown");
				})
				.catch(() => {
					setStatusSystem("Unavailable");
					setStatusBodyHtml("Unable to fetch system status at this time.");
				})
				.finally(() => setLoadingStatus(false));
		}
	}, [activeModal]);

	const openModal = (key) => {
		setActiveModal(key);
		setModalVisible(true);
	};

	const closeModal = () => {
		setModalVisible(false);
		setTimeout(() => setActiveModal(null), 200);
	};

	const links = [
		{ label: "Terms of Service", key: "terms" },
		{ label: "Privacy Policy", key: "privacy" },
		{ label: "About Us", key: "about" },
		{ label: "Contact Us", key: "contact" },
		{ label: "System Status", key: "status" },
	];

	const currentModal = modalContentStatic[activeModal] || {};
	const modalBody =
		activeModal === "status" ? statusBodyHtml : currentModal.body;

	return (
		<>
			<motion.div
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				transition={{ duration: 1 }}
				viewport={{ once: false }}
			>
				<footer className="bg-transparent text-white py-12 px-6 md:px-16 mt-20 border-t border-red-700/30">
					<div className="max-w-7xl mx-auto space-y-8">
						<div className="text-center space-y-2">
							<div className="flex flex-col justify-center items-center">
								<button
									aria-label="Go to home section"
									onClick={() => router.push("#")}
								>
									<RogIconHome className="w-16 h-16 xl:w-20 xl:h-20 -mt-10" />
								</button>
								<h2 className="text-3xl -mt-3 font-semibold">
									Nulled<span className="text-red-700">Bot</span>
								</h2>
							</div>
							<p className="text-zinc-500 text-sm italic">
								"Providing intelligent access control. Unauthorized or automated
								usage is subject to restriction."
							</p>
						</div>

						<div className="flex flex-wrap justify-center items-center gap-6 text-xs text-zinc-400">
							{links.map((link) => (
								<button
									key={link.key}
									onClick={() => openModal(link.key)}
									className="relative font-bold text-white cursor-pointer after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[1.5px] after:bg-red-700 after:transition-all after:duration-300 hover:after:w-full"
								>
									{link.label}
								</button>
							))}
						</div>

						<div className="text-center text-[11px] text-zinc-500 space-y-2">
							<p>
								NulledBot is provided “as is” with no warranties. We do not
								endorse or support any malicious or illegal use of this service.
								Responsibility for compliance remains with the user.
							</p>
						</div>

						<div className="text-center text-[12px] text-zinc-600 border-t border-red-700/30 pt-4">
							&copy; {new Date().getFullYear()} Nulled
							<span className="text-red-600">Bot</span> Inc. All rights
							reserved.
						</div>
					</div>
				</footer>
			</motion.div>

			<Modal
				isVisible={isModalVisible}
				onClose={closeModal}
				title={currentModal.title}
				body={modalBody}
				statusSystem={activeModal === "status" ? statusSystem : undefined}
				loadingStatus={activeModal === "status" ? loadingStatus : false}
			/>
		</>
	);
}
