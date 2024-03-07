const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const baseURL =
  "https://www.britishhorseracing.com/racing/results/fixture-results/";
const dataDirectory = "./data";
const outputDirectory = "./_completed_data";

// Ensure output directory exists
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory, { recursive: true });
}

async function scrapeRaceDetails(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const raceDetails = await page.evaluate(() => {
    const details = {};
    document
      .querySelectorAll(".race-conditions .info-list .meta-entry")
      .forEach((elem) => {
        let key = elem.querySelector(".entry-title")?.innerText.trim();
        let value =
          elem.querySelector(".entry-body")?.innerText.trim() ||
          elem.querySelector(".fl.inline-field-value")?.innerText.trim();
        if (key && value) {
          details[key] = value;
        }
      });

    const horses = Array.from(
      document.querySelectorAll("#raceentries-ui .table-entry")
    ).map((horse) => ({
      POS:
        horse
          .querySelector(".table-cell.w20.no-draw .inline-field-value .index")
          ?.innerText.trim() || "N/A",
      "HORSE/JOCKEY": horse
        .querySelector(".table-cell.w30.name .inline-field-value")
        ?.innerText.trim(),
      "TRAINER/OWNER": horse
        .querySelector(".table-cell.w20.trainer .inline-field-value")
        ?.innerText.trim(),
      "DISTANCES/TIMES": horse
        .querySelector(".table-cell.w20.distance .inline-field-value")
        ?.innerText.trim(),
      SP: horse
        .querySelector(".table-cell.w10 .inline-field-value")
        ?.innerText.trim(),
    }));

    return { details, horses };
  });

  await browser.close();
  return raceDetails;
}

(async () => {
  const files = fs
    .readdirSync(dataDirectory)
    .filter((file) => path.extname(file) === ".json");

  for (const file of files) {
    const newFileName = `${file}`;
    const newFilePath = path.join(outputDirectory, newFileName);

    // Check if the completed file already exists to skip processing
    if (fs.existsSync(newFilePath)) {
      console.log(
        `Completed data for ${newFileName} already exists. Skipping.`
      );
      continue;
    }

    const filePath = path.join(dataDirectory, file);
    const races = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    for (const race of races) {
      const fullURL = baseURL + race.URL;
      const extractedDetails = await scrapeRaceDetails(fullURL);
      race.details = extractedDetails.details;
      race.horses = extractedDetails.horses;
    }

    // Writing the modified data back to a new file in the output directory
    fs.writeFileSync(newFilePath, JSON.stringify(races, null, 2), "utf-8");
    console.log(`Completed data for ${newFileName}`);
  }
})();
