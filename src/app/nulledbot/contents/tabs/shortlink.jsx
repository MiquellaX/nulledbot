import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCogs, FaEye, FaTrash } from "react-icons/fa";
import EditModal from "@/app/nulledbot/contents/modal/EditModal";
import VisitorsModal from "@/app/nulledbot/contents/modal/visitorsModal";
import { confirmToast } from "@/lib/confirmToast";
import { toast } from "sonner";

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
					{shortlinks.map((sl) => (
						<div
							key={sl.key}
							className="ring-1 rounded-lg shadow-md p-4 hover:bg-white/10 transition-colors cursor-default"
						>
							<div className="flex flex-col md:flex-row lg:flex-row xl:flex-row flex-wrap justify-between text-xs md:text-sm gap-y-2">
								<div className="flex flex-col gap-0 md:gap-2 lg:gap-2 xl:gap-2 text-xs md:text-sm lg:text-sm xl:text-sm">
									<span className="text-white">Owner</span>
									<span className="text-amber-400 font-semibold">
										{sl.owner.toUpperCase()}
									</span>
								</div>

								<div className="flex flex-col gap-0 md:gap-2 lg:gap-2 xl:gap-2 text-xs md:text-sm lg:text-sm xl:text-sm">
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

								<div className="flex flex-col gap-0 md:gap-2 lg:gap-2 xl:gap-2 text-xs md:text-sm lg:text-sm xl:text-sm">
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

								<div className="flex flex-col text-xs md:text-sm lg:text-sm xl:text-sm">
									<div className="flex flex-col gap-0 md:gap-2 lg:gap-2 xl:gap-2 w-full break-words">
										<span className="text-white">URL</span>
										<span className="text-blue-400 font-semibold">
											{sl.url}
										</span>
									</div>
								</div>

								<div className="flex flex-col text-xs md:text-sm lg:text-sm xl:text-sm">
									<div className="flex flex-col gap-0 md:gap-2 lg:gap-2 xl:gap-2">
										<span className="text-white">Key</span>
										<span className="text-cyan-400 font-semibold">
											{sl.key}
										</span>
									</div>
								</div>

								<div className="flex flex-col gap-0 md:gap-2 lg:gap-2 xl:gap-2 text-xs md:text-sm lg:text-sm xl:text-sm">
									<span className="text-white">Status</span>
									<span
										className={`font-bold rounded-full px-1 py-1 w-max text-xs ${
											sl.status === "ACTIVE"
												? "text-green-600 ring-1 ring-green-500 bg-green-600/10"
												: "text-red-700 ring-1 ring-red-500 bg-red-600/10"
										}`}
									>
										{sl.status}
									</span>
								</div>

								<div className="flex flex-col text-xs md:text-sm lg:text-sm xl:text-sm">
									<div className="flex flex-col gap-0 md:gap-2 lg:gap-2 xl:gap-2 w-full">
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
					))}
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
