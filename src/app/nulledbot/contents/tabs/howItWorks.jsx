import { motion } from "framer-motion";
export default function howItWorks() {
	return (
		<>
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
		</>
	);
}
