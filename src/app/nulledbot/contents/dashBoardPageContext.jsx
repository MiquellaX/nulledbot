"use client";
import React, { useEffect } from "react";
import DashboardPageContents from "@/app/nulledbot/contents/dashboardPageContents";
import { SessionProvider, useSession } from "next-auth/react";
import Loading from "@/app/loading";
import { useRouter } from "next/navigation";

function DashboardGuard({ children }) {
	const { status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/nulledbot/login");
		}
	}, [status, router]);

	if (status === "loading") return <Loading />;
	if (status === "unauthenticated") return null;

	return children;
}

export default function DashboardPageContext() {
	return (
		<SessionProvider>
			<DashboardGuard>
				<DashboardPageContents />
			</DashboardGuard>
		</SessionProvider>
	);
}
