import re
import gspread
from google.oauth2.service_account import Credentials
import json
import urllib.parse
import requests
import time

string_to_int = {
    "TCLL+":            3,
    "TCLL-":            6,
    "LS - 123":         9,
    "LS - 456":         16,
    "LS - 789":         23,
    "DD - Bar":         30,
    "UD - 1 Move D":    37,
    "UD - 3 Move D":    50,
    "UU - 2 Up":        63,
    "UU - 1 Up":        68,
    "UU - 0 Up":        81,
    "DD - No Bar":      96
}

col_map = {0: "B", 1: "D", 2: "F", 3: "H"}

def filename_to_cell(filename):
    # Example filename: "UU - 1 Up [4][3] = U2L2F'L'UL.png"
    match = re.match(r"^(.*?) \[(\d+)\]\[(\d+)\]", filename)
    if not match:
        raise ValueError(f"Filename does not match expected pattern: {filename}")
    group, i, j = match.group(1), int(match.group(2)), int(match.group(3))
    base_row = string_to_int[group]
    row = base_row + i * 2
    column = col_map[j]
    return f"{column}{row}"

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
creds = Credentials.from_service_account_file('../.secure/service_account.json', scopes=SCOPES)
client = gspread.authorize(creds)

sheet = client.open_by_key('1V16uBJmKXKz_2y6ZnAWTsWBr1czWmj5Z_dnmkapD_vI').worksheet('First Face')

api_url = "https://api.github.com/repos/Ayator/2x2-FF-EG-OneLook/contents/first_face_algs_png"
response = requests.get(api_url)
files = response.json()

for file in files:
    filename = file['name']
    download_url = file['download_url']
    cell = filename_to_cell(filename)
    formula = f'=IMAGE("{download_url}")'
    sheet.update(cell, [[formula]], value_input_option='USER_ENTERED')
    print(f"Updated {cell} with image {filename}")
    time.sleep(1)  # To respect GitHub API rate limits
