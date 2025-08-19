import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
        return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        let userProfile = await db.collection("user_profiles").findOne({ username });
        let apiKey = userProfile?.apiKey;
        if (!apiKey) {
            apiKey = crypto.randomBytes(32).toString("hex");
            await db.collection("user_profiles").updateOne(
                { username },
                { $set: { apiKey } },
                { upsert: true }
            );
        }

        const result = await db.collection("visitors").aggregate([
            {
                $lookup: {
                    from: "shortlinks",
                    localField: "shortlinkId",
                    foreignField: "_id",
                    as: "shortlink"
                }
            },
            { $unwind: "$shortlink" },
            {
                $match: {
                    "shortlink.owner": username
                }
            },
            {
                $group: {
                    _id: null,
                    totalVisitors: { $sum: 1 },
                    humanCount: {
                        $sum: { $cond: [{ $eq: ["$isBot", false] }, 1, 0] }
                    },
                    botCount: {
                        $sum: { $cond: [{ $eq: ["$isBot", true] }, 1, 0] }
                    },
                    blockedCount: {
                        $sum: { $cond: [{ $eq: ["$isBlocked", true] }, 1, 0] }
                    }
                }
            }
        ]).toArray();

        const stats = result[0] || {
            totalVisitors: 0,
            humanCount: 0,
            botCount: 0,
            blockedCount: 0
        };

        return NextResponse.json({
            apiKey,
            ...stats
        });
    } catch (err) {
        console.error("Error in /api/account:", err);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}
