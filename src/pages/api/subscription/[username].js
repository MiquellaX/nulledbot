import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
    const { username } = req.query;

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const profile = await db.collection("user_profiles").findOne({ username });

        if (!profile) {
            return res.status(404).json({ error: "Profile not found" });
        }

        return res.status(200).json({
            subscription: profile.subscription || null,
            subscriptionType: profile.subscriptionType || null,
            subscriptionStart: profile.subscriptionStart || null,
            status: profile.status || "waiting"
        });
    } catch (error) {
        console.error("Subscription API error:", error); // 👈 Add this
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
