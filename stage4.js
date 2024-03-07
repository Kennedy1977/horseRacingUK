const puppeteer = require("puppeteer");
const fs = require("fs").promises;

async function scrapeData(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  // Scrape fixture information
  const fixtureInfo = await page.evaluate(() => {
    const courseNameElement = document.querySelector(
      ".header-wrap__title.page-title span"
    );
    const dateElement = document.querySelector(".header-wrap__date");
    const courseName = courseNameElement
      ? courseNameElement.innerText.trim()
      : "N/A";
    const date = dateElement ? dateElement.innerText.trim() : "N/A";
    return { courseName, date };
  });

  // Scrape race details
  const raceDetails = await page.evaluate(() => {
    const detailsElements = document.querySelectorAll(".info-list .meta-entry");
    const details = Array.from(detailsElements).reduce((acc, element) => {
      const titleElement = element.querySelector(".entry-title");
      const bodyElement = element.querySelector(".entry-body");
      if (titleElement && bodyElement) {
        const title = titleElement.innerText.trim();
        const body = bodyElement.innerText.trim();
        acc[title] = body;
      }
      return acc;
    }, {});
    return details;
  });

  // Scrape race entries with detailed information
  const raceEntries = await page.evaluate(() => {
    const entries = [];
    document
      .querySelectorAll("#raceentries-ui .table-entry")
      .forEach((entry) => {
        const noDraw = entry.querySelector(".no-draw .silk-wrap")
          ? entry.querySelector(".no-draw .silk-wrap").innerText.trim()
          : "N/A";
        const horseJockeyElement = entry.querySelector(
          ".name .table-link--horse"
        );
        const jockeyLinkElement = entry.querySelector(
          ".name .table-link--jockey"
        );
        const trainerLinkElement = entry.querySelector(
          ".trainer .table-link--trainer"
        );
        const age = entry.querySelector(".age")
          ? entry.querySelector(".age").innerText.trim()
          : "N/A";
        const formType = entry.querySelector(".form")
          ? entry.querySelector(".form").innerText.trim()
          : "N/A";
        const bhaRating = entry.querySelector(".rating")
          ? entry.querySelector(".rating").innerText.trim()
          : "N/A";
        const weight = entry.querySelector(".weight")
          ? entry.querySelector(".weight").innerText.trim()
          : "N/A";
        const odds = entry.querySelector(".odds")
          ? entry.querySelector(".odds").innerText.trim()
          : "N/A";

        const horseJockey = horseJockeyElement
          ? horseJockeyElement.innerText.trim()
          : "N/A";
        const horseUrl = horseJockeyElement
          ? horseJockeyElement.href
          : "No URL";
        const jockeyName = jockeyLinkElement
          ? jockeyLinkElement.innerText.trim()
          : "N/A";
        const jockeyUrl = jockeyLinkElement ? jockeyLinkElement.href : "No URL";
        const trainerName = trainerLinkElement
          ? trainerLinkElement.innerText.trim()
          : "N/A";
        const trainerUrl = trainerLinkElement
          ? trainerLinkElement.href
          : "No URL";

        entries.push({
          noDraw,
          horseName: horseJockey,
          horseUrl,
          jockeyName,
          jockeyUrl,
          trainerName,
          trainerUrl,
          age,
          formType,
          bhaRating,
          weight,
          odds,
        });
      });
    return entries;
  });

  await browser.close();

  return { fixtureInfo, raceDetails, raceEntries };
}

async function saveDataToFile(data, filename) {
  await fs.writeFile(filename, JSON.stringify(data, null, 2));
}

(async () => {
  const url =
    "https://www.britishhorseracing.com/racing/fixtures/upcoming/racecard/race/#!/2024/1048/11614/0/"; // Make sure to replace this with the actual URL
  const data = await scrapeData(url);
  await saveDataToFile(data, "fixture.json");
  console.log("Data has been saved to fixture.json");
})();
