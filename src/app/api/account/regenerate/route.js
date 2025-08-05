import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

function generateApiKey() {
    return (
        crypto.randomBytes(9).toString("hex")
    );
}

export async function POST(req) {
    let { username } = await req.json();
    if (!username) {
        return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }
    try {
        const client = await clientPromise;
        const db = client.db();
        const newApiKey = generateApiKey();
        const result = await db.collection("user_profiles").findOneAndUpdate(
            { username },
            { $set: { apiKey: newApiKey } },
            { upsert: true, returnDocument: "after" }
        );
        return NextResponse.json({ success: true, apiKey: newApiKey });
    } catch (err) {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}
