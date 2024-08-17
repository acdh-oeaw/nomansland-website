/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import Download from "@/components/content/download.astro";
import Figure from "@/components/content/figure.astro";
import Img from "@/components/content/img.astro";
import PartnerInstitution from "@/components/content/partner-institution.astro";
import TableOfContents from "@/components/content/table-of-contents.astro";
import NavLink from "@/components/navigation/nav-link.astro";

const components = {
	a: NavLink as any,
	Download,
	Figure,
	img: Img,
	PartnerInstitution,
	TableOfContents,
};

declare global {
	type MDXProvidedComponents = typeof components;
}

export function useMDXComponents(): MDXProvidedComponents {
	return components;
}
