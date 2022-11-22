import { Browser, Page } from "puppeteer";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36";
const VIEWPORT = { width: 1280, height: 1920 };
const DEFAULT_TIMEOUT = 40 * 1000;

async function newPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  page.setDefaultTimeout(DEFAULT_TIMEOUT);
  await page.setViewport(VIEWPORT);
  await page.setUserAgent(USER_AGENT);
  await page.setJavaScriptEnabled(true);
  return page;
}

async function getVideoUrls(
  browser: Browser,
  username: string
): Promise<string[]> {
  const page = await newPage(browser);
  const tiktokUrl = `https://www.tiktok.com/@${username}`;
  await page.goto(tiktokUrl, { waitUntil: "networkidle2" });

  const selector = `[data-e2e=user-post-item-list] a[href^='${tiktokUrl}/video/' i]`;
  const videoLinksElements = await page.$$(selector);

  const videoUrls: string[] = [];
  for (const anchor of videoLinksElements) {
    const hrefHandle = await anchor.getProperty("href");
    const href = (await hrefHandle.jsonValue()) as string;
    videoUrls.push(href);
  }

  await page.close();
  return videoUrls;
}

export { getVideoUrls };
