# Premium Podcast Static Web App

A modern, high-performance static website generator for podcasts. It transforms any RSS feed into a premium, accessible, and multilingual web experience with zero backend requirements.

## ✨ Features

- **RSS-Driven Content**: Automatically generates landing and episode pages from any standard podcast RSS feed.
- **Premium Aesthetic**: Sleek design with glassmorphism, smooth animations, and a focus on content.
- **Dynamic Theme**: Full support for system-dark/light modes with manual override.
- **UI Internationalization (i18n)**:
  - Supports 7 languages: EN, CS, DE, FR, ES, IT, PL.
  - **Feed-Language Locking**: Automatically detects the feed's language and locks the UI to match.
  - **Dynamic Date Localization**: Formats dates based on the active language (e.g., "04. 02. 2026" for Czech).
- **Custom Audio Player**: A consistent, premium audio experience across all browsers, replacing the default HTML5 controls.
- **SEO Optimized**: Automatically generates SEO-friendly slugs, meta tags, and Open Graph previews.
- **Accessibility**: Programmatic brand color contrast adjustments to ensure WCAG compliance.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Configuration (`.env`)
Create a `.env` file in the root directory:

```env
# Required: The RSS feed URL of your podcast
PODCAST_URL=https://your-podcast-feed.com/rss

# Optional: Google Analytics ID
GA_ID=G-XXXXXXXXXX

# Optional: Brand Colors (Hex format)
BRAND_PRIMARY=#FFD800
BRAND_SECONDARY=#FF4D00
```

### 3. Custom Metadata & Content (`/content`)
You can override or enhance episode metadata by creating Markdown files in the `content/` folder. The filename must match the episode's slug (e.g., `episode-title.md`).

**Example: `content/my-awesome-episode.md`**
```markdown
---
title: "Customized Episode Title"
youtube_id: "dQw4w9WgXcQ"
downloads:
  - title: "Cheat Sheet (PDF)"
    url: "/files/cheatsheet.pdf"
---

This content will be rendered as the main body of the episode page.
You can use **Markdown** here!
```

- **`youtube_id`**: Embeds a YouTube video at the top of the episode page.
- **`downloads`**: Adds download buttons for bonus materials.
- **Body Content**: Overwrites the RSS episode description with your rich Markdown content.

### 4. Development & Build

```bash
# Install dependencies
npm install

# Run development server with live reload
npm run dev

# Generate static site
npm run build
```

The static site will be generated in the `dist/` directory.

## 🛠 Project Structure

- `scripts/build.ts`: The static site generator engine.
- `templates/`: Handlebars templates for the layout, home, and episode pages.
- `src/main.ts`: Client-side logic for theme, player, and i18n.
- `src/style.css`: Tailwind CSS configuration and custom styles.
- `content/`: Markdown files for manual metadata overrides.
