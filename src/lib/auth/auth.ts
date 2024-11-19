import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Tuto : https://www.youtube.com/watch?v=AbUVY16P4Ys&t=782s

if (!process.env.GOOGLE_CLIENT_ID) throw new Error("Missing env.GOOGLE_CLIENT_ID");

if (!process.env.GOOGLE_CLIENT_SECRET) throw new Error("Missing env.GOOGLE_CLIENT_SECRET");

export const authConfig: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		}),
	],
};
