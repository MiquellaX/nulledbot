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
			<div className="flex justify-between border-b mb-10 border-white/20">
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

							const res2 = await fetch("/api/shortlinks");
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
				<table
					className={`bg-black w-full border ${
						shortlinks.length > 0 ? "" : "hidden"
					}`}
				>
					<thead>
						<tr className="text-white text-sm">
							<th className="p-2 border w-[100px]">INFO</th>
							<th className="p-2 border">URL REDIRECTION</th>
							<th className="p-2 border">KEY</th>
							<th className="p-2 border">STATUS</th>
							<th className="p-2 border">ACTIONS</th>
						</tr>
					</thead>
					<tbody>
						{shortlinks.map((sl) => (
							<tr key={sl.key}>
								<td className="px-2 text-xs align-middle py-2 border-r border-b">
									<div className="space-y-1 w-[180px]">
										<p className="overflow-hidden whitespace-nowrap text-ellipsis">
											OWNED BY :{" "}
											<span className="text-amber-500 font-bold">
												{sl.owner.toUpperCase()}
											</span>
										</p>
										<p className="flex gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
											CREATED AT :
											<span className="text-green-600 font-bold">
												{new Date(sl.createdAt).toLocaleTimeString("en-US", {
													hour: "2-digit",
													minute: "2-digit",
													hour12: true,
													timeZone: "Asia/Jakarta",
												})}
											</span>
										</p>
										{sl.updatedAt === sl.createdAt ? (
											<p className="flex gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
												UPDATED AT :
												<span className="text-red-800 font-bold">
													NO UPDATE YET
												</span>
											</p>
										) : (
											<p className="flex gap-1 overflow-hidden whitespace-nowrap text-ellipsis">
												UPDATED AT :
												<span className="text-blue-600">
													{new Date(sl.updatedAt).toLocaleTimeString("en-US", {
														hour: "2-digit",
														minute: "2-digit",
														hour12: true,
														timeZone: "Asia/Jakarta",
													})}
												</span>
											</p>
										)}
									</div>
								</td>
								<td className="px-2 text-sm font-bold text-center border-r border-b">
									{sl.url}
								</td>
								<td className="p-2 text-sm font-bold text-center border-r border-b">
									{sl.key}
								</td>
								<td className="text-center cursor-default border-r border-b">
									<span
										className={`p-2 px-4 rounded-lg font-bold text-sm ${
											sl.status == "ACTIVE" ? "text-green-600" : "text-red-500"
										}`}
									>
										{sl.status}
									</span>
								</td>
								<td className="border-b">
									<div className="flex items-center justify-center gap-4">
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
										>
											<FaTrash className="delete-icon" />
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			) : (
				<div className="text-center">NO SHORTLINKS YET</div>
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
								const res = await fetch("/api/shortlinks");
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
