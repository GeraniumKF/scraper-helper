# scraper-helper

## Quick Start

### Locally

- Install node >= 18.
- Clone the repo or [grab and extract the zip][zip].
- `npm install && npm run build`

[zip]: https://github.com/GeraniumKF/scraper-helper/archive/refs/heads/main.zip

### Docker

Use the provided Dockerfile to spin up the Express server that offers HTTP
access to the scrapers. Most of the installed packages are to ensure that the
screenshots render properly in headless Chrome.

You'll want to supply the `HOST` and `PORT` environment variables for Express.

## Twitter screenshot-taker

`node build/twitter_standalone.js [--single-tweet | -s] USERNAME TWEET_ID`

Takes a PNG screenshot of a given thread or single tweet and writes the binary
PNG data to stdout.

You'll probably want to optimise the resulting PNG.

### Environment variables

- Set `NITTER_URL` in the environment to use a Nitter server other than nitter.net.

### Basic use

```bash
node build/twitter_standalone.js elonmusk 1595869526469533701 \
  > elonmusk-1595869526469533701-thread.png

node build/twitter_standalone.js --single-tweet jack 20 \
  > jack-20-tweet.png
```

## TikTok scraper

`node build/tiktok_standalone.js [--plain] TIKTOK_USERNAME`

Scrapes the 30 most recent videos from a TikTok user (can't seem to get
TikTok's scroll-to-load to work with puppeteer).

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

## Express server

There's a very basic Express server included, as `main.js`.

This exposes routes to take Twitter screenshots and retrieve the list of recent
TikTok videos.

### Quick start

You should run the Express server while in the JavaScript build directory:

```bash
cd build && node main.js
```

### Environment variables

- `HOST` controls the **host** Express listens on (default `localhost`).
- `PORT` controls the **port** Express listens on (default 8451).

### Twitter screenshots

`GET /twitter/screenshot/USERNAME-TWEETID-CAPTURETYPE.png`

Result is a PNG image.

- USERNAME should be the Twitter username.
- TWEETID should be the Twitter status ID of the tweet.
- CAPTURETYPE should be either "tweet" or "thread".

```HTTP
GET /twitter/screenshot/jack-20-tweet.png

GET /twitter/screenshot/elonmusk-1595869526469533701-thread.png
```

### TikTok recent videos list

`GET /tiktok/recent/USERNAME`

Result is a JSON array of strings, each a TikTok video page URL.
