const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const path = require("path");

// Load and preprocess historical data
// Make sure to adjust loadAndPreprocessData and preprocessFixtureData functions to return tensors
const { loadAndPreprocessData } = require("./dataPreprocessing");
const historicalDataDir = path.join(__dirname, "./_completed_data");
const trainingData = loadAndPreprocessData(historicalDataDir);

// Define a model
const model = tf.sequential();
model.add(
  tf.layers.dense({
    units: 3,
    inputShape: [trainingData.input[0].shape[0]],
    activation: "sigmoid",
  })
); // Adjust input shape based on your data
model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

// Compile the model
model.compile({
  optimizer: tf.train.adam(),
  loss: "meanSquaredError",
  metrics: ["accuracy"],
});

// Train the model
async function trainModel() {
  await model.fit(trainingData.inputs, trainingData.labels, {
    epochs: 200, // Adjust according to your needs
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(
          `Epoch ${epoch + 1}: Loss = ${logs.loss}, Accuracy = ${logs.acc}`
        );
      },
    },
  });

  console.log("Training Complete");
}

// Assuming preprocessFixtureData function exists and is adapted for TensorFlow.js
const fixturePath = path.join(__dirname, "fixture-complete.json");
const fixtureData = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const { preprocessFixtureData } = require("./preprocessData");
const preprocessedFixtureData = preprocessFixtureData(fixtureData);

trainModel().then(() => {
  // Predict outcomes based on the preprocessed fixture data
  preprocessedFixtureData.forEach((entryFeatures, index) => {
    const prediction = model.predict(tf.tensor2d([entryFeatures])); // Ensure entryFeatures is in the correct shape
    prediction.print(); // Or use dataSync() to get the prediction value
    console.log(`Horse ${index + 1} Prediction:`, prediction.dataSync());
  });
});

// Note: Ensure your dataPreprocessing and preprocessFixtureData functions return data in a suitable format for TensorFlow.js
