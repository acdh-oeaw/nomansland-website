import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import keystatic from "@keystatic/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import { loadEnv } from "vite";

// import { defaultLocale } from "./src/config/i18n.config";
// import { createConfig as createMdxConfig } from "./src/config/mdx.config";

const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");

const isDevelopment = process.env.NODE_ENV === "development";

export default defineConfig({
	output: "static",
	vite: { plugins: [tailwindcss()] },
	// Preserve spacing between inline elements across the Astro 7 upgrade.
	compressHTML: true,
	// Local Keystatic editing uses root-relative routes.
	base: isDevelopment ? undefined : env.PUBLIC_APP_BASE_PATH,
	integrations: [
		icon({
			/** @see https://www.astroicon.dev/reference/configuration/#include */
			include: {
				lucide: ["chevron-down", "menu", "message-circle", "search", "x"],
			},
			svgoOptions: {
				multipass: true,
				plugins: [
					{
						name: "preset-default",
						params: {
							overrides: {
								removeViewBox: false,
							},
						},
					},
				],
			},
		}),
		...(isDevelopment ? [react(), keystatic()] : []),
		mdx(),
		sitemap(),
	],
	// // @ts-expect-error Astro types are incomplete.
	// markdown: {
	// 	...(await createMdxConfig(defaultLocale)),
	// 	gfm: false,
	// 	smartypants: false,
	// 	syntaxHighlight: false,
	// },
	prefetch: {
		defaultStrategy: "hover",
		prefetchAll: true,
	},
	redirects: isDevelopment
		? {
				"/admin": {
					destination: "/keystatic",
					status: 307,
				},
			}
		: {},
	scopedStyleStrategy: "where",
	security: {
		checkOrigin: true,
	},
	server: {
		port: 3000,
	},
	site: env.PUBLIC_APP_BASE_URL,
});
