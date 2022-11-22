import { getBrowser } from "./browser";
import { getVideoUrls } from "./tiktok";
import { Readable } from "node:stream";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const args = yargs(hideBin(process.argv))
  .usage(
    `Usage: $0 USERNAME [--plain]

Scrape TikTok video URLs for USERNAME. Fetches the most recent 30 video URLs.
The TikTok username can be supplied with or without the leading @ sign.

Outputs the URLs as a JSON array, unless --plain is given, in which case the
URLs are output as text, one per line.`
  )
  .options({
    plain: {
      type: "boolean",
      describe: "Output video URLs separated by newlines",
      default: false,
    },
  })
  .coerce("_", (usernames: string[]) =>
    usernames.map((u) => u.replace(/^@+/, ""))
  )
  .demandCommand(1, 1, "USERNAME is required.", "Supply only one USERNAME.")
  .help()
  .alias("h", "help")
  .parseSync();

const { plain } = args;
const username = args._[0];

async function scraperWrapper(username: string): Promise<string[]> {
  const browser = await getBrowser();
  try {
    return await getVideoUrls(browser, username);
  } catch (error) {
    throw new Error(
      `Attempt to fetch video page URLs failed with error ${error}.`
    );
  } finally {
    await browser.close();
  }
}

scraperWrapper(username)
  .then((urls) => {
    const formatted: string = plain ? urls.join("\n") : JSON.stringify(urls);
    const stream = Readable.from(formatted + "\n");
    stream.pipe(process.stdout);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
