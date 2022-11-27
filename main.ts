import express from "express";
import Router from "express-promise-router";

import { spawn } from "node:child_process";

const app = express();
const router = Router();
app.use(router);

const PORT = Number(process.env.PORT || 8451);
const HOST = process.env.HOST || "localhost";

function isValidUsername(username: string): boolean {
  return /^\w+$/.test(username);
}
function isValidTweetID(tweetID: string): boolean {
  return /^\d+$/.test(tweetID);
}
function isValidCaptureType(captureType: string): boolean {
  return captureType === "tweet" || captureType === "thread";
}

function validateTwitter(
  username,
  tweetID: string,
  captureType: string
): boolean {
  return (
    isValidUsername(username) &&
    isValidTweetID(tweetID) &&
    isValidCaptureType(captureType)
  );
}

router.get("/health", async (_req, res) => {
  res.status(200).send();
});

router.get(
  "/twitter/screenshot/:username-:tweetID-:captureType.png",
  async (req, res) => {
    const { username, tweetID, captureType } = req.params;
    if (!validateTwitter(username, tweetID, captureType)) {
      res.statusCode = 400;
      res.json({
        error: "invalid paramaters",
        params: { username, tweetID, captureType },
      });
      return;
    }

    console.log(
      `scraper-helper :: Twitter :: LOL :: ${username} :: ${tweetID}`
    );
    const cliArgs = ["twitter_standalone.js", username, tweetID];
    if (captureType === "tweet") {
      cliArgs.push("--single-tweet");
    }
    const screenshotProcess = spawn("node", cliArgs, {
      cwd: ".",
      env: process.env,
    });

    res.contentType("png");
    screenshotProcess.stdout.pipe(res);
    return;
  }
);

router.get("/tiktok/recent/:username", async (req, res) => {
  const username = req.params.username.match(/^@?(\w+)$/)[1];
  if (username === undefined || username === null) {
    res.statusCode = 400;
    res.json({ error: "invalid username" });
    return;
  }
  console.log(`scraper-helper :: TikTok :: Recent :: ${username}`);
  const videoPageUrlsProcess = spawn(
    "node",
    ["tiktok_standalone.js", username],
    { cwd: ".", env: process.env }
  );
  res.contentType("json");
  videoPageUrlsProcess.stdout.pipe(res);
});

app.listen(PORT, HOST, () => {
  console.log(`Listening on ${HOST}:${PORT}`);
});
