import { motion } from "framer-motion";
export default function Feature() {
	return (
		<>
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
		</>
	);
}
