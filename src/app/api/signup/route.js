import clientPromise from "../../../lib/mongodb";
import { hash } from "bcryptjs";
import crypto from "crypto";

export async function POST(req) {
    try {
        const { username, key } = await req.json();
        if (!username || !key) {
            return new Response(JSON.stringify({ success: false, error: "Username and key are required." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const client = await clientPromise;
        const db = client.db();

        const existingUser = await db.collection("users").findOne({ username });
        if (existingUser) {
            return new Response(JSON.stringify({ success: false, error: "Username already exists." }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const hashedKey = await hash(key, 10);
        const apiKey = crypto.randomBytes(9).toString("hex");

        await db.collection("users").insertOne({ username, key: hashedKey });

        await db.collection("user_profiles").insertOne({
            username,
            apiKey,
            status: "waiting",
            subscription: null,
            subscriptionType: null,
            subscriptionStart: null
        });

        return new Response(JSON.stringify({ success: true, apiKey }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

