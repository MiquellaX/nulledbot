import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";
import { rateLimit } from "@/lib/nulledBotRateLimiter";

const BOT_REDIRECT_URLS = [
    "https://httpbin.org/status/403",
    "https://www.google.com/robots.txt",
];
const RANDOM_BOT_REDIRECT =
    BOT_REDIRECT_URLS[Math.floor(Math.random() * BOT_REDIRECT_URLS.length)];

const SUSPICIOUS_UA_KEYWORDS = [
    "bot", "spider", "crawl", "curl", "wget", "python", "java",
    "httpclient", "libwww", "scrapy", "go-http-client",
    "phantomjs", "headless", "selenium", "node-fetch"
];

const CLOUD_PROVIDERS = [
    "cdnext", "amazon", "google", "apple", "microsoft",
    "digitalocean", "cloudflare", "datacamp", "ovh",
    "linode", "vultr", "akamai", "fastly"
];

const SUBSCRIPTION_LIMITS = {
    "free_7day": 100,
    "free_month": 100,
    "free_year": 100,
    "pro_7day": 32000,
    "pro_1month": 62000,
    "pro_1year": 122000,
    "enterprise_7day": 420000,
    "enterprise_1month": 860000,
    "enterprise_1year": 1620000,
};

function getSubscriptionEnd(startDate, duration) {
    const start = new Date(startDate);
    switch (duration) {
        case "7day": return new Date(start.setDate(start.getDate() + 7));
        case "month": return new Date(start.setMonth(start.getMonth() + 1));
        case "year": return new Date(start.setFullYear(start.getFullYear() + 1));
        default: return new Date(start.setDate(start.getDate() + 7));
    }
}

function handleBlock(reason, statusCode) {
    const code = Number(statusCode);
    if ([403, 404].includes(code)) {
        return NextResponse.json({ error: reason }, { status: code });
    }
    return NextResponse.redirect(RANDOM_BOT_REDIRECT);
}

function parseUserAgent(ua = "") {
    const parser = new UAParser(ua);
    const deviceType = parser.getDevice().type || "Desktop";
    const matchedBot = SUSPICIOUS_UA_KEYWORDS.find(k =>
        ua.toLowerCase().includes(k)
    );
    return { deviceType, matchedBot };
}

function extractIP(headers) {
    let ip =
        headers.get("x-visitor-ip-asli")?.trim() ||
        headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "8.8.8.8";

    if (["::1", "127.0.0.1"].includes(ip)) ip = "8.8.8.8";
    return ip;
}

async function fetchIPInfo(ip) {
    const fetchWithTimeout = (url, options = {}, timeout = 5000) =>
        Promise.race([
            fetch(url, options),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout")), timeout)
            ),
        ]);

    const [ipDetectiveRes, ipWhoRes] = await Promise.allSettled([
        fetchWithTimeout(`https://ipdetective.p.rapidapi.com/ip/${ip}?info=true`, {
            headers: {
                "x-rapidapi-key": process.env.X_API_KEY,
                "x-rapidapi-host": "ipdetective.p.rapidapi.com",
            },
        }),
        fetchWithTimeout(`https://ipwho.is/${ip}`),
    ]);

    let ipData = {}, ipwhoData = {}, success = false;

    if (ipDetectiveRes.status === "fulfilled") {
        const res = await ipDetectiveRes.value.json();
        if (!res.error) {
            ipData = res;
            success = true;
        }
    }

    if (ipWhoRes.status === "fulfilled") {
        const res = await ipWhoRes.value.json();
        if (res.success) {
            ipwhoData = res;
            success = true;
        }
    }

    return { ipData, ipwhoData, success };
}

function isBotByISP(isp = "", botFlag = false) {
    const lowerISP = isp.toLowerCase();
    return CLOUD_PROVIDERS.some(p => lowerISP.includes(p)) || botFlag;
}

