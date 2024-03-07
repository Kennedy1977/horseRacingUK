const puppeteer = require("puppeteer");
const fs = require("fs").promises;

async function scrapeData(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  // Scrape fixture information with added checks
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

  // Scrape race details with added checks
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

  // Scrape race entries with added checks
  const raceEntries = await page.evaluate(() => {
    const entries = [];
    const entryElements = document.querySelectorAll(
      "#raceentries-ui .table-entry"
    );
    entryElements.forEach((entry) => {
      const horseJockeyElement = entry.querySelector(
        ".name .table-link--horse"
      );
      const trainerOwnerElement = entry.querySelector(
        ".trainer .table-link--trainer"
      );
      const horseJockey = horseJockeyElement
        ? horseJockeyElement.innerText.trim()
        : "N/A";
      const trainerOwner = trainerOwnerElement
        ? trainerOwnerElement.innerText.trim()
        : "N/A";
      // Add more fields as needed
      entries.push({ horseJockey, trainerOwner });
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
    "https://www.britishhorseracing.com/racing/fixtures/upcoming/racecard/race/#!/2024/1048/11614/0/"; // Replace this with the actual URL
  const data = await scrapeData(url);
  await saveDataToFile(data, "fixture.json");
  console.log("Data has been saved to fixture.json");
})();
