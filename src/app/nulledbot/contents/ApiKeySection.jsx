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

	return (
		<div className="flex flex-col items-center gap-1">
			<span
				onClick={handleCopy}
				title="Click to copy"
				className="font-mono border text-green-600 px-3 rounded cursor-pointer transition animate-pulse"
			>
				{loading ? <Loading className={"w-5 h-5"} /> : apiKey || "NO API KEY"}
			</span>
			{error && <span className="text-red-700 ml-2">{error}</span>}
			{copied && (
				<span className="text-sm font-bold text-green-600">
					API key Copied!
				</span>
			)}
		</div>
	);
}
