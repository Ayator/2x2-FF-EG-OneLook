import json
import requests
import os

def build_case_url(alg, arw):
    return (
        f"http://localhost/visualcube.php"
        f"?fmt=svg"
        f"&size=500"
        f"&view=plan"
        f"&pzl=2"
        f"&bg=t"
        f"&sch=yogwrb"
        f"&alg={alg}"
        f"&arw={arw}"
    )

def download_svgs_from_json(json_file, output_folder):
    with open(json_file, 'r') as f:
        files = json.load(f)

    os.makedirs(output_folder, exist_ok=True)
    downloaded_filenames = []

    for entry in files:
        filename = entry["filename"]
        alg = entry["alg"]
        arw = entry["arw"]
        url = build_case_url(alg, arw)
        filepath = os.path.join(output_folder, f"{filename}.svg")

        print(f"Downloading: {filename} from {url}")
        response = requests.get(url)
        response.raise_for_status()

        with open(filepath, 'wb') as outFile:
            outFile.write(response.content)
        downloaded_filenames.append(filename)
        
    return downloaded_filenames

# Example usage
if __name__ == "__main__":
    download_svgs_from_json(
        "../assets/eg_cases.json",         # Path to your JSON file
        "../assets/eg_cases"     # Output folder for SVGs
    )
