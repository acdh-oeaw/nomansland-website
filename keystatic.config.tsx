import { pick } from "@acdh-oeaw/lib";
import { collection, config, fields, singleton } from "@keystatic/core";
import { block, mark, wrapper } from "@keystatic/core/content-components";
import { DownloadIcon, ImageIcon, LinkIcon, ListIcon } from "lucide-react";

import { Logo } from "@/components/logo";
import { createAssetPaths, createPreviewUrl } from "@/config/content.config";
import { env } from "@/config/env.config";

function createComponents(
	assetPath: `/${string}/`,
	components?: Array<"Download" | "Figure" | "PartnerInstitution" | "TableOfContents">,
) {
	const allComponents = {
		Download: mark({
			label: "Download",
			// description: "A link to an uploaded file.",
			tag: "a",
			className: "underline decoration-dotted",
			icon: <DownloadIcon />,
			schema: {
				href: fields.file({
					label: "File",
					...createAssetPaths(assetPath),
					validation: { isRequired: true },
				}),
			},
		}),
		Figure: wrapper({
			label: "Figure",
			description: "An image with caption.",
			icon: <ImageIcon />,
			schema: {
				href: fields.image({
					label: "Image",
					...createAssetPaths(assetPath),
					validation: { isRequired: true },
				}),
				alt: fields.text({
					label: "Image description for screen readers",
					// validation: { isRequired: false },
				}),
			},
		}),
		PartnerInstitution: block({
			label: "Partner institution",
			description: "An link with a logo.",
			icon: <LinkIcon />,
			schema: {
				label: fields.text({
					label: "Name",
					validation: { isRequired: true },
				}),
				href: fields.url({
					label: "URL",
					validation: { isRequired: true },
				}),
				logo: fields.image({
					label: "Logo",
					...createAssetPaths(assetPath),
					validation: { isRequired: true },
				}),
			},
			ContentView(props) {
				return props.value.label;
			},
		}),
		TableOfContents: block({
			label: "Table of contents",
			description: "Insert a table of contents",
			icon: <ListIcon />,
			schema: {
				title: fields.text({
					label: "Title",
					// validation: { isRequired: false },
				}),
			},
		}),
	};

	if (components == null) return allComponents;

	return pick(allComponents, components);
}

