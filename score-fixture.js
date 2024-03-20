const fs = require("fs");
const path = require("path");

// Load fixture data
function loadFixtureData() {
  const filePath = path.join(__dirname, "fixture-complete.json");
  const fixtureData = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return fixtureData.raceEntries;
}

// Evaluate each horse and assign a score
function evaluateHorses(horses) {
  return horses.map((horse) => {
    let score = 0;

    // BHA Rating (assuming 100 is top rating - adjust based on actual data)
    score += (horse.bhaRating / 100) * 3; // Weight this criterion by 3

    // Age (assuming optimal age is between 4 and 7)
    if (horse.age >= 4 && horse.age <= 7) score += 2;

    // Form (count recent '1's - wins)
    const recentFormScore = (horse.formType.match(/1/g) || []).length;
    score += recentFormScore * 1.5; // Weight recent wins more

    // Normalize score to be out of 10
    const normalizedScore = (score / 6.5) * 10; // Adjust normalization factor based on criteria weights

    return {
      ...horse,
      score: normalizedScore.toFixed(2),
    };
  });
}

// Sort horses by score and pick top 3
function pickTopHorses(horses) {
  const evaluatedHorses = evaluateHorses(horses);
  evaluatedHorses.sort((a, b) => b.score - a.score);
  return evaluatedHorses.slice(0, 3);
}

// Load, evaluate, and pick top 3 horses
const horses = loadFixtureData();
const topHorses = pickTopHorses(horses);
"Top 3 Horses:", topHorses;

// This function assumes the horseData and jockeyData are arrays of past performances
// with 'result' fields indicating the position finished (1 for win).

function refineScoresWithHistoricalData(horses) {
  return horses.map((horse) => {
    if (!horse.horseData || !horse.jockeyData) return horse; // Skip if no historical data

    // Calculate horse win rate
    const horseWins = horse.horseData.filter(
      (race) => race.result === "1"
    ).length;
    const horseWinRate = horseWins / horse.horseData.length;

    // Calculate jockey win rate
    const jockeyWins = horse.jockeyData.filter(
      (race) => race.result === "1"
    ).length;
    const jockeyWinRate = jockeyWins / horse.jockeyData.length;

    // Adjust score based on win rates
    const adjustedScore =
      parseFloat(horse.score) + (horseWinRate + jockeyWinRate) * 5; // Simple adjustment

    return {
      ...horse,
      score: adjustedScore.toFixed(2),
    };
  });
}

// Refine and pick top 3 horses with historical data
const refinedHorses = refineScoresWithHistoricalData(topHorses);
const refinedTopHorses = pickTopHorses(refinedHorses);
// console.log("Refined Top 3 Horses:", refinedTopHorses);

// Function to print top 3 horses in the specified format
function printTopHorses(horses, title) {
  console.log(title);
  horses.forEach((horse, index) => {
    console.log(`${index + 1}: ${horse.horseName} (${horse.score})`);
  });
  console.log(); // Add a blank line for better readability
}

// Assuming topHorses and refinedTopHorses are the arrays of top 3 horses from previous steps

// Print the initial handicap based on the fixture data
printTopHorses(topHorses, "Handicap");

// Print the refined top 3 horses incorporating historical data under "Trending"
printTopHorses(refinedTopHorses, "Trending");
