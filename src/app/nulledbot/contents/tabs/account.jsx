"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ApiKeySection from "@/app/nulledbot/contents/ApiKeySection";
import { FaBan, FaUser, FaUsers, FaUserSecret } from "react-icons/fa";
import Loading from "./loading";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";

export default function AccountTab({ session, subscriptionType }) {
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
		<motion.div className="flex flex-col items-center justify-center gap-6 p-6 bg-gradient-to-br from-black/30 to-red-700/50 rounded-xl shadow-lg ring-1 font-semibold">
			<div className="flex">
				<Accordion
					type="single"
					collapsible
					className="w-full flex items-center"
				>
					<AccordionItem value="apikey">
						<AccordionTrigger className="text-cyan-400 hover:text-cyan-300 cursor-pointer">
							<div className="flex items-center gap-1">
								<p className="text-cyan-400 text-lg tracking-wider flex gap-2 items-center">
									<span className="font-semibold">
										{session?.user?.username?.toUpperCase()}
									</span>
									<span className="text-amber-500">
										({subscriptionType?.toUpperCase()})
									</span>
								</p>
							</div>
						</AccordionTrigger>
						<AccordionContent>
							<ApiKeySection username={username} />
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>

			<motion.div
				transition={{ duration: 0.2, ease: "easeInOut" }}
				className="flex flex-col items-center justify-center gap-10 w-full bg-white/10 backdrop-blur-md p-6 rounded-lg ring-1"
			>
				<span className="text-center text-white flex flex-col gap-2 items-center">
					<FaUsers className="w-10 h-10 text-blue-400" />
					<span className="text-sm tracking-wider uppercase text-white/80">
						Total Visitors
					</span>
					{loading ? (
						<Loading className={"h-7 w-6"} />
					) : (
						<strong className="text-xl text-white">{visitorCount}</strong>
					)}
				</span>

				<div className="flex flex-col md:flex-row gap-8">
					<span className="text-center text-white flex flex-col gap-2 items-center">
						<FaUser className="w-10 h-10 text-emerald-400" />
						<span className="text-sm tracking-wider uppercase text-white/80">
							Humans
						</span>
						{loading ? (
							<Loading className={"h-7 w-6"} />
						) : (
							<strong className="text-xl text-white">{humanCount}</strong>
						)}
					</span>

					<span className="text-center text-white flex flex-col gap-2 items-center">
						<FaUserSecret className="w-10 h-10 text-black" />
						<span className="text-sm tracking-wider uppercase text-white/80">
							Bots
						</span>
						{loading ? (
							<Loading className={"h-7 w-6"} />
						) : (
							<strong className="text-xl text-white">{botCount}</strong>
						)}
					</span>

					<span className="text-center text-white flex flex-col gap-2 items-center">
						<FaBan className="w-10 h-10 text-red-700" />
						<span className="text-sm tracking-wider uppercase text-white/80">
							Blocked
						</span>
						{loading ? (
							<Loading className={"h-7 w-6"} />
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
