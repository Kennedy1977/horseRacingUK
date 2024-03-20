import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import make_pipeline

# Function to convert fractional odds to probability
def convert_odds_to_probability(odds):
    try:
        if '/' in odds:  # Fractional odds like "2/1"
            numerator, denominator = map(float, odds.split('/'))
            probability = denominator / (numerator + denominator)
            return probability
        else:
            return None  # Or handle differently
    except Exception as e:
        # print(f"Error processing odds '{odds}': {e}")
        return None

# Function to convert DISTANCE from a string format to meters
def distance_to_meters(distance_str):
    """
    Converts a distance string in furlongs and yards to meters.
    E.g., '7f 122y' -> meters
    """
    furlong_to_meter = 201.168
    yard_to_meter = 0.9144
    meters = 0
    
    try:
        if 'f' in distance_str:
            parts = distance_str.split('f')
            furlongs = int(parts[0])
            meters += furlongs * furlong_to_meter
            if len(parts) > 1 and 'y' in parts[1]:
                yards = int(parts[1].split('y')[0])
                meters += yards * yard_to_meter
        elif 'y' in distance_str:
            yards = int(distance_str.split('y')[0])
            meters += yards * yard_to_meter
        else:
            meters = None  # or some default value if needed
    except ValueError as e:
        # print(f"Error converting distance '{distance_str}': {e}")
        meters = None
    
    return meters

# Preprocess data including new adjustments
def preprocess_data(df):
    # Convert 'SP' to probability
    df['Implied_Prob'] = df['SP'].apply(convert_odds_to_probability)
    
    # Convert POS to a binary target variable: 1 for top 3 finishers, 0 otherwise
    df['Target'] = df['POS'].apply(lambda x: 1 if x in ['1st', '2nd', '3rd'] else 0)
    
    # Convert 'DISTANCE' to meters
    df['DISTANCE'] = df['DISTANCE'].apply(distance_to_meters)
    
    # Handle missing values
    df.fillna(df.mean(), inplace=True)
    
    # Features selection
    features = ['DISTANCE', 'Rating', 'Min Weight', 'Implied_Prob']
    X = df[features]
    y = df['Target']
    
    return X, y

def main():
    # Load the dataset
    df = pd.read_csv('processed_data.csv')
    
    # Preprocess data
    X, y = preprocess_data(df)
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Define preprocessing for numeric columns (scale them)
    numeric_features = ['DISTANCE', 'Rating', 'Min Weight', 'Implied_Prob']
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='mean')),
        ('scaler', StandardScaler())])
    
    # Combine preprocessing steps
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features)])
    
    # Create preprocessing and training pipeline
    model = make_pipeline(
        SMOTE(random_state=42),
        preprocessor,
        RandomForestClassifier(random_state=42))
    
    # Train the model
    model.fit(X_train, y_train)
    
    # Predictions
    predictions = model.predict(X_test)
    
    # Evaluation
    print(classification_report(y_test, predictions))

if __name__ == "__main__":
    main()
