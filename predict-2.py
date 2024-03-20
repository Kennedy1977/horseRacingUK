import pandas as pd
import json
import os
import numpy as np

def process_json_to_df(directory_path):
    all_races = []
    for filename in os.listdir(directory_path):
        if filename.endswith('.json'):
            file_path = os.path.join(directory_path, filename)
            with open(file_path, 'r') as file:
                data = json.load(file)
                for race in data:
                    for horse in race['horses']:
                        # Basic race information
                        race_info = {
                            'RaceName': race['NAME'],
                            'RaceDistance': race['DISTANCE'],
                            'RaceClass': race['details'].get('Race Class:', 'N/A'),
                            'RaceGoing': race['details'].get('Race Going:', 'N/A'),
                            'HorseAge': race['details'].get('Horse Age:', 'N/A'),
                            'RaceRating': race['details'].get('Rating:', 'N/A'),
                            'MinWeight': race['details'].get('Min Weight:', 'N/A'),
                            'RiderType': race['details'].get('Rider Type:', 'N/A'),
                        }

                        # Horse-specific information
                        horse_info = {
                            'Position': horse.get('POS', 'N/A'),
                            'HorseName': horse['HORSE/JOCKEY'].split('\n')[0],
                            'JockeyName': horse['HORSE/JOCKEY'].split('\n')[1],
                            'Handicap': horse['HORSE/JOCKEY'].split('Handicap Ran Off:')[1].split('\n')[0] if 'Handicap Ran Off:' in horse['HORSE/JOCKEY'] else 'N/A',
                            'PerformanceFigure': horse['HORSE/JOCKEY'].split('BHA Performance Figure:')[1] if 'BHA Performance Figure:' in horse['HORSE/JOCKEY'] else 'N/A',
                            'TrainerOwner': horse.get('TRAINER/OWNER', 'N/A'),
                            'DistanceTime': horse.get('DISTANCES/TIMES', 'N/A'),
                            'SP': horse.get('SP', 'N/A'),
                        }

                        # Combine the information and add to the list
                        horse_data = {**race_info, **horse_info}
                        all_races.append(horse_data)
    
    # Create a DataFrame
    df = pd.DataFrame(all_races)
    return df

# Usage
directory_path = './_completed_data'
df_horses = process_json_to_df(directory_path)

# Display the first few rows of the dataframe
print(df_horses.head())

