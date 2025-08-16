import clientPromise from "../../../../lib/mongodb";
import { auth } from "@/auth";

export async function PATCH(req) {
    const session = await auth();
    if (!session?.user?.username) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { key, url, status, type } = await req.json();

    if (!key || !url || !status || !type) {
        return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const updateField = type === "primary" ? "primaryUrlStatus" : "secondaryUrlStatus";

    const result = await db.collection("shortlinks").updateOne(
        { owner: session.user.username, key },
        { $set: { [updateField]: status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
        return new Response(JSON.stringify({ error: "Shortlink not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}
