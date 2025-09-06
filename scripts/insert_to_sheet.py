import re
import gspread
from google.oauth2.service_account import Credentials
import urllib.parse
import requests
import time

mapGroupToRow = {
    "TCLL+":            3,
    "TCLL-":            6,
    "LS-123":         9,
    "LS-456":         16,
    "LS-789":         23,
    "DD-Bar":         30,
    "UD-1MoveD":    37,
    "UD-3MoveD":    50,
    "UU-2Up":        63,
    "UU-1Up":        68,
    "UU-0Up":        81,
    "DD-NoBar":      96
}

def filename_to_cell(filename):
    # Example filename: "UU-1Up[4][3]=U2L2F'L'UL.png"
    match = re.match(r"^(.*?)\[(\d+)\]\[(\d+)\]=", filename)
    if not match:
        raise ValueError(f"Filename does not match expected pattern: {filename}")
    group, i, j = match.group(1), int(match.group(2)), int(match.group(3))
    base_row = mapGroupToRow[group]
    row = base_row + i * 2
    column = ord('B') + j * 2  # B=66, D=68, F=70, H=72
    column = chr(column)
    return f"{column}{row}"

def insert_images_to_sheet(filenames = None):
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    creds = Credentials.from_service_account_file('../.secure/service_account.json', scopes=SCOPES)
    client = gspread.authorize(creds)

    sheet = client.open_by_key('1V16uBJmKXKz_2y6ZnAWTsWBr1czWmj5Z_dnmkapD_vI').worksheet('First Face')
        
    raw_base = "https://raw.githubusercontent.com/Ayator/2x2-FF-EG-OneLook/main/first_face_algs_png/"
    if filenames is None:
        api_url = "https://api.github.com/repos/Ayator/2x2-FF-EG-OneLook/contents/first_face_algs_png"
        response = requests.get(api_url)
        files = response.json()
        filenames = [file['name'] for file in files]

    for filename in filenames:
        encoded_filename = urllib.parse.quote(filename, safe="'")
        png_url = raw_base + encoded_filename
        
        cell = filename_to_cell(filename)
        formula = f'=IMAGE("{png_url}")'
        sheet.update(cell, [[formula]], value_input_option='USER_ENTERED')
        print(f"Updated {cell} with image {filename}")
        time.sleep(1)  # To respect GitHub API rate limits

if __name__ == "__main__":
    insert_images_to_sheet()