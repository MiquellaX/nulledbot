"use client";
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ApiKeySection from "@/app/nulledbot/contents/ApiKeySection";
import { FaBan, FaUser, FaUsers, FaUserSecret } from "react-icons/fa";
import Loading from "./loading";

export default function AccountTab({
	session,
	openApiKey,
	setOpenApiKey,
	subscriptionType,
}) {
	const [visitorCount, setVisitorCount] = useState(0);
	const [humanCount, setHumanCount] = useState(0);
	const [botCount, setBotCount] = useState(0);
	const [blockedCount, setBlockedCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const username = session?.user?.username;

	useEffect(() => {
		async function fetchApiKey() {
			if (!username) return;
			setLoading(true);
			setError("");
			try {
				const res = await fetch(
					`/api/account?username=${encodeURIComponent(username)}`
				);
				const data = await res.json();
				setVisitorCount(data.totalVisitors || 0);
				setHumanCount(data.humanCount || 0);
				setBotCount(data.botCount || 0);
				setBlockedCount(data.blockedCount || 0);
			} catch (err) {
				setError("Failed to fetch API key");
			}
			setLoading(false);
		}
		fetchApiKey();
	}, [username]);

	return (
		<motion.div
			layout
			className="flex flex-col items-center justify-center gap-6 p-6 bg-gradient-to-br from-black/30 to-red-700/50 rounded-xl shadow-lg border border-gray-800"
		>
			<motion.div
				layout
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.2 }}
			>
				<p
					className="text-cyan-400 text-lg tracking-wider hover:text-cyan-300 hover:drop-shadow-[0_0_6px_#22d3ee] transition duration-200 cursor-pointer flex gap-2 items-center"
					onClick={() => setOpenApiKey((prev) => !prev)}
					title="Show Api Key"
				>
					<span className="font-semibold">
						{session?.user?.username?.toUpperCase()}
					</span>
					<span className="text-amber-500">
						({subscriptionType?.toUpperCase()})
					</span>
				</p>
			</motion.div>

			<AnimatePresence mode="wait">
				{openApiKey && (
					<motion.div
						layout
						key="apiKeySection"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="w-full"
					>
						<ApiKeySection username={username} />
					</motion.div>
				)}
			</AnimatePresence>

			<motion.div
				layout
				transition={{ duration: 0.2, ease: "easeInOut" }}
				className="flex flex-col items-center justify-center gap-10 w-full bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/10"
			>
				<span className="text-center text-white flex flex-col gap-2 items-center">
					<FaUsers className="w-10 h-10 text-blue-400" />
					<span className="text-sm font-light tracking-wider uppercase text-white/80">
						Total Visitors
					</span>
					{loading ? (
						<Loading className={"h-6 w-6"} />
					) : (
						<strong className="text-xl text-white">{visitorCount}</strong>
					)}
				</span>
				<div className="flex flex-col md:flex-row gap-8">
					<span className="text-center text-white flex flex-col gap-2 items-center">
						<FaUser className="w-10 h-10 text-emerald-400" />
						<span className="text-sm font-light tracking-wider uppercase text-white/80">
							Humans
						</span>
						{loading ? (
							<Loading className={"h-6 w-6"} />
						) : (
							<strong className="text-xl text-white">{humanCount}</strong>
						)}
					</span>
					<span className="text-center text-white flex flex-col gap-2 items-center">
						<FaUserSecret className="w-10 h-10 text-black" />
						<span className="text-sm font-light tracking-wider uppercase text-white/80">
							Bots
						</span>
						{loading ? (
							<Loading className={"h-6 w-6"} />
						) : (
							<strong className="text-xl text-white">{botCount}</strong>
						)}
					</span>
					<span className="text-center text-white flex flex-col gap-2 items-center">
						<FaBan className="w-10 h-10 text-red-700" />
						<span className="text-sm font-light tracking-wider uppercase text-white/80">
							Blocked
						</span>
						{loading ? (
							<Loading className={"h-6 w-6"} />
						) : (
							<strong className="text-xl text-white">{blockedCount}</strong>
						)}
					</span>
				</div>
			</motion.div>

			{error && (
				<span className="text-red-500 text-sm font-medium mt-2">{error}</span>
			)}
		</motion.div>
	);
}
