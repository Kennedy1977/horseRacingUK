const fs = require("fs");
const path = require("path");

// Load the fixture-complete.json file
const filePath = path.join(__dirname, "fixture-complete.json");
const rawData = fs.readFileSync(filePath);
const fixtureData = JSON.parse(rawData);

function evaluateHorsePerformance(horse) {
  let score = 0;

  // Performance Metrics (40%)
  const formScore = horse.formType.includes("1") ? 10 : 0; // Simplified for demo purposes
  const bhaRating = parseInt(horse.bhaRating, 10);
  const bhaRatingScore = isNaN(bhaRating) ? 0 : (bhaRating / 100) * 40; // Normalize BHA rating to a 0-40 scale
  score += formScore + bhaRatingScore;

  // Jockey/Trainer Success Rate (20%)
  const jockeyData = Array.isArray(horse.jockeyData) ? horse.jockeyData : [];
  const trainerData = Array.isArray(horse.trainerData) ? horse.trainerData : [];
  const jockeyWins = jockeyData.filter((j) => j.result.includes("1")).length;
  const trainerWins = trainerData.filter((t) => t.result.includes("1")).length;
  const jockeyTrainerScore = (jockeyWins + trainerWins) * 2; // Assuming a win adds 2 points for simplification
  score += jockeyTrainerScore * 0.2;

  // Pedigree (20%)
  // This example doesn't have direct data on pedigree influencing race suitability, so we'll skip this part

  // Recent Workouts and Physical Condition (10%)
  // Assuming recent win (in the last 3 races) indicates good physical condition
  const recentWins =
    jockeyData.slice(0, 3).filter((j) => j.result.includes("1")).length +
    trainerData.slice(0, 3).filter((t) => t.result.includes("1")).length;
  const conditionScore = recentWins > 0 ? 10 : 0;
  score += conditionScore * 0.1;

  // Market Sentiment (10%)
  // Without direct access to shifts in betting odds, this will be skipped

  return score;
}

// Score each horse in the race
const scoredHorses = fixtureData.raceEntries.map((horse) => {
  return {
    ...horse,
    score: evaluateHorsePerformance(horse),
  };
});

// Sort horses by score to find top 3
const top3Horses = scoredHorses.sort((a, b) => b.score - a.score).slice(0, 3);

console.log("Top 3 Horses Based on Score:");
top3Horses.forEach((horse, index) => {
  console.log(
    `${index + 1}: ${horse.horseName} (Score: ${horse.score.toFixed(2)})`
  );
});

function predictHorsePerformance(raceEntries) {
  // Adjust scoring criteria
  const scores = raceEntries.map((entry) => {
    let score = 0;
    const { horseName, bhaRating, weight, jockeyData, formType } = entry;

    // Ensure that the horse has bhaRating and weight available before proceeding
    if (!bhaRating || !weight) {
      return { horseName, score: "N/A" }; // Return N/A score if essential info is missing
    }

    // Emphasize recent performance and include weight as a factor
    const weightParts = weight.split("st ");
    const weightInPounds =
      parseInt(weightParts[0]) * 14 + parseInt(weightParts[1]);
    const weightAdjustment = weightInPounds / 20; // Simplified weight impact
    const bhaRatingAdjustment = parseInt(bhaRating) / 10; // Simplified rating impact

    // Recent form
    const recentFormScore = formType.includes("1") ? 20 : 0; // Recent win

    score += bhaRatingAdjustment + weightAdjustment + recentFormScore;

    // Adjust based on the number of races and their outcomes in the jockeyData, if available
    const raceOutcomeScore = jockeyData
      ? jockeyData.reduce((acc, race) => {
          const result = parseInt(race.result.split(" ")[0]);
          if (result === 1) {
            // Win
            return acc + 30;
          } else if (result <= 3) {
            // Top 3 finish
            return acc + 15;
          } else if (result > 3) {
            // Participation
            return acc + 5;
          }
          return acc;
        }, 0)
      : 0;

    score += raceOutcomeScore;

    return { horseName, score: score.toFixed(2) };
  });

  // Filter out entries with N/A scores, then sort by score in descending order to get top horses
  const filteredScores = scores.filter((entry) => entry.score !== "N/A");
  filteredScores.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

  // Output top 3 horses based on score
  console.log("Top 3 Horses based on Enhanced Score:");
  filteredScores.slice(0, 3).forEach((entry, index) => {
    console.log(`${index + 1}: ${entry.horseName} (Score: ${entry.score})`);
  });
}

// Assuming raceEntries is the array of horse entries from the provided race data
predictHorsePerformance(fixtureData.raceEntries);

function scoreEntries(entries) {
  // Initialize sums and counts for averaging
  let horseScoreSum = 0,
    jockeyScoreSum = 0,
    trainerScoreSum = 0;
  let horseCount = 0,
    jockeyCount = 0,
    trainerCount = 0;

  // First pass: Sum scores and count entries for each category
  entries.forEach((entry) => {
    if (entry.horseData && entry.horseData.length > 0) {
      horseScoreSum += calculateHorseScore(entry.horseData); // Implement this based on your scoring criteria
      horseCount++;
    }
    if (entry.jockeyData && entry.jockeyData.length > 0) {
      jockeyScoreSum += calculateJockeyScore(entry.jockeyData); // Implement this
      jockeyCount++;
    }
    if (entry.trainerData && entry.trainerData.length > 0) {
      trainerScoreSum += calculateTrainerScore(entry.trainerData); // Implement this
      trainerCount++;
    }
  });

  // Calculate averages
  const averageHorseScore = horseScoreSum / horseCount;
  const averageJockeyScore = jockeyScoreSum / jockeyCount;
  const averageTrainerScore = trainerScoreSum / trainerCount;

  // Second pass: Apply scores, using averages for missing data
  const scoredEntries = entries.map((entry) => {
    const horseScore =
      entry.horseData && entry.horseData.length > 0
        ? calculateHorseScore(entry.horseData)
        : averageHorseScore;
    const jockeyScore =
      entry.jockeyData && entry.jockeyData.length > 0
        ? calculateJockeyScore(entry.jockeyData)
        : averageJockeyScore;
    const trainerScore =
      entry.trainerData && entry.trainerData.length > 0
        ? calculateTrainerScore(entry.trainerData)
        : averageTrainerScore;

    // Sum scores for total score
    const totalScore = horseScore + jockeyScore + trainerScore;
    return { ...entry, totalScore };
  });

  // Sort by total score descending and return top 3 entries
  return scoredEntries.sort((a, b) => b.totalScore - a.totalScore).slice(0, 3);
}

// Example stub functions for score calculations - implement based on your criteria
function calculateHorseScore(horseData) {
  return horseData.length; // Placeholder implementation
}

function calculateJockeyScore(jockeyData) {
  return jockeyData.length; // Placeholder implementation
}

function calculateTrainerScore(trainerData) {
  return trainerData.length; // Placeholder implementation
}
// After defining the scoreEntries function with the proper logic
const top3Entries = scoreEntries(fixtureData.raceEntries);

console.log("Top 3 Entries based on scores:");
top3Entries.forEach((entry, index) => {
  console.log(
    `${index + 1}: ${entry.horseName} (Score: ${entry.totalScore.toFixed(2)})`
  );
});
