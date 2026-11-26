import { expect, test } from "~/e2e/lib/test";

test("serves the custom static 404 page", async ({ request }) => {
	const response = await request.get("/not-a-real-page");
	expect(response.status()).toBe(404);
	expect(await response.text()).toContain("Page not found");
});

for (const path of ["/admin", "/keystatic", "/api/keystatic/tree"]) {
	test(`excludes ${path} from production`, async ({ request }) => {
		const response = await request.get(path);
		expect(response.status()).toBe(404);
	});
}
