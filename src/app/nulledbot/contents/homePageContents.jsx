"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { RogIconHome } from "@/app/nulledbot/icons/nulledbotIcons";
import { useRouter } from "next/navigation";
import HomeFooter from "@/app/nulledbot/contents/homeFooter";
import Subscription from "./tabs/subscriptions";

export default function HomePageContents() {
	const router = useRouter();
	const pricingRef = useRef(null);
	const howItWorksRef = useRef(null);
	const moreInfoRef = useRef(null);
	const homeRef = useRef(null);
	const faqRef = useRef(null);
	const [screenWidth, setScreenWidth] = useState(0);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setScreenWidth(window.innerWidth);

			const handleResize = () => {
				setScreenWidth(window.innerWidth);
			};

			window.addEventListener("resize", handleResize);

			return () => {
				window.removeEventListener("resize", handleResize);
			};
		}
	}, []);

	const faqs = [
		{
			question: "What is NulledBot?",
			answer:
				"NulledBot is a bot protection API for shortlinks, detecting proxies, VPNs, bots, and abuse in real-time.",
		},
		{
			question: "Do I need an API key?",
			answer:
				"Yes. All access to the service is authenticated using API keys linked to your account.",
		},
		{
			question: "How accurate is the detection?",
			answer:
				"We use multiple IP intelligence sources and user-agent heuristics to provide high-accuracy filtering.",
		},
	];

	const [hasScrolled, setHasScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setHasScrolled(window.scrollY > 50);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div className="cursor-default">
			<header className="sticky top-0 z-50 bg-black">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2, delay: 0.2 }}
					className="flex justify-center items-center relative"
				>
					<motion.div
						animate={{ x: hasScrolled ? -10 : 0 }}
						transition={{ type: "spring", stiffness: 120, damping: 20 }}
					>
						<button
							aria-label="Go to home section"
							onClick={() =>
								homeRef.current?.scrollIntoView({ behavior: "smooth" })
							}
						>
							<RogIconHome className="w-10 animate-pulse" />
						</button>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, width: 0 }}
						animate={
							hasScrolled
								? { opacity: 1, width: "auto" }
								: { opacity: 0, width: 0 }
						}
						transition={{ duration: 0.2 }}
						className="flex gap-2 md:gap-5 lg:gap-5 xl:gap-5 overflow-hidden whitespace-nowrap text-xs font-semibold"
						style={{ pointerEvents: hasScrolled ? "auto" : "none" }}
					>
						<button
							onClick={() =>
								howItWorksRef.current?.scrollIntoView({ behavior: "smooth" })
							}
							className="cursor-pointer hover:text-red-700 transition duration-300"
						>
							FEATURES
						</button>
						<button
							onClick={() =>
								pricingRef.current?.scrollIntoView({ behavior: "smooth" })
							}
							className="cursor-pointer hover:text-red-700 transition duration-300"
						>
							PRICING
						</button>
						<button
							onClick={() =>
								moreInfoRef.current?.scrollIntoView({ behavior: "smooth" })
							}
							className="cursor-pointer hover:text-red-700 transition duration-300"
						>
							HOW IT WORKS
						</button>
						<button
							onClick={() =>
								faqRef.current?.scrollIntoView({ behavior: "smooth" })
							}
							className="cursor-pointer hover:text-red-700 transition duration-300"
						>
							FAQ
						</button>
						<button
							onClick={() => router.push("/nulledbot/login")}
							className="hidden md:flex lg:flex xl:flex cursor-pointer hover:text-red-700 transition duration-300"
						>
							LOGIN
						</button>
					</motion.div>
				</motion.div>
			</header>

			<div
				className={`flex md:hidden lg:hidden xl:hidden bg-black fixed top-11 z-50 w-full transition duration-300 text-xs font-semibold mx-auto justify-center items-center ${
					hasScrolled ? "" : "opacity-0"
				}`}
			>
				<button
					onClick={() => router.push("/nulledbot/login")}
					className={`cursor-pointer hover:text-red-700 transition duration-300 w-max py-1`}
				>
					LOGIN
				</button>
			</div>

			<section
				ref={homeRef}
				className="relative min-h-screen px-8 text-center max-w-4xl mx-auto flex flex-col justify-center"
			>
				<motion.h1
					className="text-4xl font-bold mb-6"
					initial={{ y: 40, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
					Nulled<span className="text-red-700">Bot</span> — Stop Bots Before
					They Click
				</motion.h1>
				<motion.p
					className="text-base mb-12 max-w-2xl mx-auto"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
				>
					Powerful link protection API that blocks VPNs, proxies, datacenters,
					and scrapers.
				</motion.p>
			</section>

			<section
				ref={howItWorksRef}
				className="flex flex-col items-center justify-center min-h-screen px-8 max-w-5xl mx-auto"
			>
				<h2 className="text-2xl font-bold text-center mb-12">FEATURES</h2>
				<div className="grid md:grid-cols-3 gap-8">
					{[
						{
							title: "IP Intelligence",
							desc: "Detects VPNs, proxies, datacenters, and TOR using real-time data.",
						},
						{
							title: "User-Agent Filtering",
							desc: "Blocks known scrapers, headless browsers, and automation tools.",
						},
						{
							title: "Geo & Device Rules",
							desc: "Allow/block access by country, device type, or ISP.",
						},
					].map((feature, index) => (
						<motion.div
							key={index}
							className="ring-1 p-6 rounded-xl bg-gradient-to-br from-black/30 to-red-700/50 text-white"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.2, duration: 0.2 }}
							viewport={{ once: false }}
						>
							<h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
							<p className="text-sm text-white/60">{feature.desc}</p>
						</motion.div>
					))}
				</div>
			</section>

			<section
				ref={pricingRef}
				className="flex flex-col items-center justify-center min-h-screen px-8 max-w-6xl mx-auto text-center"
			>
				<Subscription />
			</section>

			<section
				ref={moreInfoRef}
				className="flex flex-col items-center justify-center min-h-screen px-8 max-w-5xl mx-auto text-left"
			>
				<h2 className="text-2xl font-bold text-center mb-12">HOW IT WORKS</h2>

				<div className="space-y-10 w-full">
					{[
						{
							title: "📡 API Route Info",
							content: (
								<>
									Make a{" "}
									<code className="bg-gray-700 px-2 py-1 rounded text-sm">
										/api/v1/nulledbot/[yourshortlinkkey]
									</code>{" "}
									request with headers{" "}
									<code className="bg-gray-700 px-2 py-1 rounded text-sm">
										x-api-key
									</code>{" "}
									and{" "}
									<code className="bg-gray-700 px-2 py-1 rounded text-sm ml-1">
										x-visitor-ip-asli
									</code>{" "}
									.
								</>
							),
						},
						{
							title: "🛡️ Filtering Info",
							content:
								"Filters are based on known VPN IPs, ASN databases, user-agent heuristics, and behavioral analysis. Pro and Enterprise plans include geo-IP, device type, and ISP filtering.",
						},
						{
							title: "⚙️ Feature Details",
							content: (
								<ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
									<li>Rate limit management via dashboard</li>
									<li>Webhook support for real-time event handling</li>
									<li>Custom filtering rules for Enterprise users</li>
								</ul>
							),
						},
						{
							title: "📚 Other Information",
							content:
								"Our infrastructure is built on global edge networks to ensure low-latency detection and high uptime. Enterprise users can request SLAs.",
						},
					].map((item, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.2, duration: 0.2 }}
							viewport={{ once: false }}
						>
							<h3 className="text-xl font-semibold mb-2">{item.title}</h3>
							{typeof item.content === "string" ? (
								<p className="text-gray-700 dark:text-gray-300 text-sm">
									{item.content}
								</p>
							) : (
								<div className="text-gray-700 dark:text-gray-300 text-sm">
									{item.content}
								</div>
							)}
						</motion.div>
					))}
				</div>
			</section>

			<section
				ref={faqRef}
				className="flex flex-col items-center justify-center min-h-screen px-8 max-w-4xl mx-auto"
			>
				<h2 className="text-2xl font-bold text-center mb-8">FAQ</h2>
				<div className="space-y-6">
					{faqs.map((item, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.1, duration: 0.2 }}
							viewport={{ once: false }}
							className="border-b border-gray-300 pb-4"
						>
							<h4 className="text-xl font-semibold">{item.question}</h4>
							<p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">
								{item.answer}
							</p>
						</motion.div>
					))}
				</div>
			</section>
			<HomeFooter homeRef={homeRef} />
		</div>
	);
}
