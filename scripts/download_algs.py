import json
import requests
import os
import re

def get_arw_from_lab(lab):
	if lab == "":
		return ""
	# Match indices and color from lab string
	match = re.match(r"([A-Z]\d)([A-Z]\d)([A-Z]\d)", lab)
	if not match:
		raise ValueError(f"Unexpected LAB format: {lab}")
	first, second, third = match.groups()
	return f"{first}{third}{second}"

def build_algorithm_url(c, arw, lab):
    return (
        f"http://localhost/visualcube.php"
        f"?fmt=svg"
        f"&size=500"
        f"&pzl=2"
        f"&cc=l"
        f"&co=20"
        f"&sch=nttytt"
        f"&r=y30x-30"
        f"&bg=t"
        f"&case={c}"
        f"&arw={arw}-yellow"
        f"&lab={lab}-white"
    )

def build_case_url(c):
    return (
        f"http://localhost/visualcube.php"
        f"?fmt=svg"
        f"&size=500"
        f"&pzl=2"
        f"&cc=l"
        f"&co=20"
        f"&sch=tttytt"
        f"&r=y30x-30"
        f"&bg=t"
        f"&case={c}"
    )
	

def downloadFilesFromJSON(jsonFile, algFilePath, caseFilePath, onlySets = None, row = None, col = None):
	with open(jsonFile, 'r') as f:
		sets = json.load(f)

    # Ensure the images folders exists
	os.makedirs(algFilePath, exist_ok=True)
	os.makedirs(caseFilePath, exist_ok=True)

	filenames = []
	for s in sets:
		setName = s['setName']
		if onlySets is not None and setName not in onlySets:
			continue
		print(f"Downloading set: {setName}")

		for i, subset in enumerate(s['subsets']):
			if row is not None and i != row:
				continue
			for j, alg in enumerate(subset):
				if col is not None and j != col:
					continue
				c = alg['case']
				lab = alg['lab']
				arw = get_arw_from_lab(lab)
				
			    # Construct URL using defaults and computed arw/lab
				algUrl = build_algorithm_url(c, arw, lab)
				caseUrl = build_case_url(c)

				filename = f"{setName}[{i}][{j}]={c}.svg"
				algFilepath = f"{algFilePath}/{filename}"
				caseFilepath = f"{caseFilePath}/{filename}"

				print(filename)
				print(algFilepath)
				print(caseFilepath)
				# Download and save the SVG files
				# Algorithm image
				response = requests.get(algUrl)
				response.raise_for_status()
				with open(algFilepath, 'wb') as outFile:
					outFile.write(response.content)
				# Case image
				response = requests.get(caseUrl)
				response.raise_for_status()
				with open(caseFilepath, 'wb') as outFile:
					outFile.write(response.content)
				
				filenames.append(filename)
	return filenames

if __name__ == "__main__":
	downloadFilesFromJSON(
        '../assets/algs_numbers.json',
        "../assets/first_face_algs_svg",
        "../assets/first_face_case_svg"
    )