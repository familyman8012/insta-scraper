const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.get("/scrape/:hashtag", async (req, res) => {
  const hashtag = req.params.hashtag;
  const url = `https://www.instagram.com/explore/tags/${hashtag}`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  // Wait for the page to fully load
  await page.waitForSelector("._aabd");

  // Scrape the data
  const data = await page.evaluate(() => {
    const posts = Array.from(document.querySelectorAll("._aabd"));
    return posts.map(post => {
      const postUrl = post.querySelector("a").href;
      const imageUrl = post.querySelector("img").src;
      const caption = post.querySelector("img").alt;
      return { postUrl, imageUrl, caption };
    });
  });

  await browser.close();

  res.json(data);
});

app.listen(3000, () => {
  console.log("Scraper server running on port 3000");
});
