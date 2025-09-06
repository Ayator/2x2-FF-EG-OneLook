import json
import requests
import os

def downloadFilesFromJSON(jsonFile, onlySets = None, row = None, col = None):
	with open(jsonFile, 'r') as f:
		sets = json.load(f)

    # Ensure the images folder exists
	os.makedirs("../first_face_algs_svg", exist_ok=True)

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
				url = ''.join(alg['url'])
				fmt = alg['format']
				filename = f"{setName}[{i}][{j}]={c}.{fmt}"
				filepath = f"../first_face_algs_svg/{filename}"
				print(filename)
				print(url)
				response = requests.get(url)
				response.raise_for_status()
				with open(filepath, 'wb') as outFile:
					outFile.write(response.content)
				filenames.append(filename)
	return filenames

if __name__ == "__main__":
	downloadFilesFromJSON('algs_numbers.json')