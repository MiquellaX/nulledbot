import React, { useState, useEffect } from "react";
import Loading from "./tabs/loading";

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
				{loading ? <Loading className={"w-5 h-5"} /> : apiKey || "NO API KEY"}
			</span>

			<button
				className="font-normal bg-black/80 text-white h-7 px-2 rounded hover:ring-2 hover:ring-amber-500 transition duration-300 cursor-pointer"
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
