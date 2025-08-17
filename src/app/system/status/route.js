export async function GET() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const isSystemOnline = true;

    const response = isSystemOnline
        ? {
            status: "LIVE",
            body: `All systems are currently operational. Enjoy uninterrupted access to all
NulledBot services. Stay informed with real-time updates and planned
maintenance by visiting our official <a href="/system/status" target="_blank" rel="noreferrer"
style="color:#3b82f6;text-decoration:none;">status dashboard</a>.`,
        }
        : {
            status: "OFFLINE",
            body: `Some services are currently experiencing downtime. Our team is actively working
to restore full functionality. We apologize for the inconvenience. Stay informed with real-time updates and planned
maintenance by visiting our official <a href="/system/status" target="_blank" rel="noreferrer"
style="color:#3b82f6;text-decoration:none;">status dashboard</a>.`,
        };

    return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}
