"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KarmaAdminPageDashboardContents from "./contents";
import { RogIconHome } from "../icons/nulledbotIcons";

export default function KarmaAdminDashboardPageContext() {
	const router = useRouter();
	const [authorized, setAuthorized] = useState(false);
	const [answerInput, setAnswerInput] = useState("");
	const [error, setError] = useState("");

	const KARMA_QUESTION = process.env.NEXT_PUBLIC_KARMA_QUESTION;
	const KARMA_ANSWER = process.env.NEXT_PUBLIC_KARMA_ANSWER;

	useEffect(() => {
		const alreadyAuthorized =
			localStorage.getItem("karma_admin_authorized") === "true";
		if (alreadyAuthorized) {
			setAuthorized(true);
		}
	}, []);

	const handleLogin = () => {
		if (answerInput.trim().toLowerCase() === KARMA_ANSWER?.toLowerCase()) {
			localStorage.setItem("karma_admin_authorized", "true");
			setAuthorized(true);
		} else {
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			handleLogin();
		}
	};

	if (!authorized) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen px-4 text-center text-white">
				<div className="rounded-lg shadow-md w-full max-w-[100px]">
					<input
						type="password"
						value={answerInput}
						onChange={(e) => setAnswerInput(e.target.value)}
						onKeyDown={handleKeyDown}
						className="w-full px-4 py-2 rounded bg-black border border-gray-700 text-white placeholder:text-xs flex items-center justify-center"
						placeholder={KARMA_QUESTION}
					/>
				</div>
			</div>
		);
	}

	return <KarmaAdminPageDashboardContents />;
}
