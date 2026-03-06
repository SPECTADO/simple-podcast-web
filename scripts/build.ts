import fs from 'node:fs';
import path from 'node:path';
import Parser from 'rss-parser';
import matter from 'gray-matter';
import { marked } from 'marked';
import Handlebars from 'handlebars';
import { config } from '../_config.ts';

const PODCAST_URL = config.podcastUrl;
const GA_ID = config.gaId;
const BRAND_PRIMARY = config.brandPrimary || '#96cae4';
const BRAND_SECONDARY = config.brandSecondary || '#3186c3';

if (!PODCAST_URL) {
  console.error('Missing podcastUrl in _config.ts');
  process.exit(1);
}

const parser = new Parser();

async function build() {
  // Cleanup
  const episodeDir = path.resolve('episode');
  if (fs.existsSync(episodeDir)) {
    console.log('Cleaning up episode directory...');
    fs.rmSync(episodeDir, { recursive: true, force: true });
  }

  console.log(`Fetching podcast from ${PODCAST_URL}...`);
  const feed = await parser.parseURL(PODCAST_URL as string);
  const episodes = feed.items.map(item => {
    const title = item.title || 'untitled';
    const id = slugify(title);
    return { ...item, title, id };
  });

  console.log(`Found ${episodes.length} episodes.`);
  console.log(`Sample IDs:`, episodes.slice(0, 3).map(e => e.id));

  // Load templates
  const templateDir = path.resolve('templates');
  const layoutSource = fs.readFileSync(path.join(templateDir, 'layout.hbs'), 'utf-8');
  const homeSource = fs.readFileSync(path.join(templateDir, 'home.hbs'), 'utf-8');
  const episodeSource = fs.readFileSync(path.join(templateDir, 'episode.hbs'), 'utf-8');

  // Register partial layout
  Handlebars.registerPartial('layout', layoutSource);

  // Compile templates
  const homeTemplate = Handlebars.compile(templateWrapper(homeSource));
  const episodeTemplate = Handlebars.compile(templateWrapper(episodeSource));

  const contentDir = path.resolve('content');
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  // Process each episode
  const enrichedEpisodes = episodes.map(ep => {
    const mdPath = path.join(contentDir, `${ep.id}.md`);
    let customHtml = '';
    let customMeta = {};

    if (fs.existsSync(mdPath)) {
      const fileContent = fs.readFileSync(mdPath, 'utf-8');
      const { data, content } = matter(fileContent);
      customMeta = data;
      customHtml = marked.parse(content) as string;
    }

    return {
      ...ep,
      image: (ep as any).itunes?.image || (ep as any).image?.url,
      customHtml,
      ...customMeta // allows overriding title, adding youtube_id, downloads, etc.
    };
  });

  // Load and parse footer
  let footerHtml = '&copy; Simple Podcast Web. All rights reserved.';
  const footerPath = path.join(contentDir, '_footer.md');
  if (fs.existsSync(footerPath)) {
    const footerContent = fs.readFileSync(footerPath, 'utf-8');
    footerHtml = marked.parse(footerContent) as string;
  }

  const siteData = {
    title: feed.title,
    description: feed.description,
    image: (feed as any).itunes?.image || feed.image?.url,
    link: feed.link,
    ga_id: GA_ID,
    brand_primary: BRAND_PRIMARY,
    brand_secondary: BRAND_SECONDARY,
    brand_primary_text: BRAND_PRIMARY === '#96cae4' ? '#075985' : darkenColor(BRAND_PRIMARY, 0.6),
    brand_secondary_text: BRAND_SECONDARY === '#3186c3' ? '#1e40af' : darkenColor(BRAND_SECONDARY, 0.6),
    language: feed.language,
    subscribe_links: config.subscribeLinks,
    social_links: config.socialLinks,
    footer_html: footerHtml,
  };

  // Generate Home
  const homeHtml = homeTemplate({
    site: siteData,
    episodes: enrichedEpisodes,
    meta_title: feed.title,
    meta_description: feed.description,
    meta_image: (feed as any).itunes?.image || feed.image?.url,
  });
  fs.writeFileSync(path.resolve('index.html'), homeHtml);

  const generatedPages: Record<string, string> = {
    main: path.resolve('index.html')
  };

  // Generate Episode Pages
  for (const ep of enrichedEpisodes) {
    const epDir = path.resolve('episode', ep.id);
    if (!fs.existsSync(epDir)) {
      fs.mkdirSync(epDir, { recursive: true });
    }

    const epHtml = episodeTemplate({
      site: siteData,
      episode: ep,
      meta_title: `${ep.title} | ${feed.title}`,
      meta_description: stripHtml(ep.contentSnippet || ep.content || ''),
      meta_image: (ep as any).itunes?.image || (feed as any).itunes?.image || feed.image?.url,
    });
    
    const epFile = path.resolve(epDir, 'index.html');
    fs.writeFileSync(epFile, epHtml);
    generatedPages[`ep_${ep.id}`] = epFile;
  }

  // Write vite config map
  fs.writeFileSync(path.resolve('vite-entries.json'), JSON.stringify(generatedPages, null, 2));
  console.log('Static pages generated successfully.');
}

// Helpers
function templateWrapper(content: string) {
  return `{{#> layout }}${content}{{/layout}}`;
}

function slugify(text: string) {
  return text.toString().toLowerCase()
    .normalize('NFD')               // Unaccent
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, '').substring(0, 160);
}

function darkenColor(hex: string, amount: number) {
  // Simple darkening logic for hex
  let col = hex.replace('#', '');
  if (col.length === 3) col = col.split('').map(c => c + c).join('');
  
  const num = parseInt(col, 16);
  let r = (num >> 16);
  let g = ((num >> 8) & 0x00FF);
  let b = (num & 0x0000FF);

  r = Math.floor(r * (1 - amount));
  g = Math.floor(g * (1 - amount));
  b = Math.floor(b * (1 - amount));

  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

build()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
