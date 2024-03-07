const brain = require("brain.js");
const fs = require("fs");
const path = require("path");

// Load and preprocess historical data
const { loadAndPreprocessData } = require("./dataPreprocessing");
const historicalDataDir = path.join(__dirname, "./_completed_data");
const trainingData = loadAndPreprocessData(historicalDataDir);

// Initialize and train the network
const network = new brain.NeuralNetwork({
  hiddenLayers: [3], // Adjust based on performance
});

network.train(
  trainingData.map((d) => ({
    input: d.input,
    output: d.output,
  })),
  {
    iterations: 20000, // Adjust based on the size and complexity of the dataset
    errorThresh: 0.005,
    log: true,
    logPeriod: 10,
  }
);

// Load the fixture data and preprocess it
const fixturePath = path.join(__dirname, "fixture-complete.json");
const fixtureData = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const { preprocessFixtureData } = require("./preprocessData"); // Ensure this file exists and correctly exports a function
const preprocessedFixtureData = preprocessFixtureData(fixtureData);

// Predict outcomes based on the preprocessed fixture data
preprocessedFixtureData.forEach((entryFeatures, index) => {
  const prediction = network.run(entryFeatures);
  console.log(`Horse ${index + 1} Prediction: ${prediction}`);
});
