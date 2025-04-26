import pandas as pd
from dotenv import load_dotenv
import os

#load enviroment variables
load_dotenv()

#change file path to slective path in .env file
df = pd.read_csv(os.getenv("ALL_PLAYERS_DATASET_FILEPATH"))

#drop the career game counter column
df.drop(columns=["Gcar"], inplace=True)

#remove duplicate header rows
df = df[df['Date'] != 'Date']

print(df.head())