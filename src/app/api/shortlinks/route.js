import clientPromise from "../../../lib/mongodb";
import { auth } from "@/auth";
import { checkUrlStatus } from "../../../lib/checkUrl";

async function getSubscriptionType(username) {
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("user_profiles").findOne({ username });
    return user?.subscriptionType || "free";
}

export async function GET(req) {
    const session = await auth();

    if (!session || !session.user || !session.user.username) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const shortlinks = await db.collection("shortlinks").find({ owner: session.user.username }).toArray();

    return new Response(JSON.stringify(shortlinks), { status: 200 });
}

export async function POST(req) {
    const session = await auth();

    if (!session || !session.user || !session.user.username) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { url, secondaryUrl, key, statusCode, allowedDevice, connectionType, allowedCountry, allowedIsp } = await req.json();

    if (!url || !key) {
        return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const username = session.user.username;
    const subscriptionType = await getSubscriptionType(username);

    if (subscriptionType === "free" && (allowedDevice || connectionType || allowedCountry || allowedIsp)) {
        return new Response(
            JSON.stringify({
                error: "Free users cannot use advanced filters (device, ISP, country, or connection type)",
            }),
            { status: 403 }
        );
    }

    const client = await clientPromise;
    const db = client.db();

    const exists = await db.collection("shortlinks").findOne({ owner: username, key });

    if (exists) {
        return new Response(JSON.stringify({ error: "Key already exists" }), { status: 409 });
    }

    const primaryUrlStatus = await checkUrlStatus(url);
    const secondaryUrlStatus = secondaryUrl ? await checkUrlStatus(secondaryUrl) : null;

    const doc = {
        owner: username,
        url,
        secondaryUrl: secondaryUrl || null,
        key,
        status: "ACTIVE",
        primaryUrlStatus,
        secondaryUrlStatus,
        statusCode,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    if (subscriptionType !== "free") {
        doc.allowedDevice = allowedDevice;
        doc.connectionType = connectionType;
        doc.allowedCountry = allowedCountry;
        doc.allowedIsp = allowedIsp;
    }

    await db.collection("shortlinks").insertOne(doc);
    return new Response(JSON.stringify({ success: true }), { status: 201 });
}

export async function PUT(req) {
    const session = await auth();

    if (!session || !session.user || !session.user.username) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const {
        originalKey,
        key,
        url,
        secondaryUrl,
        statusCode,
        allowedDevice,
        connectionType,
        allowedCountry,
        allowedIsp,
    } = await req.json();

    if (!originalKey || !key || !url) {
        return new Response(JSON.stringify({ error: "Missing originalKey, key, or url" }), { status: 400 });
    }

    const primaryUrlStatus = await checkUrlStatus(url);
    const secondaryUrlStatus = secondaryUrl ? await checkUrlStatus(secondaryUrl) : null;

    const username = session.user.username;
    const subscriptionType = await getSubscriptionType(username);

    const client = await clientPromise;
    const db = client.db();

    if (originalKey !== key) {
        const existing = await db.collection("shortlinks").findOne({ owner: username, key });
        if (existing) {
            return new Response(JSON.stringify({ error: "New key already exists" }), { status: 409 });
        }
    }

    const updateFields = {
        key,
        url,
        secondaryUrl: secondaryUrl || null,
        primaryUrlStatus,
        secondaryUrlStatus,
        statusCode,
        updatedAt: new Date(),
    };

    if (subscriptionType !== "free") {
        if (allowedDevice !== undefined) updateFields.allowedDevice = allowedDevice;
        if (connectionType !== undefined) updateFields.connectionType = connectionType;
        if (allowedCountry !== undefined) updateFields.allowedCountry = allowedCountry;
        if (allowedIsp !== undefined) updateFields.allowedIsp = allowedIsp;
    }

    const result = await db.collection("shortlinks").updateOne(
        { owner: username, key: originalKey },
        { $set: updateFields }
    );

    if (result.matchedCount === 0) {
        return new Response(JSON.stringify({ error: "Shortlink not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function PATCH(req) {
    const session = await auth();
    if (!session?.user?.username) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { key, newStatus } = await req.json();

    if (!key || !newStatus) {
        return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("shortlinks").updateOne(
        { owner: session.user.username, key },
        { $set: { status: newStatus, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
        return new Response(JSON.stringify({ error: "Shortlink not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function DELETE(req) {
    const session = await auth();

    if (!session || !session.user || !session.user.username) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { key } = await req.json();

    if (!key) {
        return new Response(JSON.stringify({ error: "Missing key" }), { status: 400 });
    }

    const username = session.user.username;

    const client = await clientPromise;
    const db = client.db();

    const shortlink = await db.collection("shortlinks").findOne({ owner: username, key });

    if (!shortlink) {
        return new Response(JSON.stringify({ error: "Shortlink not found" }), { status: 404 });
    }

    await db.collection("shortlinks").deleteOne({ _id: shortlink._id });

    await db.collection("visitors").deleteMany({
        $or: [
            { shortlinkKey: key },
            { shortlinkId: shortlink._id },
        ],
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}
