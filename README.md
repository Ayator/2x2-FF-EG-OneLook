***
# 2x2-FF-EG-OneLook Algorithm Sheet Generator

This repository provides tools to download, convert, and automatically insert algorithm images for the 2x2 First Face EG One-Look method into a Google Sheet. It is intended for speedcubers, programmers, or educators working with algorithm sets and visual representations.

## Features

- **Download SVG Images**: Automatically downloads algorithm visualizations in SVG format based on input from a structured JSON file.
- **Convert SVG to PNG**: Batch converts all SVG images to PNG using Inkscape for use in environments where SVG is unsupported.
- **Automated Google Sheets Insertion**: Inserts images into a Google Sheet, mapping logical filenames to grid positions using custom algorithms.

## File Overview

| File                       | Purpose                                                        |
|----------------------------|----------------------------------------------------------------|
| `algs_numbers.json`        | Algorithm sets, each with cases and parameters for image URLs [3] |
| `download_algs.py`         | Downloads SVG images for each algorithm defined in the JSON file [4] |
| `svg_to_png.py`            | Converts SVG images to PNG format using the Inkscape CLI [2] |
| `insert_to_sheet.py`       | Inserts PNG images into specific cells of a Google Sheet with formula mapping [1] |

## Workflow

### 1. Download Algorithm SVGs

Ensure you have Python 3 and required libraries installed (requests, os).  
Run:

```bash
python download_algs.py
```

Downloads SVG images into the `first_face_algs_svg` directory.

### 2. Convert SVGs to PNGs

Requires [Inkscape](https://inkscape.org/) installed and accessible via the command line.

```bash
python svg_to_png.py
```

Creates PNG copies in the `first_face_algs_png` directory.

### 3. Insert Images to Google Sheets

Requires a valid Google Cloud service account JSON and [gspread](https://github.com/burnash/gspread) installed.

- Place your service account JSON in a secure directory (`../.secure/service_account.json`).
- Edit the sheet key and worksheet name in `insert_to_sheet.py` if necessary.

Run:

```bash
python insert_to_sheet.py
```

Images will be inserted into mapped cells of the sheet using the `=IMAGE(url)` formula.

## Requirements

- Python 3
- Modules: requests, gspread, google-auth, json
- Service account JSON file for Google Sheets API
- Inkscape (for SVG-to-PNG conversion)

## Customizing

- Update `algs_numbers.json` to add or modify algorithm sets, cases, or visualization URLs.
- Modify `filename_to_cell()` logic in `insert_to_sheet.py` to change mapping schemes.

## License

MIT License unless otherwise stated.

## Credits

- Algorithm JSON structure and naming logic © Ayator
- Visualizations powered by VisualCube

***
