const puppeteer = require("puppeteer");
const fs = require("fs");

async function fetchResultsUrls(year, month) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = `https://www.britishhorseracing.com/racing/results/#!?year=${year}&month=${month}`;

  try {
    await page.goto(url, { waitUntil: "networkidle2" }); // Waits for the network to be idle
    const links = await page.evaluate(() => {
      // Get all <a> elements on the page
      const allAnchors = Array.from(document.querySelectorAll("a"));
      // Filter anchors based on text content 'View results'
      return allAnchors
        .filter((anchor) => anchor.textContent.includes("View results"))
        .map((anchor) => anchor.href);
    });

    console.log(`Collected ${links.length} links for ${year}-${month}`);
    await browser.close();
    return links;
  } catch (error) {
    console.error(`Error fetching data for ${year}-${month}: ${error}`);
    await browser.close();
    return [];
  }
}

async function collectAllResultsLinks() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
  let allLinks = [];

  for (let year = 2012; year <= currentYear; year++) {
    for (let month = 1; month <= 12; month++) {
      if (year === currentYear && month > currentMonth) break;

      const monthlyLinks = await fetchResultsUrls(year, month);
      allLinks = [...allLinks, ...monthlyLinks];

      // Add a slight delay between requests to be courteous to the server
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  // Save the links to a file
  fs.writeFileSync(
    "racing_results_links.json",
    JSON.stringify(allLinks, null, 2)
  );
  console.log("All links collected and saved.");
}

collectAllResultsLinks();
