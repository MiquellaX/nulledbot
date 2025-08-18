"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "@/app/loading";
import { RogIcon } from "../icons/nulledbotIcons";
import ShortlinkTab from "./tabs/shortlink";
import AccountTab from "./tabs/account";
import TutorialTab from "./tabs/tutorial";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetClose,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet";
import Subscription from "./tabs/subscriptions";
import IpManagements from "./tabs/ipManagement";

const navItems = [
	{ name: "Account", href: "/nulledbot/dashboard?tab=account" },
	{ name: "Shortlink & Blocker", href: "/nulledbot/dashboard?tab=shortlink" },
	{ name: "Tutorial", href: "/nulledbot/dashboard?tab=tutorial" },
	{ name: "IP Management", href: "/nulledbot/dashboard?tab=ip_management" },
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
	const tab = searchParams.get("tab") || "account";

	const [shortlinks, setShortlinks] = useState([]);
	const [loadingShortlinks, setLoadingShortlinks] = useState(true);
	const [form, setForm] = useState({
		url: "",
		secondaryUrl: "",
		key: "",
		statusCode: "",
		allowedDevice: "",
		connectionType: "",
		allowedCountry: "",
		allowedIsp: "",
	});
	const [formError, setFormError] = useState("");
	const [editModal, setEditModal] = useState({
		open: false,
		data: null,
		loading: false,
		error: "",
	});

	useEffect(() => {
		async function fetchShortlinks() {
			if (tab === "shortlink" && status === "authenticated") {
				setLoadingShortlinks(true);
				try {
					const res = await fetch("/api/shortlinks", {
						credentials: "include",
					});
					const data = await res.json();
					setShortlinks(Array.isArray(data) ? data : []);
				} catch (err) {
					setShortlinks([]);
				} finally {
					setLoadingShortlinks(false);
				}
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
					shortlinks={shortlinks}
					setShortlinks={setShortlinks}
					loadingShortlinks={loadingShortlinks}
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
		} else if (tab === "tutorial") {
			return (
				<TutorialTab
					tab={tab}
					session={session}
					openApiKey={openApiKey}
					setOpenApiKey={setOpenApiKey}
					subscriptionType={subscriptionType}
				/>
			);
		} else if (tab === "subscription") {
			return (
				<div className="relative min-h-[60vh] px-8 text-center max-w-4xl mx-auto flex flex-col justify-center">
					<Subscription />
				</div>
			);
		} else if (tab === "ip_management") {
			return (
				<div className="relative min-h-[60vh] px-8 text-center max-w-4xl mx-auto flex flex-col justify-center">
					<IpManagements />
				</div>
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
			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.2 }}
				className="flex-1 px-5"
			>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className={`flex flex-col md:flex-row lg:flex-row xl:flex-row items-center justify-between py-5`}
				>
					<Sheet>
						<SheetTrigger asChild>
							<p>
								<RogIcon className="w-10 max-w-max cursor-pointer" />
							</p>
						</SheetTrigger>
						<SheetContent
							side="left"
							className="bg-gradient-to-br from-black to-red-900/90 text-white ring-r-1 w-full md:w-82 lg:w-82 xl:w-82 p-4 "
						>
							<SheetTitle className={"text-xl"}>NulledBot</SheetTitle>
							<SheetDescription className={"text-base font-semibold"}>
								<span className="flex-1">
									<span>
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
													<SheetClose asChild>
														<span onClick={() => router.push(item.href)}>
															{item.name}
														</span>
													</SheetClose>
												</li>
											);
										})}
									</span>
								</span>
							</SheetDescription>
						</SheetContent>
					</Sheet>
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
									className={`ml-5 text-xs md:text-sm lg:text-sm xl:text-sm font-bold ${
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
						transition={{ duration: 0.2 }}
					>
						{renderTabComponent()}
					</motion.div>
				</AnimatePresence>
			</motion.main>
		</div>
	);
}
