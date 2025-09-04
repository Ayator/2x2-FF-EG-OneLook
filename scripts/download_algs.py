import json
import requests
import os

def downloadFilesFromJSON(jsonFile):
	with open(jsonFile, 'r') as f:
		sets = json.load(f)

    # Ensure the images folder exists
	os.makedirs("../first_face_algs_svg", exist_ok=True)

	for s in sets:
		setName = s['setName']
		for i, subset in enumerate(s['subsets']):
			for j, alg in enumerate(subset):
				c = alg['case']
				url = ''.join(alg['url'])
				fmt = alg['format']
				filename = f"../first_face_algs_svg/{setName} [{i}][{j}] = {c}.{fmt}"
				print(filename)
				print(url)
				response = requests.get(url)
				response.raise_for_status()
				with open(filename, 'wb') as outFile:
					outFile.write(response.content)

downloadFilesFromJSON('algs_numbers.json')