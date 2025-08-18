import { motion } from "framer-motion";
import { RogIconHome } from "../../icons/nulledbotIcons";
export default function HomeHeader({
	hasScrolled,
	pricingRef,
	homeRef,
	howItWorksRef,
	faqRef,
	featureRef,
	router,
}) {
	return (
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
							featureRef.current?.scrollIntoView({ behavior: "smooth" })
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
							howItWorksRef.current?.scrollIntoView({ behavior: "smooth" })
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
	);
}
