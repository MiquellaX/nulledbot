import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaUsers, FaRobot, FaBan, FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import { confirmToast } from "@/lib/confirmToast";

export default function VisitorsModal({ data, shortlinkKey, onClose }) {
	const [visitors, setVisitors] = useState([]);
	const [loading, setLoading] = useState(true);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		if (!shortlinkKey) return;

		let intervalId;

		async function fetchVisitors() {
			try {
				const res = await fetch(`/api/visitors?key=${shortlinkKey}`);
				const data = await res.json();
				setVisitors(data.visitors || []);
				setLoading(false);
			} catch (err) {
				console.error("Failed to fetch visitors:", err);
				setLoading(false);
			}
		}

		fetchVisitors();
		intervalId = setInterval(fetchVisitors, 5000);
		return () => clearInterval(intervalId);
	}, [shortlinkKey]);

	async function handleDeleteLogs() {
		confirmToast({
			message:
				"Are you sure you want to delete all visitor logs for this shortlink?",
			onConfirm: async () => {
				setDeleting(true);
				try {
					const res = await fetch(`/api/visitors?key=${shortlinkKey}`, {
						method: "DELETE",
					});
					const data = await res.json();
					if (data.success) {
						setVisitors([]);
						toast.success("Visitor logs deleted successfully.");
					} else {
						toast.error("Failed to delete visitors");
					}
				} catch (err) {
					console.error("Delete failed:", err);
					toast.error("Delete failed due to error");
				}
				setDeleting(false);
			},
			onCancel: () => {
				toast("Delete cancelled.");
			},
		});
	}

	const totalVisitors = visitors.length;
	const botCount = visitors.filter((v) => v.isBot).length;
	const humanCount = visitors.filter((v) => !v.isBot).length;
	const blockedCount = visitors.filter((v) => v.isBlocked).length;

	const getDisplayUrl = () => {
		if (
			data?.primaryUrlStatus === "DEAD" ||
			data?.primaryUrlStatus === "RED FLAG"
		) {
			return data?.secondaryUrl || data?.url;
		}
		return data?.url;
	};

	return (
		<div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex p-4">
			<motion.div
				initial={{ y: -50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: -50, opacity: 0 }}
				className="bg-gradient-to-br from-black/30 to-red-700/50 border border-white rounded-lg w-full overflow-auto p-6 text-white"
			>
				<div className="flex gap-6 mb-5">
					<h3 className="text-sm lg:text-xl font-bold mb-4">
						Visitors for :{" "}
						<span className="text-blue-400">{getDisplayUrl()}</span>
					</h3>

					<button
						className={`cursor-pointer relative font-bold text-red-700 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[1.5px] after:bg-red-700 after:transition-all after:duration-300 hover:after:w-full mb-4 ${
							deleting ? "opacity-70 cursor-not-allowed" : ""
						} ${visitors.length === 0 ? "hidden" : ""}`}
						onClick={handleDeleteLogs}
						disabled={deleting}
					>
						{deleting ? (
							<svg
								className="w-6 h-6"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<circle cx="4" cy="12" r="3">
									<animate
										id="spinner_jObz"
										begin="0;spinner_vwSQ.end-0.25s"
										attributeName="r"
										dur="0.75s"
										values="3;.2;3"
									/>
								</circle>
								<circle cx="12" cy="12" r="3">
									<animate
										begin="spinner_jObz.end-0.6s"
										attributeName="r"
										dur="0.75s"
										values="3;.2;3"
									/>
								</circle>
								<circle cx="20" cy="12" r="3">
									<animate
										id="spinner_vwSQ"
										begin="spinner_jObz.end-0.45s"
										attributeName="r"
										dur="0.75s"
										values="3;.2;3"
									/>
								</circle>
							</svg>
						) : (
							"Clear Logs"
						)}
					</button>
				</div>
				<div className="flex justify-between items-center mb-4">
					{visitors.length === 0 ? null : (
						<div className="flex flex-col md:flex-row lg:flex-row xl:flex-row gap-6 justify-center font-semibold w-full">
							<div className="w-full flex flex-col items-center text-center p-4 ring-1 ring-white rounded-lg shadow-md hover:scale-105 transition-transform duration-300">
								<FaUsers className="text-cyan-400 text-4xl mb-2" />
								<p className="text-sm lg:text-lg text-gray-300">
									Total Visitors
								</p>
								<span className="text-cyan-500 text-xl lg:text-2xl font-bold">
									{totalVisitors}
								</span>
							</div>

							<div className="w-full flex flex-col items-center text-center p-4 ring-1 ring-white rounded-lg shadow-md hover:scale-105 transition-transform duration-300">
								<FaRobot className="text-red-700 text-4xl mb-2" />
								<p className="text-sm lg:text-lg text-gray-300">Bots</p>
								<span className="text-red-700 text-xl lg:text-2xl font-bold">
									{botCount}
								</span>
							</div>

							<div className="w-full flex flex-col items-center text-center p-4 ring-1 ring-white rounded-lg shadow-md hover:scale-105 transition-transform duration-300">
								<FaUsers className="text-green-600 text-4xl mb-2" />
								<p className="text-sm lg:text-lg text-gray-300">Humans</p>
								<span className="text-green-600 text-xl lg:text-2xl font-bold">
									{humanCount}
								</span>
							</div>

							<div className="w-full flex flex-col items-center text-center p-4 ring-1 ring-white rounded-lg shadow-md hover:scale-105 transition-transform duration-300">
								<FaBan className="text-red-700 text-4xl mb-2" />
								<p className="text-sm lg:text-lg text-gray-300">Blocked</p>
								<span className="text-red-700 text-xl lg:text-2xl font-bold">
									{blockedCount}
								</span>
							</div>
						</div>
					)}
				</div>

				<button onClick={onClose}>
					<FaTimes className="delete-icon absolute top-7 right-10" />
				</button>

				{loading ? (
					<div className="flex items-center justify-center h-64">
						<svg
							className="w-12 h-12 fill-white"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<circle cx="4" cy="12" r="3">
								<animate
									id="spinner_jObz"
									begin="0;spinner_vwSQ.end-0.25s"
									attributeName="r"
									dur="0.75s"
									values="3;.2;3"
								/>
							</circle>
							<circle cx="12" cy="12" r="3">
								<animate
									begin="spinner_jObz.end-0.6s"
									attributeName="r"
									dur="0.75s"
									values="3;.2;3"
								/>
							</circle>
							<circle cx="20" cy="12" r="3">
								<animate
									id="spinner_vwSQ"
									begin="spinner_jObz.end-0.45s"
									attributeName="r"
									dur="0.75s"
									values="3;.2;3"
								/>
							</circle>
						</svg>
					</div>
				) : visitors.length === 0 ? (
					<div className="flex items-center justify-center h-64 font-bold text-sm lg:text-xl">
						<p>No visitors logged yet.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-2">
						{visitors.map((v, i) => (
							<div
								key={i}
								className="ring-1 rounded-lg shadow-md p-4 hover:bg-white/10 transition-colors cursor-default"
							>
								<div className="flex flex-col xl:flex-row flex-wrap justify-between text-xs md:text-sm">
									<div className="flex flex-col mb-2">
										<span className="text-gray-400">Time</span>
										<span className="font-semibold">
											{new Date(v?.visitedAt).toLocaleString()}
										</span>
									</div>

									<div className="flex flex-col mb-2">
										<span className="text-gray-400">Device</span>
										<span className="font-semibold">
											{v?.device?.toUpperCase()}
										</span>
									</div>

									<div className="flex flex-col mb-2">
										<span className="text-gray-400">IP</span>
										<span className="font-semibold">
											{v?.ip?.toUpperCase()}
										</span>
									</div>

									<div className="flex flex-col mb-2">
										<span className="text-gray-400">ISP</span>
										<span className="font-semibold">
											{v?.location?.isp?.toUpperCase()}
										</span>
									</div>

									<div className="flex flex-col mb-2">
										<span className="text-gray-400">Country</span>
										<span className="font-semibold">
											{v?.location?.country?.toUpperCase()}
										</span>
									</div>

									<div className="flex flex-col mb-2">
										<span className="text-gray-400 mb-1">Flag</span>
										{v?.location?.flag_img && (
											<Image
												src={v.location.flag_img}
												alt={v.location.country || "Country"}
												width={32}
												height={20}
												className="rounded-sm w-10 h-auto"
											/>
										)}
									</div>

									<div className="flex flex-col mb-2">
										<span className="text-gray-400">Type</span>
										<span className="font-semibold">
											{v?.type?.toUpperCase()}
										</span>
									</div>

									<div className="flex flex-col mb-2">
										<span className="text-gray-400">Entity</span>
										<span
											className={
												v?.isBot
													? "text-red-700 font-semibold"
													: "text-green-600 font-semibold"
											}
										>
											{v?.isBot ? "BOT" : "HUMAN"}
										</span>
									</div>

									<div className="flex flex-col mb-2">
										<span className="text-gray-400">Blocked</span>
										<span
											className={
												v?.isBlocked
													? "text-red-700 font-semibold"
													: "text-green-600 font-semibold"
											}
										>
											{v?.isBlocked ? "YES" : "NO"}
										</span>
									</div>

									<div className="flex flex-col mb-2 w-full">
										<span className="text-gray-400">Reason</span>
										<span className="font-semibold">
											{v?.blockReason?.toUpperCase()}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</motion.div>
		</div>
	);
}
