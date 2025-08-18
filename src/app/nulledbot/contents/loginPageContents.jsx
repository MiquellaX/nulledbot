"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { RogIconHome } from "@/app/nulledbot/icons/nulledbotIcons";
import Loading from "./tabs/loading";

export default function LoginPageContents() {
	const [username, setUsername] = useState("");
	const [key, setKey] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();
	const searchParams = useSearchParams();
	const usernameFromPayment = searchParams.get("user") || "";

	useEffect(() => {
		if (usernameFromPayment) {
			setUsername(usernameFromPayment);
		}
	}, [usernameFromPayment]);

	const errorMessages = {
		CredentialsSignin: "Invalid username or key. Please try again.",
		error_expired: "Your subscription has expired. Please renew.",
		error_waiting: "Your account is pending approval.",
		error_denied: "Your account has been denied.",
		profile_not_found: "Profile not found. Please contact support.",
	};

	useEffect(() => {
		const errorFromUrl = searchParams.get("error");
		if (errorFromUrl) {
			setError(errorMessages[errorFromUrl] || errorFromUrl);

			const url = new URL(window.location.href);
			url.searchParams.delete("error");
			window.history.replaceState(null, "", url.toString());
		}
	}, [searchParams]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		const response = await signIn("credentials", {
			username,
			key,
			redirect: false,
		});

		setLoading(false);

		if (response?.error) {
			setError(errorMessages[response.error] || response.error);
			return;
		}
		router.push("/nulledbot/greetings");
	};

	return (
		<AnimatePresence>
			<div className="flex items-center justify-center overflow-hidden">
				<motion.div
					initial={{ opacity: 0, x: -50 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -50 }}
					transition={{ duration: 0.2 }}
					className="flex flex-col items-center justify-center min-h-screen"
				>
					<form
						onSubmit={handleSubmit}
						className="bg-gradient-to-br ring-1 from-black/30 to-red-700/50 p-8 rounded shadow w-80"
					>
						<div className="flex items-center justify-between">
							<h2 className="text-2xl mb-4">Login</h2>
							<p onClick={() => router.push("/")}>
								<RogIconHome className="w-10 mb-5 cursor-pointer" />
							</p>
						</div>

						<input
							type="text"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full mb-4 p-2 border rounded"
							required
							autoComplete="username"
							readOnly={!!usernameFromPayment}
						/>

						<input
							type="password"
							placeholder="Key"
							value={key}
							onChange={(e) => setKey(e.target.value)}
							className="w-full mb-4 p-2 border rounded"
							required
							autoComplete="current-password"
						/>

						{error && <div className="text-red-700 mb-2">{error}</div>}

						<button
							type="submit"
							disabled={loading}
							className={`tombol ring-black hover:ring-green-600 ${
								loading ? "opacity-70 cursor-not-allowed" : ""
							}`}
						>
							{loading ? <Loading className={"w-6 h-6"} /> : "Login"}
						</button>

						<div className="mt-4 text-center flex gap-2 cursor-pointer">
							<span>Don't have an account?</span>
							<p
								onClick={() => router.push("/nulledbot/signup")}
								className="relative text-red-700 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[1.5px] after:bg-red-700 after:transition-all after:duration-300 hover:after:w-full"
							>
								Sign up
							</p>
						</div>
					</form>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
