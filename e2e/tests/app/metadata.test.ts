import { createUrl } from "@acdh-oeaw/lib";

import { expect, test } from "~/e2e/lib/test";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const baseUrl = process.env.PUBLIC_APP_BASE_URL!;

test("should set a canonical url", async ({ createIndexPage }) => {
	const { indexPage } = await createIndexPage();
	await indexPage.goto();

	const canonicalUrl = indexPage.page.locator('link[rel="canonical"]');
	await expect(canonicalUrl).toHaveAttribute("href", String(createUrl({ baseUrl, pathname: "/" })));
});

test("should set document title on not-found page", async ({ page }) => {
	await page.goto("/unknown/");
	await expect(page).toHaveTitle("Page not found | Nomad's Manuscripts Landscape");
});

test("should disallow indexing of not-found page", async ({ page }) => {
	await page.goto("/unknown/");

	const ogTitle = page.locator('meta[name="robots"]');
	await expect(ogTitle).toHaveAttribute("content", "noindex");
});

// eslint-disable-next-line playwright/no-skipped-test
test.skip("should set page metadata", async ({ createIndexPage }) => {
	const { indexPage } = await createIndexPage();
	await indexPage.goto();

	const { page } = indexPage;

	const ogType = page.locator('meta[property="og:type"]');
	await expect(ogType).toHaveAttribute("content", "website");

	const twCard = page.locator('meta[name="twitter:card"]');
	await expect(twCard).toHaveAttribute("content", "summary_large_image");

	const twCreator = page.locator('meta[name="twitter:creator"]');
	await expect(twCreator).toHaveAttribute("content", "@NoMansLand_OEAW");

	const twSite = page.locator('meta[name="twitter:site"]');
	await expect(twSite).toHaveAttribute("content", "@NoMansLand_OEAW");

	// const googleSiteVerification = page.locator('meta[name="google-site-verification"]');
	// await expect(googleSiteVerification).toHaveAttribute("content", "");

	await expect(page).toHaveTitle("Home | Nomad's Manuscripts Landscape");

	const metaDescription = page.locator('meta[name="description"]');
	await expect(metaDescription).toHaveAttribute(
		"content",
		"Investigating Literary Evidence for Transculturation in Medieval Iran and Central Asia in the 13th – 15th centuries.",
	);

	const ogTitle = page.locator('meta[property="og:title"]');
	await expect(ogTitle).toHaveAttribute("content", "Home");

	const ogDescription = page.locator('meta[property="og:description"]');
	await expect(ogDescription).toHaveAttribute(
		"content",
		"Investigating Literary Evidence for Transculturation in Medieval Iran and Central Asia in the 13th – 15th centuries.",
	);

	const ogSiteName = page.locator('meta[property="og:site_name"]');
	await expect(ogSiteName).toHaveAttribute("content", "Nomad's Manuscripts Landscape");

	const ogUrl = page.locator('meta[property="og:url"]');
	await expect(ogUrl).toHaveAttribute("content", String(createUrl({ baseUrl, pathname: "/" })));

	const ogLocale = page.locator('meta[property="og:locale"]');
	await expect(ogLocale).toHaveAttribute("content", "en");
});

// eslint-disable-next-line playwright/no-skipped-test
test.skip("should add json+ld metadata", async ({ createIndexPage }) => {
	const { indexPage } = await createIndexPage();
	await indexPage.goto();

	const metadata = await indexPage.page.locator('script[type="application/ld+json"]').textContent();
	// eslint-disable-next-line playwright/prefer-web-first-assertions
	expect(metadata).toBe(
		JSON.stringify({
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: "Nomad&apos;s Manuscripts Landscape",
			description:
				"Investigating Literary Evidence for Transculturation in Medieval Iran and Central Asia in the 13th – 15th centuries.",
		}),
	);
});

test("should serve an open-graph image", async ({ createIndexPage, request }) => {
	const imagePath = "/opengraph-image.png";

	const { indexPage } = await createIndexPage();
	await indexPage.goto();

	await expect(indexPage.page.locator('meta[property="og:image"]')).toHaveAttribute(
		"content",
		expect.stringContaining(String(createUrl({ baseUrl, pathname: imagePath }))),
	);

	const response = await request.get(imagePath);
	const status = response.status();
	const contentType = response.headers()["content-type"];

	expect(status).toBe(200);
	expect(contentType).toBe("image/png");
});

test("should set `lang` attribute on `html` element", async ({ createIndexPage }) => {
	const { indexPage } = await createIndexPage();
	await indexPage.goto();

	await expect(indexPage.page.locator("html")).toHaveAttribute("lang", "en");
});
