const puppeteer = require("puppeteer");
const fs = require("fs").promises;

// Helper function to scrape data from a page
async function scrapeData(page, selector, evalFunc) {
  return await page.$$eval(selector, evalFunc);
}

// Function to scrape horse data with safety checks
async function scrapeHorseData(page, url) {
  await page.goto(url, { waitUntil: "networkidle2" });
  return scrapeData(page, "li.tr.ng-scope", (elems) =>
    elems.map((el) => ({
      raceDate:
        el
          .querySelector(".table-cell.w35.total .fl.inline-field-value a")
          ?.innerText.trim() ?? "N/A",
      position:
        el
          .querySelector(".table-cell.w15.total .fl.inline-field-value")
          ?.innerText.trim() ?? "N/A",
      jockey:
        el
          .querySelector(".table-cell.w20.total .fl.inline-field-value")
          ?.innerText.trim() ?? "N/A",
      weightCarried:
        el
          .querySelector(".table-cell.w15.total .fl.inline-field-value")
          ?.innerText.trim() ?? "N/A",
      prize:
        el
          .querySelector(".table-cell.w15.total .fl.inline-field-value")
          ?.innerText.trim() ?? "N/A",
    }))
  );
}

// Function to scrape jockey data with safety checks
async function scrapeJockeyData(page, url) {
  await page.goto(url, { waitUntil: "networkidle2" });
  return scrapeData(page, "li.table-entry.ng-scope", (elems) =>
    elems.map((el) => ({
      raceDate:
        el
          .querySelector(".table-cell.w40.total .fl.inline-field-value a")
          ?.innerText.trim() ?? "N/A",
      sp:
        el
          .querySelector(".table-cell.w10.sp .fl.inline-field-value")
          ?.innerText.trim() ?? "N/A",
      result:
        el
          .querySelector(".table-cell.w10.result .fl.inline-field-value")
          ?.innerText.trim() ?? "N/A",
      horse:
        el
          .querySelector(".table-cell.w20.horse .fl.inline-field-value")
          ?.innerText.trim() ?? "N/A",
      trainer:
        el
          .querySelector(
            ".table-cell.w20.last-col.trainer .fl.inline-field-value"
          )
          ?.innerText.trim() ?? "N/A",
    }))
  );
}

// Function to scrape trainer data with safety checks
async function scrapeTrainerData(page, url) {
  await page.goto(url, { waitUntil: "networkidle2" });
  return scrapeData(page, "li.table-entry.ng-scope", (elems) =>
    elems.map((el) => ({
      raceDate:
        el
          .querySelector(".table-cell.w40.total .fl.inline-field-value a")
          ?.innerText.trim() ?? "N/A",
      sp:
        el
          .querySelector(".table-cell.w10.sp .fl.inline-field-value")
          ?.innerText.trim() ?? "N/A",
      result:
        el
          .querySelector(".table-cell.w10.result .fl.inline-field-value")
          ?.innerText.trim() ?? "N/A",
      horse:
        el
          .querySelector(".table-cell.w20.horse .fl.inline-field-value")
          ?.innerText.trim() ?? "N/A",
      jockey:
        el
          .querySelector(".table-cell.w20.trainer .fl.inline-field-value")
          ?.innerText.trim() ?? "N/A",
    }))
  );
}

// Main function to enrich and save data
async function enrichAndSaveData() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const fixtureData = JSON.parse(await fs.readFile("fixture.json", "utf-8"));

  for (let entry of fixtureData.raceEntries) {
    // Assuming `entry` has `horseUrl`, `jockeyUrl`, and `trainerUrl`
    if (entry.horseUrl && entry.horseUrl !== "No URL") {
      entry.horseData = await scrapeHorseData(page, entry.horseUrl);
    } else {
      console.log("Skipping horse data due to 'No URL'");
    }

    if (entry.jockeyUrl && entry.jockeyUrl !== "No URL") {
      entry.jockeyData = await scrapeJockeyData(page, entry.jockeyUrl);
    } else {
      console.log("Skipping jockey data due to 'No URL'");
    }

    if (entry.trainerUrl && entry.trainerUrl !== "No URL") {
      entry.trainerData = await scrapeTrainerData(page, entry.trainerUrl);
    } else {
      console.log("Skipping trainer data due to 'No URL'");
    }
  }

  await browser.close();
  await fs.writeFile(
    "fixture-complete.json",
    JSON.stringify(fixtureData, null, 2)
  );
  console.log("Enrichment complete, data saved to fixture-complete.json.");
}

enrichAndSaveData().catch(console.error);
