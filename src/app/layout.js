import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";

export const metadata = {
    title: `NulledBot #HOME`,
    description: `NulledBot is a powerful, developer-friendly antibot security platform designed to detect, block, and filter malicious traffic including bots, proxies, VPNs, and suspicious IPs.`,
    keywords: [
        'antibot', 'security', 'ip filtering', 'bot protection', 'proxy detection',
        'vpn detection', 'web security', 'NulledBot', 'traffic filtering', 'threat mitigation'
    ],
    openGraph: {
        siteName: 'NulledBot',
        title: `NulledBot | Advanced Web Security & Bot Protection`,
        description: `NulledBot helps secure your web applications with intelligent bot detection, IP analysis, and advanced traffic filtering. Protect your platform from abuse and unauthorized access.`,
        url: 'https://nulledbot.vercel.app',
        type: 'website',
        images: [
            {
                url: 'https://nulledbot.vercel.app/rog.png',
                width: 320,
                height: 180,
                alt: 'NulledBot Security (XS)',
            },
            {
                url: 'https://nulledbot.vercel.app/rog.png',
                width: 640,
                height: 360,
                alt: 'NulledBot Security (SM)',
            },
            {
                url: 'https://nulledbot.vercel.app/rog.png',
                width: 800,
                height: 418,
                alt: 'NulledBot Security (MD)',
            },
            {
                url: 'https://nulledbot.vercel.app/rog.png',
                width: 1200,
                height: 630,
                alt: 'NulledBot Security (LG)',
            },
            {
                url: 'https://nulledbot.vercel.app/rog.png',
                width: 1600,
                height: 840,
                alt: 'NulledBot Security (XL)',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: `NulledBot | Advanced Web Security & Bot Protection`,
        description: `Fortify your website with NulledBot — the next-gen solution for detecting bots, filtering proxies/VPNs, and managing traffic security with precision.`,
        images: ['https://nulledbot.vercel.app/rog.png'],
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-scroll-behavior="smooth">
            <body className="antialiased" style={{ fontFamily: "var(--font-nulledbot)" }}>
                <Toaster richColors position="top-right" />
                {children}
                <Script
                    src="https://app.midtrans.com/snap/snap.js"
                    data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                    strategy="afterInteractive"
                />
            </body>
        </html>
    );
}
