import { Browser, Page } from "puppeteer";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36";
const TWEET_SELECTOR = ".main-thread";
const DEFAULT_TIMEOUT = 10 * 1000;
const VIEWPORT = {
  width: 1280,
  height: 1920,
  deviceScaleFactor: 2,
};
const REMOVE_SPACING_CSS = `\
.main-tweet, .replies {
  padding-top: 0 !important;
  margin-top: 0 !important;
}
`;
const NITTER_URL: string = (
  process.env.NITTER_URL || "https://nitter.net"
).replace(/\/+$/, "");

async function newPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  page.setDefaultTimeout(DEFAULT_TIMEOUT);
  await page.setViewport(VIEWPORT);
  await page.setUserAgent(USER_AGENT);
  await page.setJavaScriptEnabled(true);
  return page;
}

interface TwitterRequest {
  username: string;
  tweetID: string;
}

async function screenshot(
  info: TwitterRequest,
  browser: Browser
): Promise<Buffer> {
  const tweetUrl = `${NITTER_URL}/${info.username}/status/${info.tweetID}`;
  const page = await newPage(browser);

  try {
    await page.goto(tweetUrl);
    await page.waitForSelector(TWEET_SELECTOR, { timeout: 10_000 });

    // Remove Nitter logo bar above the thread.
    await page.evaluate(() => {
      document.querySelector("nav").remove();
    });
    // Remove Nitter logo bar-related spacing.
    page.addStyleTag({ content: REMOVE_SPACING_CSS });

    const tweet = await page.$(TWEET_SELECTOR);
    if (tweet === null) {
      throw new Error("Tweet not found.");
    }
    const buffer = (await tweet.screenshot({
      type: "png",
      encoding: "binary",
    })) as Buffer;
    return buffer;
  } finally {
    await page.close();
  }
}

export { screenshot };
