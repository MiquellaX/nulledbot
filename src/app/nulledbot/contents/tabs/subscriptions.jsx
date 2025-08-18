import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import CustomerInfoModal from "@/app/nulledbot/contents/modal/customerDetails";
import { useRouter } from "next/navigation";
export default function Subscription({}) {
	const [billing, setBilling] = useState("monthly");
	const [selectedPlan, setSelectedPlan] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [screenWidth, setScreenWidth] = useState(0);
	const router = useRouter();
	useEffect(() => {
		if (typeof window !== "undefined") {
			setScreenWidth(window.innerWidth);

			const handleResize = () => {
				setScreenWidth(window.innerWidth);
			};

			window.addEventListener("resize", handleResize);

			return () => {
				window.removeEventListener("resize", handleResize);
			};
		}
	}, []);
	const plans = [
		{
			name: "Free",
			priceWeekly: "Rp.0",
			priceMonthly: "Rp.0",
			priceYearly: "Rp.0",
			features: ["Basic bot filtering", "Community support", "Limited stats"],
			urls: {
				weekly: "/nulledbot/signup",
				monthly: "/nulledbot/signup",
				yearly: "/nulledbot/signup",
			},
		},
		{
			name: "Pro",
			priceWeekly: "Rp.150.000",
			priceMonthly: "Rp.450.000",
			priceYearly: "Rp.2.100.000",
			features: [
				"Advanced bot protection",
				"Geo/IP filtering",
				"Analytics dashboard",
			],
			urls: {
				weekly: "https://app.sandbox.midtrans.com/payment-links/pro-weekly",
				monthly: "https://app.sandbox.midtrans.com/payment-links/pro-monthly",
				yearly: "https://app.sandbox.midtrans.com/payment-links/pro-yearly",
			},
		},
		{
			name: "Enterprise",
			priceWeekly: "Rp.450.000",
			priceMonthly: "Rp.1.485.000",
			priceYearly: "Rp.3.240.000",
			features: ["Custom rules", "Priority support", "Unlimited shortlinks"],
			urls: {
				weekly:
					"https://app.sandbox.midtrans.com/payment-links/enterprise-weekly",
				monthly:
					"https://app.sandbox.midtrans.com/payment-links/enterprise-monthly",
				yearly:
					"https://app.sandbox.midtrans.com/payment-links/enterprise-yearly",
			},
		},
	];

	const getPrice = (plan) => {
		switch (billing) {
			case "weekly":
				return plan.priceWeekly;
			case "monthly":
				return plan.priceMonthly;
			case "yearly":
				return plan.priceYearly;
			default:
				return plan.priceMonthly;
		}
	};
	const handlePayment = async (
		plan,
		customerName,
		customerEmail,
		customerKey
	) => {
		const toastPosition = screenWidth < 1148 ? "bottom-center" : "top-right";
		const usdAmount = parseInt(
			plan[
				`price${billing.charAt(0).toUpperCase() + billing.slice(1)}`
			].replace("$", "")
		);

		const rupiahString =
			plan[`price${billing.charAt(0).toUpperCase() + billing.slice(1)}`];
		const amount = parseInt(rupiahString.replace(/[Rp.\s]/g, ""));

		const createTransactionAndPay = async () => {
			const res = await fetch("/api/midtrans", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount,
					items: [
						{
							id: `${plan.name.toLowerCase()}-plan`,
							price: amount,
							quantity: 1,
							name: `${plan.name} Plan - ${billing}`,
						},
					],
					customer: {
						first_name: customerName,
						email: customerEmail,
					},
				}),
			});

			const data = await res.json();
			if (!res.ok || !data.token) {
				throw new Error("Failed to get Snap token");
			}

			return new Promise((resolve, reject) => {
				window.snap.pay(data.token, {
					onSuccess: async function (result) {
						toast.success("Payment successful!");

						try {
							const payload = {
								username: customerName,
								key: customerKey,
								planName: plan.name,
								billing: billing,
							};

							let res = await fetch("/api/signup-paid", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify(payload),
							});

							if (res.status === 409) {
								res = await fetch("/api/signup-paid", {
									method: "PATCH",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify(payload),
								});
							}

							const data = await res.json();

							if (!data.success) {
								toast.error(`Account process failed: ${data.error}`);
								return;
							}

							router.push(
								`/nulledbot/login?user=${encodeURIComponent(customerName)}`
							);
						} catch (err) {
							toast.error(
								"Something went wrong while processing your account."
							);
						}

						resolve(result);
					},
					onPending: function (result) {
						toast.info("Payment is pending.");
						resolve(result);
					},
					onError: function (result) {
						if (result.error_code === "INSUFFICIENT_FUNDS") {
							reject(new Error("INSUFFICIENT_FUNDS"));
						} else if (result.error_code === "INVALID_CARD") {
							reject(new Error("INVALID_CARD"));
						} else {
							reject(new Error("PAYMENT_FAILED"));
						}
					},
					onClose: function () {
						reject(new Error("USER_CLOSED_PAYMENT"));
					},
				});
			});
		};

		await toast.promise(createTransactionAndPay(), {
			loading: "Processing payment...",
			success: "Payment Finished.",
			error: (err) => {
				if (err.message === "USER_CLOSED_PAYMENT")
					return "Payment was cancelled.";
				if (err.message === "INSUFFICIENT_FUNDS")
					return "Insufficient funds. Please check your balance.";
				if (err.message === "INVALID_CARD")
					return "Invalid card. Please verify your card details.";
				if (err.message === "PAYMENT_FAILED")
					return "Payment failed. Please try again.";
				return "There was an error processing your payment. Please try again.";
			},
			position: toastPosition,
		});
	};
	return (
		<>
			<h2 className="text-2xl font-bold mb-8">PRICING</h2>
			<div className="mb-6 flex justify-center">
				<div className="inline-flex bg-gradient-to-br from-black/30 to-red-700/50 rounded-full p-1 shadow-inner text-white">
					{["weekly", "monthly", "yearly"].map((option, index) => {
						const isActive = billing === option;
						return (
							<button
								key={option}
								onClick={() => setBilling(option)}
								className={`px-5 py-2 text-xs font-semibold transition-all duration-200 ${
									isActive
										? "bg-red-700 text-white hover:text-white cursor-default"
										: "text-white hover:text-blue-800 cursor-pointer transition duration-300"
								}
                                        ${index === 0 ? "rounded-l-full" : ""}
                                        ${index === 2 ? "rounded-r-full" : ""}
                                        ${index === 1 ? "rounded-none" : ""}
                                    `}
							>
								{option.charAt(0).toUpperCase() + option.slice(1)}
							</button>
						);
					})}
				</div>
			</div>

			<div className="grid md:grid-cols-3 gap-6 mt-8">
				{plans.map((plan, index) => (
					<motion.div
						key={plan.name}
						className="ring-1 bg-gradient-to-br from-black/30 to-red-700/50 text-white rounded-xl p-6 space-y-4"
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.2, duration: 0.2 }}
						viewport={{ once: false }}
					>
						<h3 className="text-2xl font-semibold">{plan.name}</h3>
						<div className="text-xl font-bold text-green-600">
							{getPrice(plan)}
						</div>
						<ul className="text-left space-y-1 text-white/60 text-sm">
							{plan.features.map((f, i) => (
								<li key={i}>• {f}</li>
							))}
						</ul>
						<button
							onClick={() => {
								if (plan.name === "Free") {
									router.push("/nulledbot/signup");
									return;
								}
								setSelectedPlan(plan);
								setShowModal(true);
							}}
							className="bg-red-700 py-2 px-5 rounded-lg cursor-pointer hover:ring-2 hover:ring-green-600 transition duration-300"
						>
							Choose {plan.name}
						</button>
					</motion.div>
				))}
				<CustomerInfoModal
					isOpen={showModal}
					onClose={() => setShowModal(false)}
					onSubmit={({ username, email, key }) => {
						handlePayment(selectedPlan, username, email, key);
					}}
				/>
			</div>
		</>
	);
}
