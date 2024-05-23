/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { MDXComponents } from "mdx/types";

import Download from "@/components/content/download.astro";
import Figure from "@/components/content/figure.astro";
import Img from "@/components/content/img.astro";
import PartnerInstitution from "@/components/content/partner-institution.astro";
import TableOfContents from "@/components/content/table-of-contents.astro";
import NavLink from "@/components/navigation/nav-link.astro";

export function useMDXComponents(): MDXComponents {
	return {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		a: NavLink as any,
		Download,
		Figure,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		img: Img as any,
		PartnerInstitution,
		TableOfContents,
	};
}
