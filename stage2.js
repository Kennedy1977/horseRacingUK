const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Load URLs from the JSON file
const urls = JSON.parse(fs.readFileSync("racing_results_links.json", "utf8"));

async function scrapeRaceData(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  const raceDetails = await page.evaluate(() => {
    const raceData = [];
    const courseNameElement = document.querySelector(
      "h2.header-wrap .header-wrap__title.page-title span.ng-binding"
    );
    const dateElement = document.querySelector(
      "h2.header-wrap .header-wrap__date"
    );
    const courseName = courseNameElement
      ? courseNameElement.innerText.trim()
      : "UnknownCourse";
    const date = dateElement
      ? dateElement.innerText.replace(/ /g, "").trim()
      : "UnknownDate";

    document
      .querySelectorAll("li.table-entry.with-child.ng-scope")
      .forEach((raceElement) => {
        const timeElement = raceElement.querySelector(".table-cell.w10.time a");
        const time = timeElement.querySelector(
          ".inline-field-value.date"
        ).innerText;
        const raceDayUrl = timeElement.getAttribute("href");
        const name = raceElement.querySelector(
          ".table-cell.w40.name .inline-field-value"
        ).innerText;
        const distance = raceElement.querySelector(
          ".table-cell.w20.race-distance .inline-field-value"
        ).innerText;
        const winner = raceElement.querySelector(
          ".table-cell.w25.last-col.winner .inline-field-value .bold"
        ).innerText;

        raceData.push({
          TIME: time,
          NAME: name,
          DISTANCE: distance,
          WINNER: winner,
          URL: raceDayUrl,
        });
      });

    return { raceData, courseName, date };
  });

  await browser.close();
  return raceDetails;
}

(async () => {
  for (let url of urls) {
    const { raceData, courseName, date } = await scrapeRaceData(url);
    // Sanitize courseName and date for use in filenames
    const safeCourseName = courseName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const safeDate = date.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const fileName = `./data/race-data-${safeDate}-${safeCourseName}.json`;

    // Check if the file already exists to avoid scraping again
    if (!fs.existsSync(path.join(__dirname, fileName))) {
      fs.writeFileSync(fileName, JSON.stringify(raceData, null, 2));
      console.log(`Data for ${url} saved to ${fileName}`);
    } else {
      console.log(`File ${fileName} already exists. Skipping.`);
    }
  }
})();