function checkRestrictions({ shortlink, ipData, ipType, deviceType, matchedBot }) {
    const isp = ipData?.asn_description || "";
    const isBotISP = isBotByISP(isp, ipData?.bot);
    const userCountry = ipData?.country_code;

    if (!shortlink.allowedIsp || !isp.toLowerCase().includes(shortlink.allowedIsp.toLowerCase())) {
        if (isBotISP) return { blocked: true, reason: "BOT is not allowed" };
    }

    if (
        shortlink.allowedCountry &&
        (!userCountry || userCountry.toUpperCase() !== shortlink.allowedCountry.toUpperCase())
    ) {
        return { blocked: true, reason: "Your country is banned from accessing this resource." };
    }

    if (shortlink.allowedDevice && shortlink.allowedDevice !== "Allow All") {
        if (
            (shortlink.allowedDevice === "Mobile" && deviceType !== "Mobile") ||
            (shortlink.allowedDevice === "Desktop" && deviceType !== "Desktop")
        ) {
            return { blocked: true, reason: "Device not allowed" };
        }
    }

    const blockMap = {
        proxy: "PROXY is not allowed",
        vpn: "VPN is not allowed",
        datacenter: "DATACENTER is not allowed",
    };

    const ipFlags = ["vpn", "proxy", "datacenter"];
    if (
        (shortlink.connectionType === "Block Proxy" && ipType === "proxy") ||
        (shortlink.connectionType === "Block VPN" && ipType === "vpn") ||
        (shortlink.connectionType === "Block All" && ipFlags.includes(ipType)) ||
        ipType === "datacenter"
    ) {
        const reason =
            shortlink.connectionType === "Block All"
                ? "VPN or Proxy is not allowed"
                : blockMap[ipType] || "Access denied";
        return { blocked: true, reason };
    }

    if (matchedBot) {
        return { blocked: true, reason: "BOT User Agent" };
    }

    return { blocked: false, reason: "Real Human" };
}

