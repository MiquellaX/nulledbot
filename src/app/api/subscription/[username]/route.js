import clientPromise from "@/lib/mongodb";

export async function GET(req, { params }) {
    const username = params.username;

    if (!username) {
        return new Response(JSON.stringify({ error: "Username is required" }), {
            status: 400,
        });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const profile = await db.collection("user_profiles").findOne({ username });

        if (!profile) {
            return new Response(JSON.stringify({ error: "Profile not found" }), {
                status: 404,
            });
        }

        return new Response(
            JSON.stringify({
                subscription: profile.subscription || null,
                subscriptionType: profile.subscriptionType || null,
                subscriptionStart: profile.subscriptionStart || null,
                status: profile.status || "waiting"
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}
