import type { Guide } from "@/features/public-content/content/types";
import { getPublishedGuideBySlug, getGuidePath, getGuideMarkdownPath } from "@/features/public-content/seo/routes";

function renderSection(section: Guide["sections"][number]) {
  const lines: string[] = [`## ${section.heading}`];

  for (const paragraph of section.body ?? []) {
    lines.push(paragraph);
  }

  if (section.bullets?.length) {
    lines.push(...section.bullets.map((bullet) => `- ${bullet}`));
  }

  if (section.steps?.length) {
    lines.push(...section.steps.map((step, index) => `${index + 1}. ${step}`));
  }

  if (section.callout) {
    const tone = section.callout.tone ? ` (${section.callout.tone})` : "";
    const title = section.callout.title ? `${section.callout.title}${tone}` : `Note${tone}`;
    lines.push(`> ${title}: ${section.callout.body}`);
  }

  if (section.faqs?.length) {
    for (const faq of section.faqs) {
      lines.push(`### ${faq.question}`);
      lines.push(faq.answer);
    }
  }

  return lines.join("\n\n");
}

export function renderGuideMarkdown(guide: Guide) {
  const frontmatterValue = (value: string) => JSON.stringify(value);
  const frontmatter = [
    "---",
    `title: ${frontmatterValue(guide.title)}`,
    `description: ${frontmatterValue(guide.description)}`,
    `canonical: ${frontmatterValue(getGuidePath(guide.slug))}`,
    `markdown_url: ${frontmatterValue(getGuideMarkdownPath(guide.slug))}`,
    `published_at: ${frontmatterValue(guide.publishedAt)}`,
    guide.updatedAt ? `updated_at: ${frontmatterValue(guide.updatedAt)}` : null,
    `category: ${frontmatterValue(guide.category)}`,
    "---",
  ].filter(Boolean).join("\n");

  const summary = [
    `# ${guide.title}`,
    guide.description,
    `Category: ${guide.category}`,
    guide.readingTimeMinutes ? `Reading time: ${guide.readingTimeMinutes} minutes` : null,
    guide.audience ? `Audience: ${guide.audience}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const sections = guide.sections.map(renderSection).join("\n\n");
  const sources = guide.sources?.length
    ? [
        "## Official references",
        ...guide.sources.map(
          (source) => `- [${source.label}](${source.href}) — ${source.publisher}`,
        ),
      ].join("\n")
    : null;

  return [frontmatter, summary, sections, sources].filter(Boolean).join("\n\n") + "\n";
}

export function getPublishedGuideMarkdown(slug: string) {
  const guide = getPublishedGuideBySlug(slug);

  if (!guide) {
    return null;
  }

  return renderGuideMarkdown(guide);
}
