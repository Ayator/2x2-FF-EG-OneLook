import re
import gspread
from google.oauth2.service_account import Credentials
import urllib.parse
import requests
import time
import algorithm_manager

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
    print(filename, match)
    if not match:
        raise ValueError(f"Filename does not match expected pattern: {filename}")
    group, i, j = match.group(1), int(match.group(2)), int(match.group(3))
    print(group, i, j)
    base_row = mapGroupToRow[group]
    row = base_row + i * 2
    column = ord('A') + j * 2  # A=65, C=67, E=69, G=71
    column = chr(column)
    return f"{column}{row}"

def increment_row(cell):
    col = cell[0]
    row = int(cell[1:])
    new_row = row + 1
    return f"{col}{new_row}"

def increment_column(cell):
    col = cell[0]
    row = cell[1:]
    new_col = chr(ord(col) + 1)
    return f"{new_col}{row}"

def insert_image_url_into_cell(sheet, cell, url):
    formula = f'=IMAGE("{url}")'
    sheet.update(cell, [[formula]], value_input_option='USER_ENTERED')
    print(f"Updated {cell} with image {url}")
    time.sleep(1.1)  # To respect GitHub API rate limits

def insert_text_into_cell(sheet, cell, text):
    sheet.update(cell, [[text]], value_input_option='USER_ENTERED')
    print(f"Updated {cell} with text {text}")
    time.sleep(1.1)  # To respect GitHub API rate limits

def insert_images_to_sheet(filenames = None):
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    creds = Credentials.from_service_account_file('../.secure/service_account.json', scopes=SCOPES)
    client = gspread.authorize(creds)
    sheet = client.open_by_key('1V16uBJmKXKz_2y6ZnAWTsWBr1czWmj5Z_dnmkapD_vI').worksheet('First Face')
        
    case_base = "https://raw.githubusercontent.com/Ayator/2x2-FF-EG-OneLook/main/first_face_case_png/"
    alg_base = "https://raw.githubusercontent.com/Ayator/2x2-FF-EG-OneLook/main/first_face_algs_png/"
    
    # If no filenames provided, fetch all PNG filenames from the GitHub repository
    # the files generated in first_face_case_png and first_face_algs_png should match
    if filenames is None:
        api_url = "https://api.github.com/repos/Ayator/2x2-FF-EG-OneLook/contents/first_face_algs_png"
        response = requests.get(api_url)
        files = response.json()
        filenames = [file['name'] for file in files]

    for filename in filenames:
        encoded_filename = urllib.parse.quote(filename, safe="'")
        
        # URL for case and algorithm images
        case_png_url = case_base + encoded_filename
        alg_png_url = alg_base + encoded_filename

        # Extract algorithm from filename
        match = re.search(r"=(.*)\.png$", filename)
        if not match:
            print(f"Filename does not match expected pattern: {filename}")
            continue
        raw_algorithm = match.group(1)
        solution_alg = algorithm_manager.format_algorithm_string(raw_algorithm)
        setup_alg = algorithm_manager.invert_algorithm(solution_alg)

        # Determine cell positions
        case_cell = filename_to_cell(filename)
        alg_cell = increment_column(case_cell)
        setup_cell = increment_row(case_cell)
        algorithm_cell = increment_row(alg_cell)

        # Insert images and algorithms
        insert_image_url_into_cell(sheet, case_cell, case_png_url)
        insert_image_url_into_cell(sheet, alg_cell, alg_png_url)
        insert_text_into_cell(sheet, setup_cell, setup_alg)
        insert_text_into_cell(sheet, algorithm_cell, solution_alg)



if __name__ == "__main__":
    insert_images_to_sheet()