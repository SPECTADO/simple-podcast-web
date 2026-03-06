import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    feed: ['itunes:image'],
    item: ['itunes:image'],
  }
});

async function run() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
      <channel>
        <title>Test</title>
        <itunes:image href="http://example.com/feed.jpg" />
        <item>
          <title>Ep 1</title>
          <itunes:image href="http://example.com/ep1.jpg" />
        </item>
      </channel>
    </rss>
  `;
  const feed = await parser.parseString(xml);
  console.log(JSON.stringify(feed, null, 2));
}

run();
