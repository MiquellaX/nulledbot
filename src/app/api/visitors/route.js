import clientPromise from "@/lib/mongodb";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
        return new Response(JSON.stringify({ error: "Missing key param" }), { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        const visitors = await db
            .collection("visitors")
            .find({ shortlinkKey: key })
            .sort({ visitedAt: -1 })
            .limit(50)
            .toArray();

        return new Response(JSON.stringify({ visitors }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch visitors" }), { status: 500 });
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
        return new Response(JSON.stringify({ error: "Missing key param" }), { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        const result = await db.collection("visitors").deleteMany({ shortlinkKey: key });

        return new Response(JSON.stringify({ success: true, deleted: result.deletedCount }), {
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to delete visitors" }), { status: 500 });
    }
}
