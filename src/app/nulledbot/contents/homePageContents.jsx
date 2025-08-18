"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import HomeFooter from "@/app/nulledbot/contents/homeFooter";
import Subscription from "./tabs/subscriptions";
import HomeHeader from "./tabs/homeHeader";
import HowItWorks from "./tabs/howItWorks";
import Feature from "./tabs/feature";
import Faq from "./tabs/faq";

export default function HomePageContents() {
	const router = useRouter();
	const pricingRef = useRef(null);
	const featureRef = useRef(null);
	const howItWorksRef = useRef(null);
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
			<HomeHeader
				hasScrolled={hasScrolled}
				pricingRef={pricingRef}
				homeRef={homeRef}
				featureRef={featureRef}
				howItWorksRef={howItWorksRef}
				faqRef={faqRef}
				router={router}
			/>

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
				ref={featureRef}
				className="flex flex-col items-center justify-center min-h-screen px-8 max-w-5xl mx-auto"
			>
				<Feature />
			</section>

			<section
				ref={pricingRef}
				className="flex flex-col items-center justify-center min-h-screen px-8 max-w-6xl mx-auto text-center"
			>
				<Subscription />
			</section>

			<section
				ref={howItWorksRef}
				className="flex flex-col items-center justify-center min-h-screen px-8 max-w-5xl mx-auto text-left"
			>
				<HowItWorks />
			</section>

			<section
				ref={faqRef}
				className="flex flex-col items-center justify-center min-h-screen px-8 max-w-4xl mx-auto"
			>
				<Faq />
			</section>
			<HomeFooter homeRef={homeRef} />
		</div>
	);
}
