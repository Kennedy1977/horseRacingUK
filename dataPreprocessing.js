const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const path = require("path");

// Define and compile the model (place this code before calling trainModel)
const model = tf.sequential();
model.add(
  tf.layers.dense({
    units: 50,
    activation: "relu",
    inputShape: [2],
  })
);
model.add(
  tf.layers.dense({
    units: 30,
    activation: "relu",
  })
);
model.add(
  tf.layers.dense({
    units: 1,
    activation: "sigmoid",
  })
);
model.compile({
  optimizer: "adam",
  loss: "binaryCrossentropy",
  metrics: ["accuracy"],
});

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
  let inputs = [];
  let labels = [];

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

          inputs.push([spNumeric, bhaPerformance]);
          labels.push([output]);
        }
      });
    });
  });

  // Convert inputs and labels to tensors
  inputs = tf.tensor2d(inputs);
  labels = tf.tensor2d(labels);

  return { inputs, labels };
}

const historicalDataDir = path.join(__dirname, "./_completed_data");
const { inputs, labels } = loadAndPreprocessData(historicalDataDir);

// Training the model (this function should be async to await the fit call)
async function trainModel(inputs, labels) {
  // Now include the training logic here
  const history = await model.fit(inputs, labels, {
    epochs: 100,
    validationSplit: 0.2,
    shuffle: true,
  });

  console.log("Training Complete");

  // Save the model
  const savePath = "file://" + path.join(__dirname, "my-model");
  await model.save(savePath);
  console.log(`Model saved to ${savePath}`);
}

// Assuming you have your inputs and labels ready
trainModel(inputs, labels).then(() => {
  console.log("Model trained and saved successfully");
});

// Function to load the model (you may call this in a different file or after training)
async function loadModel() {
  const model = await tf.loadLayersModel(
    "file://" + path.join(__dirname, "my-model/model.json")
  );
  console.log("Model loaded successfully.");
  // Now you can use model.predict, model.evaluate, or any other method
}

// Call loadModel() as needed
