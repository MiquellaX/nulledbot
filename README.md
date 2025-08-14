# NulledBot – README

> Powerful link-protection API that blocks VPNs, proxies, datacenters, and scrapers before they click.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Pricing](#pricing)
- [How It Works](#how-it-works)
- [Quickstart](#quickstart)
- [API Reference](#api-reference)
  - [/api/check](#apicheck)
- [Response Examples](#response-examples)
- [Rate Limits](#rate-limits)
- [Webhooks](#webhooks)
- [FAQ](#faq)
- [Support](#support)
- [Changelog](#changelog)
- [License](#license)

---

## Overview

NulledBot is a bot-protection API for shortlinks and gated flows. It detects and blocks VPNs, proxies, data-center IPs, TOR, headless browsers, and common scraping tools in real time. Integrate it at the "pre-click" or "pre-redirect" step to keep paid traffic and funnels clean.

---

## Key Features

- **IP Intelligence** – Detects VPNs, proxies, datacenters, and TOR using real‑time data sources.
- **User‑Agent Filtering** – Blocks known scrapers, headless browsers, and automation frameworks.
- **Geo & Device Rules** – Allow/block by country, device type, or ISP.
- **Rate Limit Management** – Configure limits per key/route from the dashboard.
- **Webhooks** – Receive real‑time events for allows/blocks.
- **Custom Rules (Enterprise)** – Tailor filters, lists, and logic to your stack.

---

## Pricing

- **Free** – \$0
  - Basic bot filtering
  - Community support
  - Limited stats
- **Pro** – \$29
  - Advanced bot protection
  - Geo/IP filtering
  - Analytics dashboard
- **Enterprise** – \$99
  - Custom rules
  - Priority support
  - Unlimited shortlinks

> Billing is available Weekly, Monthly, and Yearly.

---

## How It Works

NulledBot combines **known VPN/proxy IP ranges**, **ASN databases**, **user‑agent heuristics**, and **behavioral analysis**. Pro/Enterprise plans add **geo‑IP**, **device‑type**, and **ISP** filtering.

Infrastructure runs on global edge networks for low‑latency detection and high uptime. SLAs available for Enterprise.

---

## Quickstart

1. **Create an account** and obtain an **API key**.
2. **Call the check endpoint** before redirecting users to your destination link.
3. **Allow or block** based on the response (e.g., `allow: true/false`).

### Minimal cURL

```bash
curl -i \
  -H "x-api-key: <YOUR_API_KEY>" \
  -H "X-Forwarded-For: <END_USER_IP>" \
  "https://<YOUR-BASE-URL>/api/check"
```

### Node.js (fetch)

```js
const res = await fetch("https://<YOUR-BASE-URL>/api/check", {
	headers: {
		"x-api-key": process.env.NULLEDBOT_API_KEY,
		// If you sit behind a proxy/load balancer, forward the real client IP
		"X-Forwarded-For": clientIp,
	},
});
const verdict = await res.json();
if (verdict.allow) {
	// proceed with redirect
} else {
	// show block page or alternate flow
}
```

### PHP

```php
$ch = curl_init("https://<YOUR-BASE-URL>/api/check");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  "x-api-key: {$_ENV['NULLEDBOT_API_KEY']}",
  "X-Forwarded-For: $clientIp"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$body = json_decode($response, true);
if ($body['allow']) {
  // redirect
} else {
  // block
}
```

> **Note**: If your integration runs at the edge or the origin with direct client access, you can omit `X-Forwarded-For`. The service will use the request IP.

---

## API Reference

### `/api/check`

**Method:** `GET` or `POST`\
**Auth:** Header `x-api-key: <key>`\
**Client IP:** Automatically detected; optionally pass `X-Forwarded-For` when behind proxies/CDNs.

**Query/body parameters (optional):**

- `ua` – Override the detected User‑Agent for testing.
- `country` – Override country (testing only).
- `device` – Override device type (testing only).

**Headers:**

- `x-api-key` _(required)_ – Your API key.
- `X-Forwarded-For` _(recommended)_ – End‑user IP if you’re behind a proxy.
- `User-Agent` _(recommended)_ – Aids heuristic detection.

**Response:** JSON object with allow/deny verdict and context (see examples below).

---

## Response Examples

> **Schema is illustrative and may evolve.** Always code defensively for extra fields.

### Allowed

```json
{
	"allow": true,
	"score": 94,
	"reason": "residential ip; ua ok; no anomalies",
	"ip": "203.0.113.42",
	"geo": { "country": "ID", "isp": "Indosat" },
	"flags": [],
	"timestamp": "2025-08-14T12:00:00Z",
	"requestId": "evt_01HZY..."
}
```

### Blocked (VPN/Proxy)

```json
{
	"allow": false,
	"score": 12,
	"reason": "vpn/datacenter detected",
	"ip": "198.51.100.7",
	"geo": { "country": "US", "asn": 13335, "isp": "Cloud Provider" },
	"flags": ["vpn", "asn_dc"],
	"timestamp": "2025-08-14T12:02:00Z",
	"requestId": "evt_01HZ..."
}
```

### Blocked (Policy)

```json
{
	"allow": false,
	"score": 60,
	"reason": "blocked country (policy)",
	"ip": "203.0.113.55",
	"geo": { "country": "RU" },
	"flags": ["geo_block"],
	"timestamp": "2025-08-14T12:03:00Z",
	"requestId": "evt_01HZ..."
}
```

---

## Rate Limits

- Limits are configurable per key on paid plans.
- Burst protection and dashboard management are provided.
- On limit exceed, expect `429 Too Many Requests` with a JSON error payload.

**Error payload example**

```json
{
	"error": "rate_limited",
	"retryAfter": 30
}
```

---

## Webhooks

- Subscribe from the dashboard to receive **allow/deny** events.
- Typical payload includes request ID, IP, UA, geo, verdict, and matched rules.
- Use webhooks to sync logs/analytics or trigger automated actions.

---

## FAQ

**What is NulledBot?**\
A bot‑protection API for shortlinks that detects proxies, VPNs, bots, and abuse in real time.

**Do I need an API key?**\
Yes. All access is authenticated with API keys linked to your account.

**How accurate is detection?**\
Multiple IP intelligence sources and user‑agent heuristics are combined to deliver high‑accuracy filtering.

---

## Support

- **Free plan:** Community support
- **Pro/Enterprise:** Priority support options available

---

## Changelog

- **2025‑08‑14** – Initial public README.

---

## License

Proprietary. All rights reserved by NulledBot Inc. Consult your agreement for usage terms.
