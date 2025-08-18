import { motion } from "framer-motion";
export default function Faq() {
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
	return (
		<>
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
		</>
	);
}
