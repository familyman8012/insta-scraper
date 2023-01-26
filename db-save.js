const express = require("express");
const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const cron = require("node-cron");

const app = express();

mongoose.connect("mongodb://localhost/yourDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const instagramSchema = new mongoose.Schema({
  postUrl: String,
  imageUrl: String,
  caption: String,
  created_at: { type: Date, default: Date.now },
});

const Instagram = mongoose.model("Instagram", instagramSchema);

cron.schedule("0 6 * * *", async () => {
  const hashtag = "startup";
  const url = `https://www.instagram.com/explore/tags/${hashtag}`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  // Wait for the page to fully load
  await page.waitForSelector("._aabd");

  // Scrape the data
  const data = await page.evaluate(() => {
    const posts = Array.from(document.querySelectorAll("._aabd"));
    return posts.map((post) => {
      const postUrl = post.querySelector("a").href;
      const imageUrl = post.querySelector("img").src;
      const caption = post.querySelector("img").alt;
      return { postUrl, imageUrl, caption };
    });
  });

  await browser.close();

  data.forEach((item) => {
    const instagram = new Instagram(item);
    instagram.save();
  });
});

app.listen(3000, () => {
  console.log("Scraper server running on port 3000");
});
