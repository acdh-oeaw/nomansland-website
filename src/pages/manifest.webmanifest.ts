import { withBasePath } from "@/lib/with-base-path";

import metadata from "~/content/metadata.json";

export function GET() {
	const manifest = {
		name: metadata.title,
		short_name: metadata.shortTitle,
		description: metadata.description,
		icons: [
			{ src: withBasePath("/android-chrome-192x192.png"), sizes: "192x192", type: "image/png" },
			{ src: withBasePath("/android-chrome-512x512.png"), sizes: "512x512", type: "image/png" },
			{
				src: withBasePath("/maskable-icon.png"),
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
		theme_color: "#ffffff",
		background_color: "#ffffff",
		display: "standalone",
		start_url: withBasePath("/"),
	};

	return Response.json(manifest);
}
