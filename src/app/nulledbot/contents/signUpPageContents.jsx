"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RogIconHome } from "@/app/nulledbot/icons/nulledbotIcons";
import { AnimatePresence, motion } from "framer-motion";

export default function SignupPageContents() {
	const [username, setUsername] = useState("");
	const [key, setKey] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");
		try {
			const res = await fetch("/api/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, key }),
			});
			const data = await res.json();
			setLoading(false);

			if (data.success) {
				setSuccess("Account created! You can now login.");
				setTimeout(() => router.push("/nulledbot/login"), 1500);
			} else {
				setError(data.error || "Signup failed");
			}
		} catch (err) {
			setLoading(false);
			setError("An unexpected error occurred");
		}
	};

	return (
		<AnimatePresence>
			<div className="flex items-center justify-center overflow-hidden">
				<motion.div
					initial={{ opacity: 0, x: 50 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 50 }}
					transition={{ duration: 0.5 }}
					className="flex flex-col items-center justify-center min-h-screen"
				>
					<form
						onSubmit={handleSubmit}
						className="bg-black p-8 rounded shadow w-80"
					>
						<div className="flex items-center justify-between">
							<h2 className="text-2xl mb-4">Sign Up</h2>
							<p onClick={() => router.push("/nulledbot/home")}>
								<RogIconHome className="w-10 mb-5" />
							</p>
						</div>
						<input
							type="text"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full mb-4 p-2 border rounded"
							required
							autoComplete="off"
						/>
						<input
							type="password"
							placeholder="Key"
							value={key}
							onChange={(e) => setKey(e.target.value)}
							className="w-full mb-4 p-2 border rounded"
							required
							autoComplete="off"
						/>
						{error && <div className="text-red-500 mb-2">{error}</div>}
						{success && <div className="text-green-500 mb-2">{success}</div>}
						<button
							type="submit"
							disabled={loading}
							className={`tombol hover:ring-green-600 ${
								loading ? "opacity-70 cursor-not-allowed" : ""
							}`}
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
								"Sign Up"
							)}
						</button>
						<div className="mt-4 text-center flex gap-2 cursor-pointer">
							<span>Already have an account? </span>
							<p
								onClick={() => router.push("/nulledbot/login")}
								className="relative text-red-700 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[1.5px] after:bg-red-700 after:transition-all after:duration-300 hover:after:w-full"
							>
								Login
							</p>
						</div>
					</form>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
