import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCogs, FaEye, FaReact, FaTrash, FaCode } from "react-icons/fa";
import EditModal from "@/app/nulledbot/contents/modal/EditModal";
import VisitorsModal from "@/app/nulledbot/contents/modal/visitorsModal";
import { confirmToast } from "@/lib/confirmToast";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const CACHE_KEY = "statusCache";
const CACHE_DURATION = 3 * 60 * 1000;

const loadStatusCache = () => {
	try {
		return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
	} catch {
		return {};
	}
};

const saveStatusCache = (cache) => {
	localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

export default function ShortlinkTab({
	form,
	setForm,
	formError,
	setFormError,
	formLoading,
	setFormLoading,
	shortlinks,
	setShortlinks,
	visitorsModal,
	setVisitorsModal,
	editModal,
	setEditModal,
	subscriptionType,
}) {
	const [liveStatuses, setLiveStatuses] = useState({});
	const [loadingKeys, setLoadingKeys] = useState({});
	const handleDownload = async () => {
		try {
			const res = await fetch("/api/download");
			if (!res.ok) throw new Error("Failed to download");

			const blob = await res.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "nulledbot.zip";
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (err) {
			console.error(err);
			alert("Download failed.");
		}
	};
	const subType = subscriptionType;

	const checkUrlReachability = async (url) => {
		try {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 5000);

			await fetch(url, {
				method: "HEAD",
				mode: "no-cors",
				signal: controller.signal,
			});
			clearTimeout(timeout);
			return true;
		} catch {
			return false;
		}
	};

	const checkUrlSafety = async (urlToCheck) => {
		const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SAFE_API;
		const body = {
			client: {
				clientId: "NulledBot",
				clientVersion: "1.0",
			},
			threatInfo: {
				threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
				platformTypes: ["ANY_PLATFORM"],
				threatEntryTypes: ["URL"],
				threatEntries: [{ url: urlToCheck }],
			},
		};

		try {
			const response = await fetch(
				`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				}
			);
			const data = await response.json();
			return !(data && data.matches);
		} catch {
			return true;
		}
	};

	const checkAndUpdateStatus = async (url, key, secondaryUrl) => {
		setLoadingKeys((prev) => ({ ...prev, [key]: true }));
		const now = Date.now();
		const cache = loadStatusCache();

		const urlCache = cache[key]?.[url];
		let isFreshPrimary = false;

		if (urlCache && urlCache.timestamp) {
			isFreshPrimary = now - urlCache.timestamp < CACHE_DURATION;
		}

		if (isFreshPrimary) {
			setLiveStatuses((prev) => ({
				...prev,
				[key]: {
					status: urlCache.status,
					source: "primary",
				},
			}));
			setLoadingKeys((prev) => ({ ...prev, [key]: false }));
			return;
		}

		if (secondaryUrl) {
			const secondaryCache = cache[key]?.[secondaryUrl];
			let isFreshSecondary = false;

			if (secondaryCache && secondaryCache.timestamp) {
				isFreshSecondary = now - secondaryCache.timestamp < CACHE_DURATION;
			}

			if (isFreshSecondary) {
				setLiveStatuses((prev) => ({
					...prev,
					[key]: {
						status: secondaryCache.status,
						source: "secondary",
					},
				}));
				setLoadingKeys((prev) => ({ ...prev, [key]: false }));
				return;
			}
		}
		const isPrimarySafe = await checkUrlSafety(url);
		let isPrimaryReachable = false;
		let primaryStatus = "";

		if (!isPrimarySafe) {
			primaryStatus = "RED FLAG";
		} else {
			isPrimaryReachable = await checkUrlReachability(url);
			primaryStatus = isPrimaryReachable ? "LIVE" : "DEAD";
		}
		await syncStatusToDB(key, url, primaryStatus, "primary");
		let secondaryStatus = "";
		let isSecondaryReachable = false;

		if (secondaryUrl) {
			const isSecondarySafe = await checkUrlSafety(secondaryUrl);
			if (!isSecondarySafe) {
				secondaryStatus = "RED FLAG";
			} else {
				isSecondaryReachable = await checkUrlReachability(secondaryUrl);
				secondaryStatus = isSecondaryReachable ? "LIVE" : "DEAD";
			}
			await syncStatusToDB(key, secondaryUrl, secondaryStatus, "secondary");
		}
		cache[key] = {
			[url]: { status: primaryStatus, timestamp: now },
			...(secondaryUrl && {
				[secondaryUrl]: { status: secondaryStatus, timestamp: now },
			}),
		};
		saveStatusCache(cache);
		let finalStatus = "";
		let source = null;

		if (primaryStatus === "LIVE") {
			finalStatus = "LIVE";
			source = "primary";
		} else if (secondaryStatus === "LIVE") {
			finalStatus = "LIVE";
			source = "secondary";
		} else if (
			(primaryStatus === "DEAD" || primaryStatus === "RED FLAG") &&
			(secondaryStatus === "DEAD" || secondaryStatus === "RED FLAG")
		) {
			finalStatus = "NEED UPDATE!";
			source = null;
		} else {
			finalStatus = "WAIT";
			source = null;
		}

		setLiveStatuses((prev) => ({
			...prev,
			[key]: {
				status: finalStatus,
				source,
			},
		}));

		setLoadingKeys((prev) => ({ ...prev, [key]: false }));
	};

	const manualCheckUrl = async (url, key, secondaryUrl) => {
		setLoadingKeys((prev) => ({ ...prev, [key]: true }));
		const toastId = toast.loading(`Checking URLs...`);
		const now = Date.now();

		let primaryStatus = "";
		let secondaryStatus = "";

		try {
			const isPrimarySafe = await checkUrlSafety(url);
			let isPrimaryReachable = false;

			if (!isPrimarySafe) {
				primaryStatus = "RED FLAG";
				toast.error(`Primary URL "${url}" is RF`);
			} else {
				isPrimaryReachable = await checkUrlReachability(url);
				primaryStatus = isPrimaryReachable ? "LIVE" : "DEAD";
				toast[isPrimaryReachable ? "success" : "warning"](
					`Primary URL "${url}" is ${primaryStatus}`
				);
			}
			await syncStatusToDB(key, url, primaryStatus, "primary");
			let isSecondaryReachable = false;
			if (secondaryUrl) {
				const isSecondarySafe = await checkUrlSafety(secondaryUrl);

				if (!isSecondarySafe) {
					secondaryStatus = "RED FLAG";
					toast.error(`Secondary URL "${secondaryUrl}" is RF`);
				} else {
					isSecondaryReachable = await checkUrlReachability(secondaryUrl);
					secondaryStatus = isSecondaryReachable ? "LIVE" : "DEAD";
					toast[isSecondaryReachable ? "success" : "warning"](
						`Secondary URL "${secondaryUrl}" is ${secondaryStatus}`
					);
				}
				await syncStatusToDB(key, secondaryUrl, secondaryStatus, "secondary");
			}
			let finalStatus = "";
			let source = null;

			if (primaryStatus === "LIVE") {
				finalStatus = "LIVE";
				source = "primary";
			} else if (secondaryStatus === "LIVE") {
				finalStatus = "LIVE";
				source = "secondary";
			} else if (
				(primaryStatus === "DEAD" || primaryStatus === "RED FLAG") &&
				(secondaryStatus === "DEAD" || secondaryStatus === "RED FLAG")
			) {
				finalStatus = "NEED UPDATE!";
			} else {
				finalStatus = "WAIT";
			}
			const cache = loadStatusCache();
			cache[key] = {
				[url]: { status: primaryStatus, timestamp: now },
				...(secondaryUrl && {
					[secondaryUrl]: { status: secondaryStatus, timestamp: now },
				}),
			};
			saveStatusCache(cache);
			setLiveStatuses((prev) => ({
				...prev,
				[key]: {
					status: finalStatus,
					source,
				},
			}));

			toast.success(`Check complete for "${key}"`, { id: toastId });
		} catch (err) {
			toast.error(`Error checking "${url}"`, { id: toastId });
		} finally {
			setLoadingKeys((prev) => ({ ...prev, [key]: false }));
		}
	};

	const syncStatusToDB = async (key, url, status, type) => {
		try {
			await fetch("/api/shortlinks/status", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ key, url, status, type }),
			});
		} catch (err) {
			console.error("Failed to sync status to DB:", err);
		}
	};

	useEffect(() => {
		const interval = setInterval(() => {
			const cache = loadStatusCache();
			const now = Date.now();

			shortlinks.forEach((sl) => {
				const key = sl.key;
				const primaryCache = cache[key]?.[sl.url];
				const secondaryCache = sl.secondaryUrl
					? cache[key]?.[sl.secondaryUrl]
					: null;

				const isPrimaryExpired =
					!primaryCache || now - primaryCache.timestamp >= CACHE_DURATION;

				const isSecondaryExpired =
					sl.secondaryUrl &&
					(!secondaryCache || now - secondaryCache.timestamp >= CACHE_DURATION);

				if (!loadingKeys[key] && (isPrimaryExpired || isSecondaryExpired)) {
					checkAndUpdateStatus(sl.url, key, sl.secondaryUrl);
				}
			});
		}, 5000);

		return () => clearInterval(interval);
	}, [shortlinks, loadingKeys]);

	return (
		<motion.div
			key="shortlink"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
			className="rounded-lg border bg-black border-white shadow p-6"
		>
			<div className="flex flex-col md:flex-row lg:flex-row xl:flex-row justify-between border-b mb-10 border-white/20">
				<h2 className="text-xl font-bold mb-4">
					Nulledbot Shortlink Management
				</h2>
				<div className="mb-6 flex gap-4">
					<button
						onClick={handleDownload}
						className="cursor-pointer relative font-bold text-blue-700 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[1.5px] after:bg-blue-700 after:transition-all after:duration-300 hover:after:w-full"
					>
						Download NulledBot
					</button>
				</div>
			</div>

			<form
				className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
				onSubmit={async (e) => {
					e.preventDefault();
					setFormLoading(true);
					setFormError("");

					toast.promise(
						(async () => {
							const res = await fetch("/api/shortlinks", {
								method: "POST",
								credentials: "include",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify(form),
							});
							const data = await res.json();

							if (!data.success) {
								throw new Error(data.error || "Error creating shortlink");
							}

							setForm({
								url: "",
								secondaryUrl: "",
								key: "",
								statusCode: "",
								allowedDevice: "",
								connectionType: "",
								allowedCountry: "",
								allowedIsp: "",
							});

							const res2 = await fetch("/api/shortlinks", {
								credentials: "include",
							});
							const data2 = await res2.json();
							setShortlinks(Array.isArray(data2) ? data2 : []);

							return "Shortlink created successfully";
						})(),
						{
							loading: "Creating shortlink...",
							success: (msg) => msg,
							error: (err) => err.message,
						}
					);

					setFormLoading(false);
				}}
			>
				{[
					{
						label: "Main Site URL",
						name: "url",
						type: "url",
						placeholder: "https://domain.com/?path",
						required: true,
					},
					{
						label: "Secondary Site URL",
						name: "secondaryUrl",
						type: "url",
						placeholder: "https://backupdomain.com/?path",
						required: true,
					},
					{
						label: "Custom Key",
						name: "key",
						type: "text",
						placeholder: "Enter custom key",
						required: true,
					},
					{
						label: "Allowed ISP",
						name: "allowedIsp",
						type: "text",
						placeholder: "e.g. Google LLC, Amazon",
					},
				].map(({ label, name, type, placeholder, required }) => (
					<div className="mb-4" key={name}>
						<label className="block mb-1">{label}</label>
						<input
							type={type}
							required={required}
							placeholder={
								subType === "free" && name === "allowedIsp"
									? "Unavailable for Free Users"
									: placeholder
							}
							className={`w-full p-2 border rounded-lg bg-black text-white disabled:text-red-700`}
							value={form[name]}
							onChange={(e) =>
								setForm((f) => ({ ...f, [name]: e.target.value }))
							}
							disabled={subType === "free" && name === "allowedIsp"}
						/>
						{name === "key" && formError && (
							<div className="text-red-700 mt-1">{formError}</div>
						)}
					</div>
				))}

				<div className="mb-4">
					<label className="block mb-1">Allowed Country</label>
					<select
						className="w-full p-[10px] border rounded-lg bg-black text-white disabled:text-red-700/50 disabled:border-red-700"
						value={form.allowedCountry}
						onChange={(e) =>
							setForm((f) => ({ ...f, allowedCountry: e.target.value }))
						}
						disabled={subType === "free"}
					>
						<option value="">
							{subType === "free"
								? "Unavailable for Free Users"
								: "Select Allowed Country"}
						</option>
						{[
							{ code: "US", name: "United States" },
							{ code: "GB", name: "United Kingdom" },
							{ code: "ID", name: "Indonesia" },
							{ code: "CA", name: "Canada" },
							{ code: "DE", name: "Germany" },
							{ code: "FR", name: "France" },
							{ code: "KR", name: "Korea" },
						].map(({ code, name }) => (
							<option key={code} value={code}>
								{name}
							</option>
						))}
					</select>
				</div>

				{[
					{
						label: "Bot Redirection Status Code",
						name: "statusCode",
						options: ["Redirect To Random URL", "403", "404"],
					},
					{
						label: "Allowed Device",
						name: "allowedDevice",
						options: ["Allow All", "Desktop", "Mobile"],
					},
					{
						label: "Connection Type",
						name: "connectionType",
						options: ["Allow All", "Block VPN", "Block Proxy", "Block All"],
					},
				].map(({ label, name, options }) => (
					<div className="mb-4" key={name}>
						<label className="block mb-1">{label}</label>
						<select
							required
							className="w-full p-[10px] border rounded-lg h-10 bg-black disabled:text-red-700/50 disabled:border-red-700"
							value={form[name]}
							onChange={(e) =>
								setForm((f) => ({ ...f, [name]: e.target.value }))
							}
							disabled={
								(name === "connectionType" || name === "allowedDevice") &&
								subType === "free"
							}
						>
							{options.map((opt) => (
								<option key={opt} value={opt}>
									{opt === "Allow All"
										? subType === "free"
											? "Unavailable for Free Users"
											: opt
										: opt}
								</option>
							))}
						</select>
					</div>
				))}
				<div className="flex justify-center items-center">
					<button
						type="submit"
						className="tombol hover:ring-green-600 mt-3 flex justify-center"
						disabled={formLoading}
					>
						{formLoading ? (
							<svg
								className="w-6 h-6"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<circle cx="4" cy="12" r="3">
									<animate
										id="spinner_jObz"
										begin="0;spinner_vwSQ.end-0.25s"
										attributeName="r"
										dur="0.75s"
										values="3;.2;3"
									/>
								</circle>
								<circle cx="12" cy="12" r="3">
									<animate
										begin="spinner_jObz.end-0.6s"
										attributeName="r"
										dur="0.75s"
										values="3;.2;3"
									/>
								</circle>
								<circle cx="20" cy="12" r="3">
									<animate
										id="spinner_vwSQ"
										begin="spinner_jObz.end-0.45s"
										attributeName="r"
										dur="0.75s"
										values="3;.2;3"
									/>
								</circle>
							</svg>
						) : (
							"Generate Shortlink"
						)}
					</button>
				</div>
			</form>

			{shortlinks.length > 0 ? (
				<div className="grid grid-cols-1 gap-4">
					{shortlinks.map((sl) => {
						const isLoading = loadingKeys[sl.key];
						const liveData = liveStatuses[sl.key];

						let displayStatus = "WAIT";
						let displayUrl = null;

						if (isLoading) {
							displayStatus = "loading";
						} else if (liveData) {
							if (liveData.status === "LIVE") {
								displayStatus = "LIVE";
								displayUrl =
									liveData.source === "secondary" ? sl.secondaryUrl : sl.url;
							} else if (liveData.status === "NEED UPDATE!") {
								displayStatus = "NEED UPDATE!";
								displayUrl = "NEED UPDATE!";
							} else {
								displayStatus = "CLEAR STATUS CACHE!";
								displayUrl = "CLEAR STATUS CACHE!";
							}
						} else {
							const primary = sl.primaryUrlStatus;
							const secondary = sl.secondaryUrlStatus;

							if (primary === "LIVE") {
								displayStatus = "LIVE";
								displayUrl = sl.url;
							} else if (secondary === "LIVE") {
								displayStatus = "LIVE";
								displayUrl = sl.secondaryUrl;
							} else if (
								(primary === "DEAD" || primary === "RED FLAG") &&
								(secondary === "DEAD" || secondary === "RED FLAG")
							) {
								displayStatus = "NEED UPDATE!";
								displayUrl = "NEED UPDATE!";
							} else {
								displayStatus = primary || secondary || "WAIT";
								displayUrl = sl.url;
							}
						}

						return (
							<div
								key={sl.key}
								className="ring-1 rounded-lg shadow-md p-4 hover:bg-white/10 transition-colors cursor-default"
							>
								<div className="flex flex-col md:flex-row lg:flex-row xl:flex-row flex-wrap justify-between text-xs md:text-sm gap-y-2">
									<div className="flex flex-col gap-0 md:gap-2">
										<span className="text-white">Owner</span>
										<span className="text-amber-400 font-semibold">
											{sl.owner.toUpperCase()}
										</span>
									</div>

									<div className="flex flex-col gap-0 md:gap-2">
										<span className="text-white">Created</span>
										<span className="text-green-400 font-semibold">
											{new Date(sl.createdAt).toLocaleTimeString("en-US", {
												hour: "2-digit",
												minute: "2-digit",
												hour12: true,
												timeZone: "Asia/Jakarta",
											})}
										</span>
									</div>

									<div className="flex flex-col gap-0 md:gap-2">
										<span className="text-white">Updated</span>
										<span
											className={
												sl.updatedAt === sl.createdAt
													? "text-red-700 font-semibold"
													: "text-amber-500 font-semibold"
											}
										>
											{sl.updatedAt === sl.createdAt
												? "NO UPDATE YET"
												: new Date(sl.updatedAt).toLocaleTimeString("en-US", {
														hour: "2-digit",
														minute: "2-digit",
														hour12: true,
														timeZone: "Asia/Jakarta",
												  })}
										</span>
									</div>

									<div className="flex flex-col text-xs md:text-sm">
										<div className="flex flex-col gap-0 md:gap-2 w-full break-words">
											<span className="text-white">URL</span>
											<span className="text-blue-400 font-semibold flex items-center gap-1">
												{isLoading ? (
													<span className="font-bold rounded-full px-2 py-1 w-max h-max text-xs text-gray-400 ring-1 ring-gray-500 bg-gray-600/10">
														<svg
															className="w-[33px] h-4 fill-amber-50"
															viewBox="0 0 24 24"
															xmlns="http://www.w3.org/2000/svg"
														>
															<circle cx="4" cy="12" r="3">
																<animate
																	id="spinner_jObz"
																	begin="0;spinner_vwSQ.end-0.25s"
																	attributeName="r"
																	dur="0.75s"
																	values="3;.2;3"
																/>
															</circle>
															<circle cx="12" cy="12" r="3">
																<animate
																	begin="spinner_jObz.end-0.6s"
																	attributeName="r"
																	dur="0.75s"
																	values="3;.2;3"
																/>
															</circle>
															<circle cx="20" cy="12" r="3">
																<animate
																	id="spinner_vwSQ"
																	begin="spinner_jObz.end-0.45s"
																	attributeName="r"
																	dur="0.75s"
																	values="3;.2;3"
																/>
															</circle>
														</svg>
													</span>
												) : (
													<span
														className={`truncate ${
															displayUrl === "CLEAR STATUS CACHE!"
																? "font-bold rounded-full px-2 py-1 w-max h-max text-xs text-red-700 ring-1 ring-white bg-gray-600/10"
																: ""
														}`}
													>
														{displayUrl}
													</span>
												)}
											</span>
										</div>
									</div>

									<div className="flex flex-col text-xs md:text-sm">
										<div className="flex flex-col gap-0 md:gap-2">
											<span className="text-white">Key</span>
											<span className="text-cyan-400 font-semibold">
												{sl.key}
											</span>
										</div>
									</div>

									<div className="flex flex-col text-xs md:text-sm">
										<div className="flex flex-col gap-0 md:gap-2 w-full break-words">
											<span className="text-white">Status</span>
											<span
												className={`font-bold rounded-full px-2 py-1 w-max h-max text-xs ${
													isLoading
														? "text-gray-400 ring-1 ring-gray-500 bg-gray-600/10"
														: displayStatus === "LIVE"
														? "text-green-600 ring-1 ring-green-500 bg-green-600/10"
														: displayStatus === "DEAD"
														? "text-yellow-600 ring-1 ring-yellow-500 bg-yellow-600/10"
														: displayStatus === "RED FLAG"
														? "text-red-600 ring-1 ring-red-500 bg-red-600/10"
														: displayStatus === "NEED UPDATE!"
														? "text-orange-600 ring-1 ring-orange-500 bg-orange-600/10"
														: "text-red-700 ring-1 ring-white bg-gray-600/10"
												}`}
											>
												{isLoading ? (
													<svg
														className="w-[33px] h-4 fill-amber-50"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
													>
														<circle cx="4" cy="12" r="3">
															<animate
																id="spinner_jObz"
																begin="0;spinner_vwSQ.end-0.25s"
																attributeName="r"
																dur="0.75s"
																values="3;.2;3"
															/>
														</circle>
														<circle cx="12" cy="12" r="3">
															<animate
																begin="spinner_jObz.end-0.6s"
																attributeName="r"
																dur="0.75s"
																values="3;.2;3"
															/>
														</circle>
														<circle cx="20" cy="12" r="3">
															<animate
																id="spinner_vwSQ"
																begin="spinner_jObz.end-0.45s"
																attributeName="r"
																dur="0.75s"
																values="3;.2;3"
															/>
														</circle>
													</svg>
												) : displayStatus === "RED FLAG" ? (
													"RF"
												) : (
													displayStatus
												)}
											</span>
										</div>
									</div>

									<div className="flex flex-col text-xs md:text-sm">
										<div className="flex flex-col gap-0 md:gap-2 w-full">
											<span className="text-white">Actions</span>
											<div className="flex gap-4 mt-1">
												<button
													onClick={() =>
														setEditModal({
															open: true,
															data: { ...sl, originalKey: sl.key },
															loading: false,
															error: "",
														})
													}
													title="Edit Shortlink"
													className="text-yellow-400 hover:text-yellow-300 transition"
												>
													<FaCogs className="setting-icon" />
												</button>
												<button
													onClick={() =>
														manualCheckUrl(sl.url, sl.key, sl.secondaryUrl)
													}
													title="Check URL"
													className="text-yellow-400 hover:text-yellow-300 transition"
												>
													<FaReact className="check-icon" />
												</button>
												<button
													onClick={() => {
														localStorage.removeItem("statusCache");
														setLiveStatuses({});
														toast.success("Status Cache Cleared.");
													}}
													title="Clear Status Cache"
													className="text-yellow-400 hover:text-yellow-300 transition"
												>
													<FaCode className="cache-icon" />
												</button>

												<button
													onClick={() =>
														setVisitorsModal({
															open: true,
															data: { ...sl, originalKey: sl.key },
														})
													}
													title="View Visitors"
													className="text-blue-400 hover:text-blue-300 transition"
												>
													<FaEye className="view-icon" />
												</button>
												<button
													onClick={() => {
														confirmToast({
															message: `Delete shortlink: "${sl.url}"?`,
															onConfirm: async () => {
																toast.promise(
																	(async () => {
																		const res = await fetch("/api/shortlinks", {
																			method: "DELETE",
																			credentials: "include",
																			headers: {
																				"Content-Type": "application/json",
																			},
																			body: JSON.stringify({ key: sl.key }),
																		});
																		const data = await res.json();
																		if (!res.ok || !data.success) {
																			throw new Error(
																				data.error || "Failed to delete"
																			);
																		}
																		setShortlinks(
																			shortlinks.filter((s) => s.key !== sl.key)
																		);
																		return "Deleted";
																	})(),
																	{
																		loading: "Deleting...",
																		success: `Shortlink "${sl.url}" deleted.`,
																		error: (err) => `Failed: ${err.message}`,
																	}
																);
															},
															onCancel: () => {
																toast("Deletion cancelled.");
															},
														});
													}}
													title="Delete Shortlink"
													className="text-red-400 hover:text-red-300 transition"
												>
													<FaTrash className="delete-icon" />
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="text-center text-white mt-4">NO SHORTLINKS YET</div>
			)}

			<AnimatePresence>
				{visitorsModal.open && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center"
					>
						<VisitorsModal
							data={visitorsModal.data}
							shortlinkKey={visitorsModal.data?.key}
							onClose={() => setVisitorsModal({ open: false, data: null })}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{editModal.open && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center"
					>
						<EditModal
							data={editModal.data}
							subscriptionType={subscriptionType}
							onClose={() =>
								setEditModal({
									open: false,
									data: null,
									loading: false,
									error: "",
								})
							}
							onUpdate={async () => {
								const res = await fetch("/api/shortlinks", {
									credentials: "include",
								});
								const data = await res.json();
								setShortlinks(Array.isArray(data) ? data : []);
							}}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
