import clientPromise from "../../../lib/mongodb";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();

        const users = await db.collection("users").find().toArray();
        const profiles = await db.collection("user_profiles").find().toArray();

        const usersWithProfiles = users.map((user) => {
            const profile = profiles.find((p) => p.username === user.username);
            return {
                username: user.username,
                apiKey: profile?.apiKey || null,
                status: profile?.status || "waiting",
                subscription: profile?.subscription || null,
                subscriptionType: profile?.subscriptionType || null,
            };
        });

        return new Response(JSON.stringify({ users: usersWithProfiles }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function PATCH(req) {
    try {
        const { username, status, subscription, subscriptionType } = await req.json();

        if (!username || !status) {
            return new Response(JSON.stringify({ error: "Username and status are required" }), {
                status: 400,
            });
        }

        const client = await clientPromise;
        const db = client.db();

        const updateDoc = { status };

        if (subscription) {
            updateDoc.subscription = subscription;
            updateDoc.subscriptionType = subscriptionType;
            updateDoc.subscriptionStart = new Date();
        }

        const result = await db.collection("user_profiles").updateOne(
            { username },
            { $set: updateDoc }
        );

        if (result.matchedCount === 0) {
            return new Response(JSON.stringify({ error: "User not found" }), {
                status: 404,
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}

export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
        return new Response(JSON.stringify({ error: "Username is required" }), {
            status: 400,
        });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        await db.collection("users").deleteOne({ username });

        await db.collection("user_profiles").deleteOne({ username });

        await db.collection("shortlinks").deleteMany({ owner: username });

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}
