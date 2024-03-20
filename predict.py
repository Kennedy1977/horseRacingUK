import glob
import json
import pandas as pd

def safe_extract(dictionary, keys, default="N/A"):
    """Extract value from nested dictionary or return default if not found."""
    assert isinstance(keys, list), "keys must be provided as a list"
    temp_dict = dictionary
    for key in keys:
        try:
            temp_dict = temp_dict[key]
        except (KeyError, TypeError):
            return default
    return temp_dict

def load_and_process_json_files(directory_path):
    file_paths = glob.glob(f"{directory_path}/*.json")  # Ensure this matches your JSON files
    print(f"Found {len(file_paths)} files")  # Debug print to check file count
    all_races_data = {}  # Corrected: Initialize as dict

    files_processed = 0
    for file_path in file_paths:
        with open(file_path, 'r') as file:
            data = json.load(file)
            files_processed += 1
            # Process each race
            for race in data:
                race_details = race.get("details", {})
                rider_type = race_details.get("Rider Type:", "N/A")
                
                # Initialize the category if not exists
                if rider_type not in all_races_data:
                    all_races_data[rider_type] = []
                
                # Basic race information
                race_data = {
                    "Time": race.get("TIME", "N/A"),
                    "Name": race.get("NAME", "N/A"),
                    "Distance": race.get("DISTANCE", "N/A"),
                    "Winner": race.get("WINNER", "N/A"),
                    "URL": race.get("URL", "N/A"),
                    # Details
                    "Runners": race_details.get("Runners:", "N/A"),
                    "Prize Money": race_details.get("Prize Money:", "N/A"),
                    "Race Distance": race_details.get("Race Distance:", "N/A"),
                    "Race Going": race_details.get("Race Going:", "N/A"),
                    "Horse Age": race_details.get("Horse Age:", "N/A"),
                    "Rating": race_details.get("Rating:", "N/A"),
                    "Min Weight": race_details.get("Min Weight:", "N/A")
                }

                # Process each horse within the race
                for horse in race.get("horses", []):
                    horse_data = {**race_data,
                                  "Position": horse.get("POS", "N/A"),
                                  "Horse/Jockey": horse.get("HORSE/JOCKEY", "N/A"),
                                  "Trainer/Owner": horse.get("TRAINER/OWNER", "N/A"),
                                  "Distances/Times": horse.get("DISTANCES/TIMES", "N/A"),
                                  "SP": horse.get("SP", "N/A")}
                    all_races_data[rider_type].append(horse_data)

    print(f"Processed {files_processed} files.")
    return {rider_type: pd.DataFrame(data) for rider_type, data in all_races_data.items()}

# Example use
directory_path = './_completed_data'  # Adjust this path as necessary
df_dict = load_and_process_json_files(directory_path)

# Example on how to access a specific category, for example 'APPRENTICE':
if 'APPRENTICE' in df_dict:
    print(df_dict['APPRENTICE'].head())
else:
    print("No APPRENTICE data found.")
