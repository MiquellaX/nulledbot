import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./lib/mongodb";
import { compare } from "bcryptjs";
import { ObjectId } from "mongodb";

interface CustomUser {
	_id: ObjectId;
	username: string;
	key: string;
}

interface CustomProfile {
	username: string;
	status: string;
	subscription?: string;
	subscriptionStart?: string;
}

const config: NextAuthConfig = {
	adapter: MongoDBAdapter(clientPromise),
	providers: [
		Credentials({
			name: "Credentials",
			credentials: {
				username: { label: "Username", type: "text" },
				key: { label: "Key", type: "password" },
			},
			async authorize(credentials) {
				const client = await clientPromise;
				const db = client.db();

				const username = credentials?.username;
				const key = credentials?.key;

				// Validate input
				if (typeof username !== "string" || typeof key !== "string") {
					throw new Error("Invalid input");
				}

				const user = (await db
					.collection("users")
					.findOne({ username })) as CustomUser | null;

				if (!user || typeof user.key !== "string") {
					throw new Error("InvalidCredentials");
				}

				const isValid = await compare(key, user.key);
				if (!isValid) {
					throw new Error("InvalidCredentials");
				}

				const profile = (await db
					.collection("user_profiles")
					.findOne({ username })) as CustomProfile | null;

				if (!profile) {
					throw new Error("ProfileNotFound");
				}

				// Status-based blocking
				switch (profile.status) {
					case "expired":
						const expired = new Error(
							"Your subscription has expired. Please renew."
						);
						expired.name = "SubscriptionExpired";
						throw expired;
					case "waiting":
						const waiting = new Error("Your account is pending approval.");
						waiting.name = "AccountWaiting";
						throw waiting;
					case "denied":
						const denied = new Error("Your account has been denied access.");
						denied.name = "AccountDenied";
						throw denied;
				}

				// Subscription expiry logic
				if (profile.subscription && profile.subscriptionStart) {
					const start = new Date(profile.subscriptionStart);
					const match = profile.subscription.match(
						/^(\d+)(minute|day|month|year)s?$/
					);

					if (match) {
						const [_, value, unit] = match;
						const expiry = new Date(start);

						switch (unit) {
							case "minute":
								expiry.setMinutes(expiry.getMinutes() + parseInt(value));
								break;
							case "day":
								expiry.setDate(expiry.getDate() + parseInt(value));
								break;
							case "month":
								expiry.setMonth(expiry.getMonth() + parseInt(value));
								break;
							case "year":
								expiry.setFullYear(expiry.getFullYear() + parseInt(value));
								break;
						}

						if (new Date() > expiry) {
							await db
								.collection("user_profiles")
								.updateOne({ username }, { $set: { status: "expired" } });
							throw new Error("SubscriptionExpired");
						}
					}
				}

				return { id: user._id.toString(), username: user.username };
			},
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 60 * 60 * 24, // 1 day
	},
	pages: {
		signIn: "/nulledbot/login",
		error: "/nulledbot/login", // This allows ?error=...
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user && "username" in user) {
				token.username = user.username;
			}
			return token;
		},
		async session({ session, token }) {
			try {
				const client = await clientPromise;
				const db = client.db();

				const user = await db
					.collection("users")
					.findOne({ username: token.username });

				if (!user) return null;

				session.user.id = user._id.toString();
				session.user.username = token.username as string;
				session.username = token.username as string;
				session.token =
					token.jti || token.token || token.accessToken || token.username;

				return session;
			} catch (error) {
				return null;
			}
		},
	},
};

export const {
	auth,
	signIn,
	signOut,
	handlers: { GET, POST },
} = NextAuth(config);
