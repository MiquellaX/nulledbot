"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

export default function IpManagements() {
	const [shortlinks, setShortlinks] = useState([]);
	const [selectedKey, setSelectedKey] = useState("");
	const [whitelistedIps, setWhitelistedIps] = useState([]);
	const [blacklistedIps, setBlacklistedIps] = useState([]);
	const [newWhiteIp, setNewWhiteIp] = useState("");
	const [newBlackIp, setNewBlackIp] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchLinks = async () => {
			try {
				const res = await fetch("/api/shortlinks");
				if (!res.ok) throw new Error("Failed to fetch shortlinks");
				const data = await res.json();
				setShortlinks(data || []);
			} catch {
				toast.error("Error fetching shortlinks");
				setShortlinks([]);
			}
		};
		fetchLinks();
	}, []);

	const handleSelect = (key) => {
		setSelectedKey(key);
		const link = shortlinks.find((s) => s.key === key);
		setWhitelistedIps(link?.whitelistedIps || []);
		setBlacklistedIps(link?.blacklistedIps || []);
	};

	const addWhiteIp = async () => {
		const ip = newWhiteIp.trim();
		if (!ip || whitelistedIps.includes(ip)) return;

		if (!selectedKey) return toast.error("Select a shortlink first");

		try {
			setLoading(true);
			const res = await fetch("/api/shortlinks", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					key: selectedKey,
					whitelistedIps: [...whitelistedIps, ip],
					blacklistedIps,
				}),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to add IP");

			setWhitelistedIps((prev) => [...prev, ip]);
			setNewWhiteIp("");
			toast.success(`${ip} added to whitelist`);
		} catch (err) {
			toast.error(err.message);
		} finally {
			setLoading(false);
		}
	};

	const addBlackIp = async () => {
		const ip = newBlackIp.trim();
		if (!ip || blacklistedIps.includes(ip)) return;

		if (!selectedKey) return toast.error("Select a shortlink first");

		try {
			setLoading(true);
			const res = await fetch("/api/shortlinks", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					key: selectedKey,
					whitelistedIps,
					blacklistedIps: [...blacklistedIps, ip],
				}),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to add IP");

			setBlacklistedIps((prev) => [...prev, ip]);
			setNewBlackIp("");
			toast.success(`${ip} added to blacklist`);
		} catch (err) {
			toast.error(err.message);
		} finally {
			setLoading(false);
		}
	};

	const removeIp = async (ip, listType) => {
		if (!selectedKey) return toast.error("Select a shortlink first");

		try {
			setLoading(true);

			let updatedWhitelist = whitelistedIps;
			let updatedBlacklist = blacklistedIps;

			if (listType === "whitelist") {
				updatedWhitelist = whitelistedIps.filter((i) => i !== ip);
			} else if (listType === "blacklist") {
				updatedBlacklist = blacklistedIps.filter((i) => i !== ip);
			}

			const res = await fetch("/api/shortlinks", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					key: selectedKey,
					whitelistedIps: updatedWhitelist,
					blacklistedIps: updatedBlacklist,
				}),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to remove IP");

			toast.success(`${ip} removed from ${listType}`);
			setWhitelistedIps(updatedWhitelist);
			setBlacklistedIps(updatedBlacklist);
		} catch (err) {
			toast.error(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<motion.div className="flex flex-col items-center justify-center gap-6 p-6 bg-gradient-to-br from-black/30 to-red-700/50 rounded-xl shadow-lg ring-1 font-semibold">
			<div className="flex flex-col gap-4 w-full max-w-2xl">
				<h2 className="text-3xl font-bold text-center bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
					IP Managements
				</h2>

				<div>
					<Label className="font-semibold">Choose Shortlink</Label>
					<select
						value={selectedKey}
						onChange={(e) => handleSelect(e.target.value)}
						className="w-full border rounded-lg p-2 mt-2 bg-black text-gray-200 font-normal"
					>
						<option value="">Choose Shortlink</option>
						{shortlinks.length > 0 ? (
							shortlinks.map((s) => (
								<option key={s.key} value={s.key}>
									{s.key} → {s.url}
								</option>
							))
						) : (
							<option disabled>No shortlinks available</option>
						)}
					</select>
				</div>

				<div>
					<Label className="font-semibold">Whitelisted IPs</Label>
					<div className="flex gap-2 mt-2">
						<Input
							type="text"
							value={newWhiteIp}
							onChange={(e) => setNewWhiteIp(e.target.value)}
							placeholder="Enter IP"
							className="bg-black text-gray-200 border-white text-base font-normal h-11"
						/>
						<Button
							onClick={addWhiteIp}
							disabled={loading}
							className={"tombol max-w-[50px]"}
						>
							Add
						</Button>
					</div>
					<div className="flex flex-wrap gap-2 mt-3">
						{whitelistedIps.length > 0 ? (
							whitelistedIps.map((ip) => (
								<span
									key={ip}
									className="px-4 py-1 bg-green-700 rounded-full text-sm flex items-center gap-2 shadow-md"
								>
									{ip}
									<button
										onClick={() => removeIp(ip, "whitelist")}
										className="text-red-400 hover:text-red-500"
										disabled={loading}
									>
										<FaTimes className="close-icon" />
									</button>
								</span>
							))
						) : (
							<p className="text-sm text-gray-400">No whitelisted IPs</p>
						)}
					</div>
				</div>

				<div>
					<Label className="font-semibold">Blacklisted IPs</Label>
					<div className="flex gap-2 mt-2">
						<Input
							type="text"
							value={newBlackIp}
							onChange={(e) => setNewBlackIp(e.target.value)}
							placeholder="Enter IP"
							className="bg-black text-gray-200 border-white font-normal h-11"
						/>
						<Button
							onClick={addBlackIp}
							disabled={loading}
							className={"tombol max-w-[50px]"}
						>
							Add
						</Button>
					</div>
					<div className="flex flex-wrap gap-2 mt-3">
						{blacklistedIps.length > 0 ? (
							blacklistedIps.map((ip) => (
								<span
									key={ip}
									className="px-4 py-1 bg-red-900/80 rounded-full text-sm flex items-center gap-2 shadow-md"
								>
									{ip}
									<button
										onClick={() => removeIp(ip, "blacklist")}
										className="text-gray-300 hover:text-gray-100"
										disabled={loading}
									>
										<FaTimes className="close-icon" />
									</button>
								</span>
							))
						) : (
							<p className="text-sm text-gray-400">No blacklisted IPs</p>
						)}
					</div>
				</div>
			</div>
		</motion.div>
	);
}