export default config({
	ui: {
		brand: {
			name: "NoMansLand",
			// @ts-expect-error `ReactNode` is a valid return type.
			mark: Logo,
		},
		navigation: {
			Pages: ["indexPage", "pages"],
			Navigation: ["navigation"],
			Settings: ["metadata"],
		},
	},
	storage:
		/**
		 * @see https://keystatic.com/docs/github-mode
		 */
		env.PUBLIC_KEYSTATIC_MODE === "github" &&
		env.PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER &&
		env.PUBLIC_KEYSTATIC_GITHUB_REPO_NAME
			? {
					kind: "github",
					repo: {
						owner: env.PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER,
						name: env.PUBLIC_KEYSTATIC_GITHUB_REPO_NAME,
					},
					branchPrefix: "content/",
				}
			: {
					kind: "local",
				},
	collections: {
		pages: collection({
			label: "Pages",
			path: "./content/pages/**",
			slugField: "title",
			format: { contentField: "content" },
			previewUrl: createPreviewUrl("/{slug}"),
			entryLayout: "content",
			columns: ["title"],
			schema: {
				title: fields.slug({
					name: {
						label: "Title",
						validation: { isRequired: true },
					},
				}),
				image: fields.image({
					label: "Image",
					...createAssetPaths("/content/pages/"),
					// validation: { isRequired: false },
				}),
				summary: fields.text({
					label: "Summary",
					multiline: true,
					// validation: { isRequired: true },
				}),
				content: fields.mdx({
					label: "Content",
					options: {
						image: createAssetPaths("/content/pages/"),
					},
					components: createComponents("/content/pages/"),
				}),
			},
		}),
	},
	singletons: {
		indexPage: singleton({
			label: "Home page",
			path: "./content/index-page/",
			format: { data: "json" },
			entryLayout: "form",
			schema: {
				hero: fields.object(
					{
						title: fields.text({
							label: "Title",
							validation: { isRequired: true },
						}),
						image: fields.image({
							label: "Image",
							...createAssetPaths("/content/index-page/"),
							validation: { isRequired: true },
						}),
						leadIn: fields.text({
							label: "Lead in",
							multiline: true,
							validation: { isRequired: true },
						}),
						links: fields.array(
							fields.object(
								{
									label: fields.text({
										label: "Label",
										validation: { isRequired: true },
									}),
									href: fields.url({
										label: "URL",
										validation: { isRequired: true },
									}),
								},
								{
									label: "Link",
								},
							),
							{
								label: "Links",
								itemLabel(props) {
									return props.fields.label.value;
								},
								validation: { length: { min: 1 } },
							},
						),
					},
					{
						label: "Hero section",
					},
				),
				main: fields.object(
					{
						sections: fields.blocks(
							{
								cardsSection: {
									label: "Cards section",
									itemLabel(props) {
										return props.fields.title.value + " (Cards)";
									},
									schema: fields.object(
										{
											title: fields.text({
												label: "Title",
												validation: { isRequired: true },
											}),
											variant: fields.select({
												label: "Variant",
												options: [
													{
														label: "Fluid",
														value: "fluid",
													},
													{
														label: "Two columns",
														value: "two-columns",
													},
													{
														label: "Three columns",
														value: "three-columns",
													},
													{
														label: "Four columns",
														value: "four-columns",
													},
												],
												defaultValue: "fluid",
											}),
											cards: fields.blocks(
												{
													custom: {
														label: "Custom card",
														itemLabel(props) {
															return props.fields.title.value;
														},
														schema: fields.object(
															{
																title: fields.text({
																	label: "Title",
																	validation: { isRequired: true },
																}),
																image: fields.image({
																	label: "Image",
																	...createAssetPaths("/content/index-page/"),
																	// validation: { isRequired: false },
																}),
																summary: fields.text({
																	label: "Summary",
																	multiline: true,
																	validation: { isRequired: true },
																}),
																link: fields.object(
																	{
																		label: fields.text({
																			label: "Label",
																			validation: { isRequired: true },
																		}),
																		href: fields.url({
																			label: "URL",
																			validation: { isRequired: true },
																		}),
																	},
																	{
																		label: "Link",
																	},
																),
															},
															{
																label: "Custom card",
															},
														),
													},
													page: {
														label: "Page card",
														itemLabel(props) {
															return props.fields.title.value;
														},
														schema: fields.object(
															{
																title: fields.text({
																	label: "Title",
																	validation: { isRequired: true },
																}),
																reference: fields.relationship({
																	label: "Page",
																	collection: "pages",
																	validation: { isRequired: true },
																}),
															},
															{
																label: "Page card",
															},
														),
													},
												},
												{
													label: "Cards",
													validation: { length: { min: 1 } },
												},
											),
										},
										{
											label: "Cards section",
										},
									),
								},
							},
							{
								label: "Sections",
								validation: { length: { min: 1 } },
							},
						),
					},
					{ label: "Main content" },
				),
			},
		}),
		metadata: singleton({
			label: "Metadata",
			path: "./content/metadata",
			format: { data: "json" },
			entryLayout: "form",
			schema: {
				title: fields.text({
					label: "Site title",
					validation: { isRequired: true },
				}),
				shortTitle: fields.text({
					label: "Short site title",
					validation: { isRequired: true },
				}),
				description: fields.text({
					label: "Site description",
					validation: { isRequired: true },
				}),
				twitter: fields.text({
					label: "Twitter handle",
					// validation: { isRequired: false },
				}),
			},
		}),
		navigation: singleton({
			label: "Navigation",
			path: "./content/navigation",
			format: { data: "json" },
			entryLayout: "form",
			schema: {
				links: fields.blocks(
					{
						link: {
							label: "Link",
							itemLabel(props) {
								return props.fields.label.value;
							},
							schema: fields.object({
								label: fields.text({
									label: "Label",
									validation: { isRequired: true },
								}),
								href: fields.url({
									label: "URL",
									validation: { isRequired: true },
								}),
							}),
						},
						page: {
							label: "Page",
							itemLabel(props) {
								return props.fields.label.value;
							},
							schema: fields.object({
								label: fields.text({
									label: "Label",
									validation: { isRequired: true },
								}),
								reference: fields.relationship({
									label: "Page",
									collection: "pages",
									validation: { isRequired: true },
								}),
							}),
						},
						menu: {
							label: "Menu",
							itemLabel(props) {
								return props.fields.label.value + " (Menu)";
							},
							schema: fields.object({
								label: fields.text({
									label: "Label",
									validation: { isRequired: true },
								}),
								links: fields.blocks(
									{
										link: {
											label: "Link",
											itemLabel(props) {
												return props.fields.label.value;
											},
											schema: fields.object(
												{
													label: fields.text({
														label: "Label",
														validation: { isRequired: true },
													}),
													href: fields.url({
														label: "URL",
														validation: { isRequired: true },
													}),
												},
												{
													label: "Link",
												},
											),
										},
										page: {
											label: "Page",
											itemLabel(props) {
												return props.fields.label.value;
											},
											schema: fields.object(
												{
													label: fields.text({
														label: "Label",
														validation: { isRequired: true },
													}),
													reference: fields.relationship({
														label: "Page",
														collection: "pages",
														validation: { isRequired: true },
													}),
												},
												{
													label: "Page",
												},
											),
										},
									},
									{
										label: "Links",
									},
								),
							}),
						},
					},
					{
						label: "Links",
						validation: { length: { min: 1 } },
					},
				),
			},
		}),
	},
});
