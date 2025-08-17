"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { confirmToast } from "@/lib/confirmToast";
import { toast } from "sonner";

export default function EditModal({
	data,
	onClose,
	onUpdate,
	subscriptionType,
}) {
	const [formData, setFormData] = useState({
		url: data?.url ?? "",
		secondaryUrl: data?.secondaryUrl ?? "",
		key: data?.key ?? "",
		allowedCountry: data?.allowedCountry ?? "",
		allowedIsp: data?.allowedIsp ?? "",
		allowedDevice: data?.allowedDevice ?? "Allow All",
		statusCode: data?.statusCode ?? "404",
		connectionType: data?.connectionType ?? "Allow All",
		originalKey: data?.originalKey ?? data?.key ?? "",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const getDisplayUrl = () => {
		if (
			data?.primaryUrlStatus === "DEAD" ||
			data?.primaryUrlStatus === "RED FLAG"
		) {
			return data?.secondaryUrl || data?.url;
		}
		return data?.url;
	};

	async function handleSubmit(e) {
		e.preventDefault();

		confirmToast({
			message: `Are you sure you want to update configs for shortlink: ${getDisplayUrl()}?`,
			onConfirm: async () => {
				setLoading(true);
				setError("");

				await toast.promise(
					(async () => {
						const res = await fetch("/api/shortlinks", {
							method: "PUT",
							credentials: "include",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(formData),
						});

						const result = await res.json();
						if (!result.success)
							throw new Error(result.error || "Update failed");

						await onUpdate();
						onClose();

						return "Shortlink updated successfully";
					})(),
					{
						loading: "Saving shortlink...",
						success: (msg) => msg,
						error: (err) => err.message,
					}
				);

				setLoading(false);
			},
			onCancel: () => {
				toast("Update cancelled.");
			},
		});
	}

	const subType = subscriptionType;

	return (
		<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
			<motion.div
				initial={{ y: -50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: -50, opacity: 0 }}
				className="bg-black border border-white rounded-lg text-white w-full max-w-4xl p-6"
			>
				<h3 className="text-xl font-bold mb-6">
					Edit Shortlink:{" "}
					<span className="text-blue-400">{getDisplayUrl()}</span>
				</h3>

				<form onSubmit={handleSubmit}>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
						{[
							{ label: "Main Site URL", name: "url" },
							{ label: "Secondary URL", name: "secondaryUrl" },
							{ label: "Custom Key", name: "key" },
							{ label: "Allowed ISP", name: "allowedIsp" },
						].map(({ label, name }) => (
							<div key={name}>
								<label className="block mb-1 font-medium">{label}</label>
								<input
									type="text"
									className="w-full p-2 bg-black border rounded disabled:text-red-700 disabled:placeholder:text-sm"
									placeholder={
										subType === "free" &&
										(name === "allowedIsp" || name === "secondaryUrl")
											? "Unavailable for Free Users"
											: undefined
									}
									value={formData[name]}
									onChange={(e) =>
										setFormData((f) => ({ ...f, [name]: e.target.value }))
									}
									required={["url", "key"].includes(name)}
									disabled={
										subType === "free" &&
										(name === "allowedIsp" || name === "secondaryUrl")
									}
								/>
							</div>
						))}

						<div>
							<label className="block mb-1 font-medium">Allowed Country</label>
							<select
								className="w-full p-2 bg-black border rounded disabled:text-red-700/50 disabled:border-red-700 disabled:text-sm"
								value={formData.allowedCountry}
								onChange={(e) =>
									setFormData((f) => ({ ...f, allowedCountry: e.target.value }))
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
								label: "Bot Status Code",
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
							<div key={name}>
								<label className="block mb-1 font-medium">{label}</label>
								<select
									className="w-full p-2 bg-black border border-white rounded disabled:text-red-700/50 disabled:border-red-700 disabled:text-sm"
									value={formData[name]}
									onChange={(e) =>
										setFormData((f) => ({ ...f, [name]: e.target.value }))
									}
									required
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
					</div>

					<div className="flex justify-start gap-2 mt-6">
						<button
							type="submit"
							className="cursor-pointer bg-blue-700 hover:bg-blue-800 text-white p-2 rounded transition duration-300 w-full flex items-center justify-center"
							disabled={loading}
						>
							{loading ? (
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
								"Update"
							)}
						</button>
						<button
							type="button"
							className="cursor-pointer bg-red-700 hover:bg-red-800 text-white p-2 rounded w-full transition duration-300"
							onClick={onClose}
						>
							Cancel
						</button>
					</div>

					{error && <div className="text-red-500 mt-4">{error}</div>}
				</form>
			</motion.div>
		</div>
	);
}
