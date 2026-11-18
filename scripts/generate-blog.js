#!/usr/bin/env node
/**
 * Generates blog/index.html, blog/*.html posts, sitemap.xml from blog/posts.json
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "blog");
const POSTS_PATH = path.join(BLOG_DIR, "posts.json");
const SITE_URL = (process.env.SITE_URL || "https://sprinttrack.app").replace(/\/$/, "");
const APP_STORE =
  "https://apps.apple.com/us/app/sprinttrack-ai-sprint-coach/id6762912944";

const posts = JSON.parse(fs.readFileSync(POSTS_PATH, "utf8"));

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function siteHead({ title, description, canonical, depth, jsonLdExtra }) {
  const css = depth === 0 ? "../styles.css?v=4" : "../styles.css?v=4";
  const canon = canonical || SITE_URL;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "SprintTrack",
      url: SITE_URL,
      logo: `${SITE_URL}/assets/logo.png`,
    },
    ...(jsonLdExtra || []),
  ];
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(canon)}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="SprintTrack" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(canon)}" />
    <meta property="og:image" content="${SITE_URL}/assets/logo.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;1,600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="${css}" />
    <link rel="icon" href="${depth === 0 ? "../" : "../"}assets/logo.png" type="image/png" />
    <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": ld })}</script>
  </head>`;
}

function blogNav(depth) {
  const home = depth === 0 ? "../index.html" : "../index.html";
  const blog = depth === 0 ? "index.html" : "index.html";
  return `    <header class="site-header">
      <nav class="nav-inner" aria-label="Primary">
        <a class="brand" href="${home}">
          <img src="${depth === 0 ? "../" : "../"}assets/logo.png" width="36" height="36" alt="" />
          SprintTrack
        </a>
        <div class="nav-links">
          <a href="${home}#features">Features</a>
          <a href="${blog}">Blog</a>
          <a href="${home}#support">Support</a>
        </div>
        <a class="nav-cta" href="${APP_STORE}">Get the app</a>
      </nav>
    </header>`;
}

function footerScripts() {
  return `    <footer class="site-footer">
      <div class="footer-inner">
        <div>© <span id="year"></span> SprintTrack. All rights reserved.</div>
        <div class="footer-links">
          <a href="../index.html#support">Support</a>
          <a href="../privacy-policy.html">Privacy</a>
          <a href="../terms-of-service.html">Terms</a>
          <a href="index.html">Blog</a>
        </div>
      </div>
    </footer>
    <script>
      (function () {
        var y = document.getElementById("year");
        if (y) y.textContent = String(new Date().getFullYear());
      })();
    </script>
  </body>
</html>`;
}

function generatePost(post) {
  const url = `${SITE_URL}/blog/${post.slug}.html`;
  const paragraphs = post.body.map((p) => `        <p>${esc(p)}</p>`).join("\n");
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      author: { "@type": "Organization", name: "SprintTrack" },
      publisher: {
        "@type": "Organization",
        name: "SprintTrack",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/logo.png` },
      },
      mainEntityOfPage: url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog/` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: post.title,
          acceptedAnswer: { "@type": "Answer", text: post.body.join(" ") },
        },
      ],
    },
  ];

  const html = `${siteHead({
    title: `${post.title} | SprintTrack Blog`,
    description: post.description,
    canonical: url,
    depth: 0,
    jsonLdExtra: jsonLd,
  })}
  <body class="page-shell">
${blogNav(0)}
    <main class="legal-main blog-article-wrap">
      <article class="legal-inner legal-doc blog-article">
        <p class="blog-meta"><a href="index.html">Blog</a> · ${esc(post.category)} · ${esc(post.date)}</p>
        <h1>${esc(post.title)}</h1>
        <p class="legal-effective">${esc(post.description)}</p>
${paragraphs}
        <div class="blog-cta">
          <p><strong>SprintTrack</strong> — periodized sprint training on iOS. Science-backed plans, Film Room, and PR tracking.</p>
          <a class="btn-primary" href="${APP_STORE}">Download on the App Store</a>
        </div>
      </article>
    </main>
${footerScripts()}`;

  fs.writeFileSync(path.join(BLOG_DIR, `${post.slug}.html`), html, "utf8");
}

function generateIndex() {
  const cards = posts
    .map(
      (p) => `          <article class="blog-card chrome-border">
            <p class="blog-card-cat">${esc(p.category)}</p>
            <h2><a href="${esc(p.slug)}.html">${esc(p.title)}</a></h2>
            <p>${esc(p.description)}</p>
            <a class="blog-card-link" href="${esc(p.slug)}.html">Read answer →</a>
          </article>`
    )
    .join("\n");

  const itemList = posts.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: p.title,
    url: `${SITE_URL}/blog/${p.slug}.html`,
  }));

  const html = `${siteHead({
    title: "SprintTrack Blog — Sprint training Q&A",
    description:
      "Answers to questions sprinters ask: 100m speed, block starts, periodization, nutrition, taper, and more. By SprintTrack.",
    canonical: `${SITE_URL}/blog/`,
    depth: 0,
    jsonLdExtra: [
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "SprintTrack Blog",
        description: "Sprint training questions answered for track athletes.",
        url: `${SITE_URL}/blog/`,
        blogPost: posts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: `${SITE_URL}/blog/${p.slug}.html`,
          datePublished: p.date,
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: itemList,
      },
    ],
  })}
  <body class="page-shell">
${blogNav(0)}
    <main class="section blog-hub">
      <div class="section-inner">
        <p class="section-label">SprintTrack Blog</p>
        <h1 class="section-title">Questions sprinters actually ask</h1>
        <p class="section-lede">
          Training, technique, nutrition, and meet prep — straight answers for 100m–400m athletes. Updated guides for
          search and AI discovery.
        </p>
        <div class="blog-grid">
${cards}
        </div>
      </div>
    </main>
${footerScripts()}`;

  fs.writeFileSync(path.join(BLOG_DIR, "index.html"), html, "utf8");
}

function generateSitemap() {
  const urls = [
    { loc: `${SITE_URL}/`, priority: "1.0" },
    { loc: `${SITE_URL}/privacy-policy.html`, priority: "0.3" },
    { loc: `${SITE_URL}/terms-of-service.html`, priority: "0.3" },
    { loc: `${SITE_URL}/blog/`, priority: "0.9" },
    ...posts.map((p) => ({
      loc: `${SITE_URL}/blog/${p.slug}.html`,
      priority: "0.8",
      lastmod: p.date,
    })),
  ];

  const body = urls
    .map(
      (u) => `  <url>
    <loc>${esc(u.loc)}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.loc.includes("/blog/") ? "monthly" : "weekly"}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n");

  fs.writeFileSync(
    path.join(ROOT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`,
    "utf8"
  );
}

function generateLlmsTxt() {
  const lines = [
    "# SprintTrack",
    "",
    "> SprintTrack (AI Sprint Coach) is an iOS app for sprinters: periodized training, nutrition, PR tracking, and weekly Film Room video form analysis.",
    "",
    `Site: ${SITE_URL}`,
    `App Store: ${APP_STORE}`,
    "",
    "## Key pages",
    `- Home: ${SITE_URL}/`,
    `- Blog index: ${SITE_URL}/blog/`,
    `- Privacy: ${SITE_URL}/privacy-policy.html`,
    `- Terms: ${SITE_URL}/terms-of-service.html`,
    "",
    "## Blog articles",
    ...posts.map((p) => `- ${p.title}: ${SITE_URL}/blog/${p.slug}.html`),
    "",
    "## Topics we cover",
    "100m training, 200m, 400m, block starts, max velocity, periodization GPP SPP taper, sprint nutrition, hamstring prevention, RPE, meet taper, AI sprint coaching.",
  ];
  fs.writeFileSync(path.join(ROOT, "llms.txt"), lines.join("\n"), "utf8");
}

posts.forEach(generatePost);
generateIndex();
generateSitemap();
generateLlmsTxt();

console.log(`[generate-blog] ${posts.length} posts, index, sitemap.xml, llms.txt`);