import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
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

	return (
		<div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex p-4">
			<motion.div
				initial={{ y: -50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: -50, opacity: 0 }}
				className="bg-black border border-white rounded-lg w-full overflow-auto p-6 text-white"
			>
				<h3 className="text-sm lg:text-xl font-bold mb-4">
					Visitors for : {data?.url}
				</h3>
				<div className="flex justify-between items-center mb-4">
					<button
						className={`w-full max-w-[100px] flex justify-center items-center bg-red-700 hover:bg-red-800 text-black p-2 rounded transition-all duration-300 cursor-pointer ${
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

					<button onClick={onClose}>
						<FaTimes className="delete-icon absolute top-7 right-7" />
					</button>
				</div>

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
								className="bg-gray-900 rounded-lg shadow-md p-4 hover:bg-gray-800 transition-colors"
							>
								<div className="flex flex-col xl:flex-row flex-wrap justify-between text-xs md:text-sm">
									<div className="flex flex-col mb-2">
										<span className="text-gray-400">Time</span>
										<span>{new Date(v?.visitedAt).toLocaleString()}</span>
									</div>

									<div className="flex flex-col mb-2">
										<span className="text-gray-400">Device</span>
										<span>{v?.device?.toUpperCase()}</span>
									</div>

									<div className="flex flex-col mb-2">
										<span className="text-gray-400">IP</span>
										<span>{v?.ip?.toUpperCase()}</span>
									</div>

									<div className="flex flex-col mb-2">
										<span className="text-gray-400">ISP</span>
										<span>{v?.location?.isp?.toUpperCase()}</span>
									</div>

									<div className="flex flex-col mb-2">
										<span className="text-gray-400">Country</span>
										<span>{v?.location?.country?.toUpperCase()}</span>
									</div>

									<div className="flex flex-col mb-2">
										<span className="text-gray-400">Flag</span>
										{v?.location?.flag_img && (
											<Image
												src={v.location.flag_img}
												alt={v.location.country || "Country"}
												width={32}
												height={20}
												className="rounded-sm"
											/>
										)}
									</div>

									<div className="flex flex-col mb-2">
										<span className="text-gray-400">Type</span>
										<span>{v?.type?.toUpperCase()}</span>
									</div>

									<div className="flex flex-col mb-2">
										<span className="text-gray-400">Entity</span>
										<span
											className={v?.isBot ? "text-red-700" : "text-green-600"}
										>
											{v?.isBot ? "BOT" : "HUMAN"}
										</span>
									</div>

									<div className="flex flex-col mb-2">
										<span className="text-gray-400">Blocked</span>
										<span
											className={
												v?.isBlocked ? "text-red-700" : "text-green-600"
											}
										>
											{v?.isBlocked ? "YES" : "NO"}
										</span>
									</div>

									<div className="flex flex-col mb-2 w-full">
										<span className="text-gray-400">Reason</span>
										<span>{v?.blockReason?.toUpperCase()}</span>
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
