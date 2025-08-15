import clientPromise from "../../../lib/mongodb";
import { hash } from "bcryptjs";
import crypto from "crypto";

export async function POST(req) {
    try {
        const { username, key, planName, billing } = await req.json();

        if (!username || !key || !planName || !billing) {
            return new Response(
                JSON.stringify({ success: false, error: "Missing required fields." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        const existingUser = await db.collection("users").findOne({ username });
        if (existingUser) {
            return new Response(
                JSON.stringify({ success: false, error: "Username already exists." }),
                { status: 409, headers: { "Content-Type": "application/json" } }
            );
        }

        const hashedKey = await hash(key, 10);
        const apiKey = crypto.randomBytes(9).toString("hex");

        await db.collection("users").insertOne({ username, key: hashedKey });

        let subscription = null;
        let subscriptionStart = new Date();
        if (billing.toLowerCase() === "weekly") {
            subscription = "7day";
        } else if (billing.toLowerCase() === "monthly") {
            subscription = "1month";
        } else if (billing.toLowerCase() === "yearly") {
            subscription = "1year";
        }

        await db.collection("user_profiles").insertOne({
            username,
            apiKey,
            status: "approved",
            subscription,
            subscriptionType: planName.toLowerCase(),
            subscriptionStart,
        });

        return new Response(JSON.stringify({ success: true, apiKey }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

export async function PATCH(req) {
    try {
        const { username, key, planName, billing } = await req.json();

        if (!username || !key || !planName || !billing) {
            return new Response(
                JSON.stringify({ success: false, error: "Missing required fields." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const client = await clientPromise;
        const db = client.db();

        const existingUser = await db.collection("users").findOne({ username });
        if (!existingUser) {
            return new Response(
                JSON.stringify({ success: false, error: "User does not exist." }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        const hashedKey = await hash(key, 10);

        await db.collection("users").updateOne(
            { username },
            { $set: { key: hashedKey } }
        );

        let subscription = null;
        let subscriptionStart = new Date();
        if (billing.toLowerCase() === "weekly") {
            subscription = "7day";
        } else if (billing.toLowerCase() === "monthly") {
            subscription = "1month";
        } else if (billing.toLowerCase() === "yearly") {
            subscription = "1year";
        }

        await db.collection("user_profiles").updateOne(
            { username },
            {
                $set: {
                    status: "approved",
                    subscription,
                    subscriptionType: planName.toLowerCase(),
                    subscriptionStart,
                },
            }
        );

        return new Response(
            JSON.stringify({ success: true, message: "User profile updated successfully." }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
