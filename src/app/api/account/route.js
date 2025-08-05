import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    let username = searchParams.get("username");
    if (!username) {
        return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }
    try {
        const client = await clientPromise;
        const db = client.db();
        let userProfile = await db.collection("user_profiles").findOne({ username });
        if (!userProfile || !userProfile.apiKey) {
            const apiKey = crypto.randomBytes(32).toString("hex");
            await db.collection("user_profiles").updateOne(
                { username },
                { $set: { apiKey } },
                { upsert: true }
            );
            return NextResponse.json({ apiKey });
        }
        return NextResponse.json({ apiKey: userProfile.apiKey });
    } catch (err) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}
