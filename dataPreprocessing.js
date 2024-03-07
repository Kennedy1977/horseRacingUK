const fs = require("fs");
const path = require("path");

// Helper function to load JSON data from a file
function loadJson(filePath) {
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
}

// Convert SP to a numeric value for model input
function convertSpToNumeric(sp) {
  const [numerator, denominator] = sp.split("/").map(Number);
  return numerator / (denominator || 1); // Guard against division by zero
}

function loadAndPreprocessData(directory) {
  const trainingData = [];
  const fileNames = fs.readdirSync(directory);

  fileNames.forEach((fileName) => {
    const filePath = path.join(directory, fileName);
    const races = loadJson(filePath);

    races.forEach((race) => {
      const { horses } = race;

      horses.forEach((horse) => {
        if (horse.POS && horse.POS !== "NR" && horse.SP) {
          const pos = horse.POS.replace(/[^0-9]/g, ""); // Extract numeric part of position
          const spNumeric = convertSpToNumeric(horse.SP);
          const bhaPerformance =
            parseInt(horse["BHA Performance Figure"], 10) || 0;

          // Define a simple output: 1 for a win, 0 otherwise
          const output = horse.POS === "1st" ? 1 : 0;

          trainingData.push({
            input: [spNumeric, bhaPerformance],
            output: [output],
          });
        }
      });
    });
  });

  return trainingData;
}

const historicalDataDir = path.join(__dirname, './_completed_data');
const preprocessedData = loadAndPreprocessData(historicalDataDir);

function savePreprocessedData(data, filePath) {
  const dataString = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, dataString);
}

// Example usage (choose an appropriate file path)
const outputFile = path.join(__dirname, 'preprocessedData.json');
savePreprocessedData(preprocessedData, outputFile);