const puppeteer = require("puppeteer");
const fs = require("fs").promises;

async function scrapeData(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" }); // Wait for the network to be idle before scraping

  // Wait explicitly for the jockey elements to ensure they are fully loaded
  await page.waitForSelector(".table-link--jockey");

  // Scrape fixture information
  const fixtureInfo = await page.evaluate(() => {
    const courseNameElement = document.querySelector(
      ".header-wrap__title.page-title span"
    );
    const dateElement = document.querySelector(".header-wrap__date");
    return {
      courseName: courseNameElement
        ? courseNameElement.innerText.trim()
        : "N/A",
      date: dateElement ? dateElement.innerText.trim() : "N/A",
    };
  });

  // Scrape race entries with detailed information
  const raceEntries = await page.evaluate(() => {
    const entries = [];
    document
      .querySelectorAll("#raceentries-ui .table-entry")
      .forEach((entry) => {
        const jockeyLinkElement = entry.querySelector(
          ".name .table-link--jockey"
        );
        entries.push({
          noDraw: entry.querySelector(".no-draw .silk-wrap")
            ? entry.querySelector(".no-draw .silk-wrap").innerText.trim()
            : "N/A",
          horseName: entry.querySelector(".name .table-link--horse")
            ? entry.querySelector(".name .table-link--horse").innerText.trim()
            : "N/A",
          horseUrl: entry.querySelector(".name .table-link--horse")
            ? entry.querySelector(".name .table-link--horse").href
            : "No URL",
          jockeyName: jockeyLinkElement
            ? jockeyLinkElement.innerText.trim()
            : "N/A",
          jockeyUrl: jockeyLinkElement ? jockeyLinkElement.href : "No URL",
          trainerName: entry.querySelector(".trainer .table-link--trainer")
            ? entry
                .querySelector(".trainer .table-link--trainer")
                .innerText.trim()
            : "N/A",
          trainerUrl: entry.querySelector(".trainer .table-link--trainer")
            ? entry.querySelector(".trainer .table-link--trainer").href
            : "No URL",
          age: entry.querySelector(".age")
            ? entry.querySelector(".age").innerText.trim()
            : "N/A",
          formType: entry.querySelector(".form")
            ? entry.querySelector(".form").innerText.trim()
            : "N/A",
          bhaRating: entry.querySelector(".rating")
            ? entry.querySelector(".rating").innerText.trim()
            : "N/A",
          weight: entry.querySelector(".weight")
            ? entry.querySelector(".weight").innerText.trim()
            : "N/A",
          odds: entry.querySelector(".odds")
            ? entry.querySelector(".odds").innerText.trim()
            : "N/A",
        });
      });
    return entries;
  });

  await browser.close();

  return { fixtureInfo, raceEntries };
}

async function saveDataToFile(data, filename) {
  await fs.writeFile(filename, JSON.stringify(data, null, 2));
  console.log("Data has been saved to " + filename);
}

(async () => {
  const url =
    "https://www.britishhorseracing.com/racing/fixtures/upcoming/racecard/race/#!/2024/1114/4543/0/"; // Replace with actual URL
  const data = await scrapeData(url);
  await saveDataToFile(data, "fixture.json");
})();
