import NextAuth from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../lib/mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

const handler = NextAuth({
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "yourusername" },
                key: { label: "Key", type: "password" },
            },
            async authorize(credentials) {
                const client = await clientPromise;
                const db = client.db();
                const { username, key } = credentials;

                const user = await db.collection("users").findOne({ username });
                if (!user) throw new Error("Invalid Username or Key.");

                const isValid = await compare(key, user.key);
                if (!isValid) throw new Error("Invalid Username or Key.");

                const profile = await db.collection("user_profiles").findOne({ username });
                if (!profile) throw new Error("Profile not found.");

                switch (profile.status) {
                    case "waiting":
                        throw new Error("Account is awaiting approval.");
                    case "denied":
                        throw new Error("Account has been denied.");
                    case "expired":
                        throw new Error("Subscription expired.");
                }

                // ✅ Subscription expiry logic
                if (profile.subscription && profile.subscriptionStart) {
                    const start = new Date(profile.subscriptionStart);
                    const match = profile.subscription.match(/^(\d+)(minute|day|month|year)s?$/);
                    if (match) {
                        const value = parseInt(match[1]);
                        const unit = match[2];
                        const expiryDate = new Date(start);
                        switch (unit) {
                            case "minute":
                                expiryDate.setMinutes(expiryDate.getMinutes() + value);
                                break;
                            case "day":
                                expiryDate.setDate(expiryDate.getDate() + value);
                                break;
                            case "month":
                                expiryDate.setMonth(expiryDate.getMonth() + value);
                                break;
                            case "year":
                                expiryDate.setFullYear(expiryDate.getFullYear() + value);
                                break;
                        }

                        if (new Date() > expiryDate) {
                            await db.collection("user_profiles").updateOne(
                                { username },
                                { $set: { status: "expired" } }
                            );
                            throw new Error("Subscription expired.");
                        }
                    }
                }

                return { id: user._id, username: user.username };
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24,
    },
    pages: {
        signIn: "/nulledbot/login",
        signOut: "/nulledbot/logout",
        error: "/nulledbot/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            const client = await clientPromise;
            const db = client.db();

            const user = await db.collection("users").findOne({ username: token.username });
            if (!user) return null;

            session.user.id = token.sub;
            session.username = token.username;
            session.user.username = token.username;
            session.token = token.jti || token.token || token.accessToken || token.username;

            return session;
        }
    }
});

// ✅ Correct default export for API route
export { handler as GET, handler as POST }; // for App Router
export default handler; // for Pages Router compatibility
