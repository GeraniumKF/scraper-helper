# scraper-helper

There are other parts of the scraper that exist but I need to clean up before
publishing:

- [ ] Twitter screenshot helper (via Nitter)
- [ ] Express wrapper to expose other scrapers via HTTP.

## TikTok scraper

Scrapes the 30 most recent videos from a TikTok user (can't seem to get
TikTok's scroll-to-load to work with puppeteer).

### Quick Start

- Install node >= 18.
- Clone the repo or [grab and extract the zip][zip].
- `npm install`
- `npm run build`
- `node build/tiktok_standalone.js TIKTOK_USERNAME [--plain]`

[zip]: https://github.com/GeraniumKF/scraper-helper/archive/refs/heads/main.zip

### Basic use with youtube-dl (or yt-dlp etc)

In plain mode (one URL per line):

```bash
node build/tiktok_standalone.js TIKTOK_USERNAME --plain \
    | xargs -n 1 yt-dlp
```

In JSON module (a single array of strings):

```bash
node build/tiktok_standalone.js TIKTOK_USERNAME \
    | jq '.[]' \
    | xargs -n 1 yt-dlp
```
