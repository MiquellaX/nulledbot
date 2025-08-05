"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { confirmToast } from "@/lib/confirmToast";
import { motion } from "framer-motion";

function KarmaAdminPageDashboardContents() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [users, setUsers] = useState([]);
	const [deletingUser, setDeletingUser] = useState(null);
	const [edits, setEdits] = useState({});

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const res = await fetch(`/api/karma`);
			if (!res.ok) throw new Error("Failed to fetch users");
			const data = await res.json();
			setUsers(data.users || []);
			const initialEdits = {};
			for (const user of data.users || []) {
				initialEdits[user.username] = {
					status: user.status || "waiting",
					subscription: user.subscription || "",
					subscriptionType: user.subscriptionType || "",
				};
			}
			setEdits(initialEdits);
		} catch (err) {
			setError(err.message || "Something went wrong");
			toast.error("Failed to fetch users.");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (username) => {
		confirmToast({
			message: `Are you sure you want to delete "${username}"?`,
			onConfirm: async () => {
				toast.promise(
					(async () => {
						setDeletingUser(username);
						const res = await fetch(`/api/karma?username=${username}`, {
							method: "DELETE",
						});
						const result = await res.json();
						if (!res.ok) throw new Error(result.error || "Failed to delete");
						setUsers((prev) => prev.filter((u) => u.username !== username));
						return result;
					})(),
					{
						loading: "Deleting...",
						success: `User "${username}" deleted`,
						error: (err) => `Failed: ${err.message}`,
					}
				);
				setDeletingUser(null);
			},
			onCancel: () => {
				toast("Deletion cancelled.");
			},
		});
	};

	const handleChange = (username, field, value) => {
		setEdits((prev) => ({
			...prev,
			[username]: {
				...prev[username],
				[field]: value,
			},
		}));
	};

	const handleSave = async (username) => {
		const { status, subscription, subscriptionType } = edits[username] || {};
		try {
			const res = await fetch("/api/karma", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username,
					status,
					subscription,
					subscriptionType,
				}),
			});
			if (!res.ok) throw new Error("Failed to update user");
			toast.success(`Updated ${username}`);
			fetchUsers();
		} catch (err) {
			toast.error(err.message);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center px-4 py-10 text-white">
			<motion.h1
				initial={{ opacity: 0, y: -30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="text-5xl mb-8"
			>
				Karma Admin Dashboard
			</motion.h1>

			{loading && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="my-8"
				>
					<svg
						className="w-8 h-8 fill-white"
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
				</motion.div>
			)}

			{error && (
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="text-red-500 font-medium mt-4"
				>
					Error: {error}
				</motion.p>
			)}

			{!loading && !error && users.length > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="w-full bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl"
				>
					<h2 className="text-2xl font-semibold mb-4 text-red-700">
						List of registered user
					</h2>
					<ul className="grid grid-cols-1 xl:grid-cols-2 gap-5">
						{users.map((user, idx) => (
							<motion.li
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: idx * 0.05 }}
								key={idx}
								className="p-5 rounded-lg bg-black/50 border border-white/10"
							>
								<div className="flex flex-col gap-5">
									<div className="flex flex-col md:flex-row lg:flex-row xl:flex-row gap-2 xl:gap-5">
										<div className="flex flex-col">
											<h1>
												<strong>Username</strong>
											</h1>
											<span>{user.username}</span>
										</div>

										<div className="flex flex-col">
											<p>
												<strong>API Key</strong>
											</p>
											<span>{user.apiKey || "N/A"}</span>
										</div>
									</div>
									<div className="flex flex-col md:flex-row lg:flex-row xl:flex-row gap-2 xl:gap-3">
										<div>
											<div className="flex flex-col">
												<label className="text-sm">Status:</label>
												<select
													value={edits[user.username]?.status || "waiting"}
													onChange={(e) =>
														handleChange(
															user.username,
															"status",
															e.target.value
														)
													}
													className="mt-1 border rounded bg-gray-900 px-2 py-1 text-white h-[35px]"
												>
													<option value="waiting">Waiting</option>
													<option value="approved">Approved</option>
													<option value="denied">Denied</option>
													<option value="expired">Expired</option>
												</select>
											</div>
										</div>
										<div>
											<div className="flex flex-col">
												<label className="text-sm">Subscription:</label>
												<select
													value={edits[user.username]?.subscription || ""}
													onChange={(e) =>
														handleChange(
															user.username,
															"subscription",
															e.target.value
														)
													}
													className="mt-1 border rounded bg-gray-900 px-2 py-1 text-white h-[35px]"
												>
													<option value="">Select duration</option>
													<option value="1minute">1 Minute</option>
													<option value="1day">1 Day</option>
													<option value="7day">7 Days</option>
													<option value="1month">1 Month</option>
													<option value="1year">1 Year</option>
												</select>
											</div>
										</div>

										<div>
											<div className="flex flex-col">
												<label className="text-sm">Type :</label>
												<select
													value={edits[user.username]?.subscriptionType}
													onChange={(e) =>
														handleChange(
															user.username,
															"subscriptionType",
															e.target.value
														)
													}
													className="mt-1 border rounded bg-gray-900 px-2 py-1 text-white h-[35px]"
												>
													<option value="">Unlimited</option>
													<option value="free">Free</option>
													<option value="pro">Pro</option>
													<option value="enterprise">Enterprise</option>
												</select>
											</div>
										</div>

										<div className="flex gap-2">
											<div className="mt-6">
												<button
													onClick={() => handleSave(user.username)}
													className="px-4 h-9 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-all"
												>
													Save
												</button>
											</div>
											<div className="mt-6">
												<button
													onClick={() => handleDelete(user.username)}
													className={`px-4 h-9 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-all ${
														deletingUser === user.username ? "opacity-50" : ""
													}`}
													disabled={deletingUser === user.username}
												>
													{deletingUser === user.username
														? "Deleting..."
														: "Delete"}
												</button>
											</div>
										</div>
									</div>
								</div>
							</motion.li>
						))}
					</ul>
				</motion.div>
			)}

			{!loading && !error && users.length === 0 && (
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="text-gray-400 mt-6"
				>
					No users found.
				</motion.p>
			)}
		</div>
	);
}

export default KarmaAdminPageDashboardContents;
