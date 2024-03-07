const brain = require("brain.js");
const fs = require("fs");
const path = require("path");

// Helper function to load JSON data
function loadJson(filePath) {
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
}

// Load and preprocess historical data
function loadAndPreprocessData(directory) {
  const trainingData = [];
  const fileNames = fs.readdirSync(directory);
  fileNames.forEach((fileName) => {
    const filePath = path.join(directory, fileName);
    const races = loadJson(filePath);
    races.forEach((race) => {
      // This preprocessing part needs to be adjusted according to your data structure and features
      // Example: Using 'BHA Performance Figure' and converting 'SP' to numeric value as inputs, and positions as output
      race.raceEntries.forEach((entry) => {
        // Placeholder for preprocessing, e.g., converting SP to a numerical value and position to a binary win/loss
        // const input = convertSpToNumeric(entry.SP);
        // const output = convertPositionToOutput(entry.POS);
        // trainingData.push({ input, output });
      });
    });
  });
  return trainingData;
}

// Example preprocessing function (needs implementation)
function preprocessData(data) {
  // Placeholder for preprocessing logic
  return data.map((d) => ({
    input: [
      /* Your input features */
    ],
    output: [
      /* Expected output */
    ],
  }));
}

// Example function to convert SP to a numeric value (needs real implementation)
function convertSpToNumeric(sp) {
  // Implement conversion logic here
  return parseFloat(sp);
}

// Example function to convert race position to output (needs real implementation)
function convertPositionToOutput(position) {
  // Implement conversion logic here (e.g., 1 for win, 0 for lose/not win)
  return position === "1st" ? [1] : [0];
}

const historicalDataDir = path.join(__dirname, "data", "_comp");
const preprocessedData = loadAndPreprocessData(historicalDataDir);

// Initialize and train the network
const network = new brain.NeuralNetwork();
network.train(preprocessedData);

// Predict the outcome of a new race
const fixtureData = loadJson("fixture.json");
const preprocessedFixture = preprocessData([fixtureData]);
const prediction = network.run(preprocessedFixture[0].input);
console.log(`Prediction: ${prediction}`);
