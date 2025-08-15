"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import ApiKeySection from "@/app/nulledbot/contents/ApiKeySection";

export default function AccountTab({
	session,
	openApiKey,
	setOpenApiKey,
	subscriptionType,
}) {
	return (
		<div className="flex flex-col items-center justify-center gap-1">
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.2 }}
			>
				<p
					className="text-amber-500 hover:text-shadow-xs hover:text-shadow-red-600 cursor-pointer animate-pulse flex gap-2"
					onClick={() => setOpenApiKey((prev) => !prev)}
					title="Show Api Key"
				>
					{session?.user?.username.toUpperCase()}
					<span className="text-white">({subscriptionType.toUpperCase()})</span>
				</p>
			</motion.div>

			<AnimatePresence mode="wait">
				{openApiKey && (
					<motion.div
						key="apiKeySection"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						<ApiKeySection username={session?.user?.username} />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
