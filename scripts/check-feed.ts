import 'dotenv/config';
import Parser from 'rss-parser';

const PODCAST_URL = process.env.PODCAST_URL;
const parser = new Parser();

async function check() {
  const feed = await parser.parseURL(PODCAST_URL as string);
  const episodes = feed.items;
  console.log('Total episodes:', episodes.length);
  const lastEp = episodes[episodes.length - 1];
  console.log('Oldest Episode Title:', lastEp.title);
  console.log('Oldest Episode iTunes Data:', JSON.stringify(lastEp.itunes, null, 2));
}

check();
