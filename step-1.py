import pandas as pd
import json
import os
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

def load_json_files(directory_path):
    all_races_data = []
    processed_files_count = 0

    for filename in os.listdir(directory_path):
        if filename.endswith('.json'):
            with open(os.path.join(directory_path, filename), 'r') as file:
                races = json.load(file)
                for race in races:
                    race_data = extract_race_data(race)
                    all_races_data.extend(race_data)
                processed_files_count += 1

    print(f"Processed {processed_files_count} files.")
    return pd.DataFrame(all_races_data)

def extract_race_data(race):
    race_details = race.get('details', {})
    race_info = {
        'TIME': race.get('TIME', 'N/A'),
        'NAME': race.get('NAME', 'N/A'),
        'DISTANCE': race.get('DISTANCE', 'N/A'),
        'WINNER': race.get('WINNER', 'N/A'),
        'URL': race.get('URL', 'N/A'),
        'Runners': race_details.get('Runners:', 'N/A'),
        'Prize Money': race_details.get('Prize Money:', 'N/A'),
        'Race Distance': race_details.get('Race Distance:', 'N/A'),
        'Race Going': race_details.get('Race Going:', 'N/A'),
        'Horse Age': race_details.get('Horse Age:', 'N/A'),
        'Rating': race_details.get('Rating:', 'N/A'),
        'Min Weight': race_details.get('Min Weight:', 'N/A'),
        'Rider Type': race_details.get('Rider Type:', 'N/A')
    }

    horses_data = []
    for horse in race.get('horses', []):
        horse_data = extract_horse_data(horse)
        horses_data.append({**race_info, **horse_data})
    
    return horses_data

def extract_horse_data(horse):
    return {
        'POS': horse.get('POS', 'N/A'),
        'Horse/Jockey': horse.get('HORSE/JOCKEY', 'N/A'),
        'Trainer/Owner': horse.get('TRAINER/OWNER', 'N/A'),
        'Distances/Times': horse.get('DISTANCES/TIMES', 'N/A'),
        'SP': horse.get('SP', 'N/A')
    }

def preprocess_dataframe(df):
    df.replace('N/A', np.nan, inplace=True)
    df['Min Weight'] = pd.to_numeric(df['Min Weight'].str.extract(r'(\d+)')[0], errors='coerce')
    df['Rating'] = pd.to_numeric(df['Rating'].str.split('-').str[0], errors='coerce')
    df.fillna(df.mean(numeric_only=True), inplace=True)
    df.fillna('Unknown', inplace=True)
    return df

def save_to_csv(df, filename):
    df.to_csv(filename, index=False)
    print(f"Data saved to {filename}")

# Main processing function
def main():
    directory_path = './_completed_data'
    df = load_json_files(directory_path)
    df = preprocess_dataframe(df)
    save_to_csv(df, 'processed_data.csv')
    
    # Further model training and prediction steps could be added here

if __name__ == '__main__':
    main()