export async function GET(req, context) {
    const db = (await clientPromise).db();
    const { key } = await context.params;
    const headers = req.headers;

    const ua = headers.get("user-agent") || "";
    const { deviceType, matchedBot } = parseUserAgent(ua);
    const ip = extractIP(headers);

    if (!(await rateLimit(ip))) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const apiKey = headers.get("x-api-key");
    const accept = headers.get("accept") || "";
    const isBrowser = accept.includes("text/html") || ua.toLowerCase().includes("mozilla");
    const userProfile = await db.collection("user_profiles").findOne({ apiKey });
    const shortlink = await db.collection("shortlinks").findOne({ key });
    const { ipData, ipwhoData, success } = await fetchIPInfo(ip);
    const ipType = (ipData?.type || "").toLowerCase();
    const { subscription, subscriptionType, subscriptionStart } = userProfile;
    const subKey = `${subscriptionType}_${subscription}`;
    const limit = SUBSCRIPTION_LIMITS[subKey];
    const subscriptionStartDate = new Date(subscriptionStart);
    const subscriptionEndDate = getSubscriptionEnd(subscriptionStartDate, subscription);

    if (!apiKey) {
        return isBrowser
            ? NextResponse.redirect("https://nulledbot.shop/nothingtoseehere/404")
            : NextResponse.json({ error: "Missing API key" }, { status: 404 });
    }

    if (!userProfile) return NextResponse.json({ error: "Invalid API key" }, { status: 403 });
    if (userProfile.status === "expired") return NextResponse.json({ error: "Subscription Expired." }, { status: 404 });
    if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
    if (!shortlink) return NextResponse.json({ error: "Shortlink not found" }, { status: 404 });
    if (!success) return NextResponse.json({ error: "Unable to verify IP location" }, { status: 502 });

    const finalUrl =
        (shortlink.primaryUrlStatus === "LIVE" && shortlink.url) ||
        (shortlink.secondaryUrlStatus === "LIVE" && shortlink.secondaryUrl) ||
        null;

    if (shortlink.whitelistedIps?.includes(ip)) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentLog = await db.collection("visitors").findOne({
            shortlinkKey: shortlink.key,
            ip,
            visitedAt: { $gt: oneHourAgo },
        });

        if (!recentLog) {
            try {
                await db.collection("visitors").insertOne({
                    shortlinkKey: shortlink.key,
                    shortlinkId: shortlink._id,
                    visitedAt: new Date(),
                    ip,
                    userAgent: ua,
                    device: deviceType,
                    apiKey,
                    location: {
                        country: ipwhoData.country,
                        country_code: ipwhoData.country_code,
                        region: ipwhoData.region,
                        city: ipwhoData.city,
                        latitude: ipwhoData.latitude,
                        longitude: ipwhoData.longitude,
                        isp: ipwhoData.connection?.isp || null,
                        flag_img: ipwhoData.flag?.img || null,
                    },
                    timezone: ipwhoData.timezone?.id || null,
                    type: "Whitelisted",
                    isBot: ipData?.bot,
                    isBlocked: false,
                    blockReason: "Whitelisted IP",
                });
            } catch (err) {
                console.error("Error logging whitelist visitor:", err);
            }
        }

        if (!finalUrl) {
            return NextResponse.json({ error: "No valid destination found" }, { status: 502 });
        }
        return NextResponse.redirect(finalUrl);
    }

    if (shortlink.blacklistedIps?.includes(ip)) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentLog = await db.collection("visitors").findOne({
            shortlinkKey: shortlink.key,
            ip,
            visitedAt: { $gt: oneHourAgo },
        });

        if (!recentLog) {
            try {
                await db.collection("visitors").insertOne({
                    shortlinkKey: shortlink.key,
                    shortlinkId: shortlink._id,
                    visitedAt: new Date(),
                    ip,
                    userAgent: ua,
                    device: deviceType,
                    apiKey,
                    location: {
                        country: ipwhoData.country,
                        country_code: ipwhoData.country_code,
                        region: ipwhoData.region,
                        city: ipwhoData.city,
                        latitude: ipwhoData.latitude,
                        longitude: ipwhoData.longitude,
                        isp: ipwhoData.connection?.isp || null,
                        flag_img: ipwhoData.flag?.img || null,
                    },
                    timezone: ipwhoData.timezone?.id || null,
                    type: "Blacklisted",
                    isBot: ipData?.bot,
                    isBlocked: true,
                    blockReason: "Blacklisted IP",
                });
                return handleBlock("IP Blacklisted", 403);
            } catch (err) {
            }
        }

        if (!finalUrl) {
            return NextResponse.json({ error: "No valid destination found" }, { status: 502 });
        }
        return NextResponse.redirect(finalUrl);
    }

    const { blocked, reason } = checkRestrictions({
        shortlink,
        ipData,
        ipType,
        deviceType,
        matchedBot,
    });

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentLog = await db.collection("visitors").findOne({
        shortlinkKey: shortlink.key,
        ip,
        visitedAt: { $gt: oneHourAgo },
    });

    if (!recentLog) {
        try {
            await db.collection("visitors").insertOne({
                shortlinkKey: shortlink.key,
                shortlinkId: shortlink._id,
                visitedAt: new Date(),
                ip,
                userAgent: ua,
                device: deviceType,
                apiKey,
                location: {
                    country: ipwhoData.country,
                    country_code: ipwhoData.country_code,
                    region: ipwhoData.region,
                    city: ipwhoData.city,
                    latitude: ipwhoData.latitude,
                    longitude: ipwhoData.longitude,
                    isp: ipwhoData.connection?.isp || null,
                    flag_img: ipwhoData.flag?.img || null,
                },
                timezone: ipwhoData.timezone?.id || null,
                type: ipType || matchedBot || "Unknown",
                isBot: ipData?.bot,
                isBlocked: blocked,
                blockReason: reason,
            });
        } catch (err) {
            // NOLOGS
        }
    }

    if (blocked) {
        return handleBlock(reason, shortlink.statusCode);
    }

    if (!finalUrl) {
        return NextResponse.json({ error: "No valid destination found" }, { status: 502 });
    }

    const today = new Date().toISOString().split("T")[0]; // e.g., "2025-08-19"

    const usageDoc = await db.collection("daily_usage").findOneAndUpdate(
        {
            apiKey,
            shortlinkKey: shortlink.key,
            date: today,
        },
        {
            $inc: { count: 1 },
            $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true, returnDocument: "after" }
    );

    const totalUsage = await db.collection("daily_usage").aggregate([
        {
            $match: {
                apiKey,
                date: {
                    $gte: subscriptionStartDate.toISOString().split("T")[0],
                    $lte: subscriptionEndDate.toISOString().split("T")[0],
                },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$count" },
            },
        },
    ]).toArray();

    const totalCount = totalUsage[0]?.total || 0;

    if (totalCount > limit) {
        return NextResponse.json({ error: "Subscription request limit reached." }, { status: 429 });
    }

    return NextResponse.redirect(finalUrl);
}