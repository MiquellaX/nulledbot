"use client";

import React from "react";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@/components/ui/accordion";

const steps = [
	{
		title: "Step 1",
		subtitle: "Download NulledBot Package",
		description: `
      Log in to your dashboard and download the NulledBot package. 
      You can find it in the Shortlink & Blocker tab.
    `,
	},
	{
		title: "Step 2",
		subtitle: "Upload to cPanel",
		description: `
      Open your cPanel > File Manager. 
      Upload the nulledbot.zip to the root directory of your domain or subdomain.
      For example: /public_html/.
    `,
	},
	{
		title: "Step 3",
		subtitle: "Extract Files",
		description: `
      Right-click the uploaded nulledbot.zip file inside cPanel File Manager and choose “Extract”.
      This will extract NulledBot files.
    `,
	},
	{
		title: "Step 4",
		subtitle: "Get Your API Key",
		description: `
      Go to the Account tab in your dashboard. Copy your unique API key.
      This key is essential to connect your domain with the NulledBot API.
    `,
	},
	{
		title: "Step 5",
		subtitle: "Configure API Key",
		description: `
      After you extract nulledbot.zip, open config.php.
      Paste your API key into the configuration field:
      
      $nulledbot_api_key = 'PASTE_YOUR_API_KEY_HERE';
      
      Save the file when finished.
    `,
	},
	{
		title: "Step 6",
		subtitle: "Verify Installation",
		description: `
      Visit your domain (yourdomain.com/nulledbot/[yourshortlinkkey]) and confirm that visitors are being routed through the NulledBot API.
      Check your Visitor Logs to confirm that traffic is being filtered. 
      You can find Visitor Logs in the Shortlink & Blocker tab, under the Actions menu of your created shortlink.
    `,
	},
];

export default function TutorialTab() {
	return (
		<div
			className="flex flex-col w-full max-w-3xl mx-auto gap-6 p-8 
                bg-gradient-to-br from-black/80 to-red-700/50
                rounded-2xl shadow-2xl border
                backdrop-blur-md"
		>
			<h2 className="text-3xl font-bold text-white tracking-wide text-center">
				Nulled<span className="text-red-700">Bot</span> Setup Tutorial
			</h2>

			<Accordion
				type="single"
				collapsible
				className="w-full bg-white/10 rounded-lg p-6 ring-1"
			>
				{steps.map((step, index) => (
					<AccordionItem key={index} value={`step-${index}`}>
						<AccordionTrigger className="text-white font-semibold tracking-wide cursor-pointer">
							{step.title}
						</AccordionTrigger>
						<AccordionContent className="text-gray-300 text-sm leading-relaxed">
							<h1 className="text-white font-semibold mb-1">
								<li>{step.subtitle}</li>
							</h1>
							<div className="text-white/80">{step.description}</div>
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);
}
