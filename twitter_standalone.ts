import { getBrowser } from "./browser";
import { screenshot } from "./twitter";
import { Readable } from "node:stream";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const args = yargs(hideBin(process.argv))
  .usage(
    `Usage: $0 USERNAME TWEET_ID

Create a screenshot of tweet TWEET_ID by USERNAME via Nitter.

The binary PNG data is written to stdout so you will want to either redirect
the output into a file or pipe it into another program for processing.

The screenshot includes adjacent tweets in the thread.`
  )
  .demandCommand(2, 2, "USERNAME and TWEET_ID are required.")
  .coerce("_", (args: (string | number)[]) => args.map(String))
  .help()
  .alias("h", "help")
  .parseSync();

const [username, tweetID] = args._;

async function main(username: string, tweetID: string): Promise<Buffer> {
  const browser = await getBrowser();
  let buffer: Buffer;
  try {
    buffer = await screenshot({ username, tweetID }, browser);
  } catch (error) {
    throw new Error(`Screenshot attempt failed with error ${error}.`);
  } finally {
    await browser.close();
  }
  return buffer;
}

main(username, tweetID)
  .then((buffer) => {
    const stream = Readable.from(buffer);
    stream.pipe(process.stdout);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
