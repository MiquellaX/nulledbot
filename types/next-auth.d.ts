// src/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			username: string;
		} & DefaultSession["user"];
		username: string;
		token?: string;
	}

	interface User extends DefaultUser {
		id: string;
		username: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		username: string;
		jti?: string;
		token?: string;
		accessToken?: string;
	}
}
