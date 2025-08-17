import React, { useState, useEffect } from "react";

export default function ApiKeySection({ username }) {
	const [apiKey, setApiKey] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		if (!loading && apiKey) {
			navigator.clipboard.writeText(apiKey);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		}
	};

	useEffect(() => {
		async function fetchApiKey() {
			if (!username) return;
			setLoading(true);
			setError("");
			try {
				const res = await fetch(
					`/api/account?username=${encodeURIComponent(username)}`
				);
				const data = await res.json();
				setApiKey(data.apiKey || "");
			} catch (err) {
				setError("Failed to fetch API key");
			}
			setLoading(false);
		}
		fetchApiKey();
	}, [username]);

	async function regenerateApiKey() {
		setLoading(true);
		setError("");
		try {
			const res = await fetch(`/api/account/regenerate`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username }),
			});
			const data = await res.json();
			if (data.success && data.apiKey) {
				setApiKey(data.apiKey);
			} else {
				setError(data.error || "Failed to regenerate API key");
			}
		} catch (err) {
			setError("Failed to regenerate API key");
		}
		setLoading(false);
	}

	return (
		<div className="flex flex-col items-center gap-1">
			<span
				onClick={handleCopy}
				title="Click to copy"
				className="font-mono border text-green-600 px-3 rounded cursor-pointer transition animate-pulse"
			>
				{loading ? (
					<svg
						className="w-6 h-6 fill-white"
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
					apiKey || "NO API KEY"
				)}
			</span>

			<button
				className="bg-red-700 text-white h-7 px-2 rounded hover:ring-2 hover:ring-amber-500 transition duration-300 cursor-pointer"
				onClick={regenerateApiKey}
				disabled={loading || !username}
			>
				Generate New API Key
			</button>
			{error && <span className="text-red-700 ml-2">{error}</span>}
			{copied && (
				<span className="text-sm font-bold text-green-600">
					API key Copied!
				</span>
			)}
		</div>
	);
}
