"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "@/app/loading";
import { RogIcon } from "../icons/nulledbotIcons";
import ShortlinkTab from "./tabs/shortlink";
import AccountTab from "./tabs/account";

const navItems = [
	{ name: "Shortlink & Blocker", href: "/nulledbot/dashboard?tab=shortlink" },
	{ name: "Tutorial", href: "/nulledbot/dashboard?tab=tutorial" },
	{ name: "Customization", href: "/nulledbot/dashboard?tab=customization" },
	{ name: "IP Management", href: "/nulledbot/dashboard?tab=ip_management" },
	{ name: "Account", href: "/nulledbot/dashboard?tab=account" },
	{ name: "Subscription", href: "/nulledbot/dashboard?tab=subscription" },
];

export default function DashboardPageContents() {
	const [timeLeft, setTimeLeft] = useState(null);
	const [subscriptionType, setSubscriptionType] = useState(null);
	const [subscriptionLoading, setSubscriptionLoading] = useState(true);
	const [openApiKey, setOpenApiKey] = useState(false);
	const { data: session, status } = useSession();
	const router = useRouter();
	const searchParams = useSearchParams();
	const tab = searchParams.get("tab") || "shortlink";

	const [shortlinks, setShortlinks] = useState([]);
	const [form, setForm] = useState({
		url: "",
		key: "",
		statusCode: "",
		allowedDevice: "",
		connectionType: "",
		allowedCountry: "",
		allowedIsp: "",
	});
	const [formError, setFormError] = useState("");
	const [formLoading, setFormLoading] = useState(false);
	const [navBar, setNavbar] = useState(false);
	const [editModal, setEditModal] = useState({
		open: false,
		data: null,
		loading: false,
		error: "",
	});

	useEffect(() => {
		async function fetchShortlinks() {
			if (tab === "shortlink" && status === "authenticated") {
				const res = await fetch("/api/shortlinks", {
					credentials: "include",
				});
				const data = await res.json();
				setShortlinks(Array.isArray(data) ? data : []);
			}
		}
		fetchShortlinks();
	}, [tab, status]);

	const [visitorsModal, setVisitorsModal] = useState({
		open: false,
		key: null,
		data: null,
	});

	if (status === "loading") {
		return <Loading />;
	}

	useEffect(() => {
		const fetchSubscription = async () => {
			try {
				setSubscriptionLoading(true);

				const res = await fetch(`/api/subscription/${session?.user?.username}`);
				if (!res.ok) throw new Error("Failed to fetch subscription");

				const data = await res.json();

				if (
					!data.subscription ||
					!data.subscriptionType ||
					!data.subscriptionStart
				) {
					setTimeLeft("unlimited");
					return;
				}

				const start = new Date(data.subscriptionStart);
				let expiry = new Date(start);
				const sub = data.subscription;
				const subType = data.subscriptionType;

				if (sub.endsWith("minute")) {
					expiry.setMinutes(expiry.getMinutes() + parseInt(sub));
				} else if (sub.endsWith("day")) {
					expiry.setDate(expiry.getDate() + parseInt(sub));
				} else if (sub.endsWith("month")) {
					expiry.setMonth(expiry.getMonth() + parseInt(sub));
				} else if (sub.endsWith("year")) {
					expiry.setFullYear(expiry.getFullYear() + parseInt(sub));
				}

				const updateTimer = () => {
					const now = new Date();
					const diff = expiry - now;

					if (diff <= 0) {
						(async () => {
							await fetch("/api/karma", {
								method: "PATCH",
								credentials: "include",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									username: session?.user?.username,
									status: "expired",
								}),
							});
							signOut();
						})();
						return;
					}

					const minutes = Math.floor((diff / 1000 / 60) % 60);
					const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
					const seconds = Math.floor((diff / 1000) % 60);
					const days = Math.floor(diff / 1000 / 60 / 60 / 24);

					setTimeLeft({ days, hours, minutes, seconds });
					setSubscriptionType(subType);
				};

				updateTimer();
				const interval = setInterval(updateTimer, 1000);

				return () => clearInterval(interval);
			} catch (err) {
				console.error(err);
			} finally {
				setSubscriptionLoading(false);
			}
		};

		if (session?.user?.username) {
			fetchSubscription();
		}
	}, [session]);

	function renderTabComponent() {
		if (tab === "shortlink") {
			return (
				<ShortlinkTab
					tab={tab}
					form={form}
					setForm={setForm}
					formError={formError}
					setFormError={setFormError}
					formLoading={formLoading}
					setFormLoading={setFormLoading}
					shortlinks={shortlinks}
					setShortlinks={setShortlinks}
					visitorsModal={visitorsModal}
					setVisitorsModal={setVisitorsModal}
					editModal={editModal}
					setEditModal={setEditModal}
					subscriptionType={subscriptionType}
				/>
			);
		} else if (tab === "account") {
			return (
				<AccountTab
					tab={tab}
					session={session}
					openApiKey={openApiKey}
					setOpenApiKey={setOpenApiKey}
					subscriptionType={subscriptionType}
				/>
			);
		} else {
			return (
				<div className="text-center text-lg text-white/80 italic">
					{tab.replace(/_/g, " ")} Page is coming soon.
				</div>
			);
		}
	}

	return (
		<div className="flex min-h-screen overflow-hidden">
			<AnimatePresence mode="wait">
				{navBar && (
					<motion.aside
						initial={{ width: 0 }}
						animate={{ width: 256 }}
						exit={{ width: 0 }}
						transition={{ duration: 0.1, ease: "easeInOut" }}
						className="overflow-hidden bg-black text-white p-4 border-r border-white"
					>
						<div className="flex justify-between items-center mb-10">
							<h1 className="text-xl">NulledBot</h1>
							<RogIcon
								setNavbar={setNavbar}
								className="mb-3 w-10 animate-pulse max-w-max"
							/>
						</div>
						<nav className="flex-1">
							<ul>
								{navItems.map((item) => {
									const isActive = tab === item.href.split("=")[1];
									return (
										<li
											key={item.name}
											className={`transition duration-300 p-2 cursor-pointer ${
												isActive
													? "text-red-700 font-bold px-5"
													: "hover:text-blue-700"
											}`}
										>
											<p onClick={() => router.push(item.href)}>{item.name}</p>
										</li>
									);
								})}
							</ul>
						</nav>
					</motion.aside>
				)}
			</AnimatePresence>

			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.4 }}
				className="flex-1 px-5"
			>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
					className={`flex items-center justify-between py-5`}
				>
					<RogIcon
						setNavbar={setNavbar}
						className={`w-10 max-w-max ${navBar ? "opacity-0" : ""}`}
					/>
					<div>
						{subscriptionLoading ? (
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
						) : timeLeft === "unlimited" ? (
							<p className="text-sm text-green-500">Subscription : UNLIMITED</p>
						) : (
							timeLeft && (
								<p
									className={`ml-5 text-sm font-bold ${
										timeLeft.days > 0
											? "text-green-700 animate-pulse"
											: "text-red-700 animate-pulse"
									}`}
								>
									Subscription expires in :{" "}
									{`${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
								</p>
							)
						)}
					</div>
					<button
						onClick={() => signOut()}
						className="cursor-pointer relative font-bold text-red-700 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[1.5px] after:bg-red-700 after:transition-all after:duration-300 hover:after:w-full"
					>
						Sign Out
					</button>
				</motion.div>

				<AnimatePresence mode="wait">
					<motion.div
						key={tab}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.4 }}
					>
						{renderTabComponent()}
					</motion.div>
				</AnimatePresence>
			</motion.main>
		</div>
	);
}
