export async function checkUrlStatus(url) {
    if (!url) return null;

    try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SAFE_API;
        const body = {
            client: { clientId: "NulledBot", clientVersion: "1.0" },
            threatInfo: {
                threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ url }],
            },
        };

        const res = await fetch(
            `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            }
        );

        const data = await res.json();
        if (data?.matches) return "RED FLAG";

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        try {
            await fetch(url, { method: "HEAD", signal: controller.signal });
            clearTimeout(timeout);
            return "LIVE";
        } catch {
            return "DEAD";
        }
    } catch {
        return "DEAD";
    }
}
