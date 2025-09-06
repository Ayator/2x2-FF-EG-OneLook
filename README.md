***

# 2x2-FF-EG-OneLook

A fully-automated pipeline to generate, convert, upload, and document 2x2x2 Rubik’s Cube "first face" algorithms—complete with labeled diagrams, case images, and multiple algorithmic transformations—all inserted into a Google Sheet.

## Overview

This project automates the process of:
- Generating SVG images for all cube cases and their algorithms.
- Converting SVGs to PNGs.
- Committing/ pushing to a Git repo or uploading to Google Drive.
- Inserting links and readable algorithm text into a shared Google Sheet.
- Supporting move string manipulation utilities like inverse, rotations, and mirrors.

Algorithms and cases are specified in `algs_numbers.json`. Image generation is done with a local visualcube server, and output is managed for both algorithm (labeled) and case (plain) images.

***

## Directory Structure

```
./scripts
├── algs_numbers.json         # List of algorithm cases, case moves, and labels
├── algorithm_manager.py      # Move formatting and transformation utilities (inversion, rotations, mirrors)
├── download_algs.py          # Downloads and saves SVG images for algorithms and cases
├── svg_to_png.py             # Batch converts SVGs to PNGs using Inkscape
├── git_commit_and_push.py    # Commits and pushes all generated images (git workflow)
├── upload_to_gdrive.py       # Uploads PNGs to Google Drive and outputs their IDs (optional)
├── insert_to_sheet.py        # Inserts images and formatted text to a Google Sheet
├── main.py                   # Orchestrates the entire workflow
```

***

## Pipeline Steps

1. **Generate Images:**  
   Run `download_algs.py` to fetch SVGs for all cases and algorithms from the local visualcube server.
2. **Convert SVG to PNG:**  
   Use `svg_to_png.py` to batch-convert SVGs to PNGs for both labeled (algorithm) and plain (case) images.
3. **Commit/Push or Upload:**  
   - Use `git_commit_and_push.py` to add, commit, and push new/updated images to your git repository, or  
   - Use `upload_to_gdrive.py` to upload PNGs to your Google Drive folder.
4. **Insert into Google Sheet:**  
   Run `insert_to_sheet.py` to update the Google Sheet with:
   - Case images and algorithm diagrams positioned side-by-side.
   - Readable algorithm (spaced) and its inverse (setup move) under each image.
5. **Customize/Extend:**  
   Algorithm transformations (rotation, mirror, inversion, etc.) are available via `algorithm_manager.py` for use anywhere in the workflow.

***

## Key Scripts

### `download_algs.py`
- Reads `algs_numbers.json` and generates both labeled (with arrows, labels) and case (plain) SVGs from your visualcube server.
- Files are organized by type and group for easy access.

### `svg_to_png.py`
- Converts all SVG files to PNG format using Inkscape.
- Ensures all images are ready for web/sheet embedding.

### `git_commit_and_push.py`
- Commits all new/changed `.svg` and `.png` files.
- Skips commit/push if there are no changes.

### `upload_to_gdrive.py`
- Uploads new PNG files to a Google Drive folder and returns a mapping of file IDs for public use.

### `insert_to_sheet.py`
- Authenticates with Google Sheets.
- Inserts both types of images (side-by-side), readable algorithm, and its inverse under the appropriate images.
- Handles cell positioning, rate limits, and reporting.

### `algorithm_manager.py`
- Provides utilities for:
  - Formatting algorithms (inserting spaces).
  - Inverting algorithms.
  - Rotations: x, y, z.
  - Mirroring: L/R, U/D, F/B.
  - Applying transformations to whole algorithms.

***

## How to Use

1. **Install requirements:**  
   - Python 3.x  
   - Inkscape (for svg to png conversion)  
   - Required Python packages: `gspread`, `google-api-python-client`, and `google-auth`
   - Access to a running local visualcube server

2. **Configure Google/Drive:**  
   - Place your Google API service account JSON in `.secure/` as `service_account.json`.

3. **Populate/modify `algs_numbers.json` as desired.**

4. **Run the workflow:**
   - Single command:
     ```sh
     python main.py
     ```
     Or customize/set selection in `main.py` or individual scripts.

***

## Credits & Thanks

- **visualcube**: For rendering high-quality cube images.
- **cube.rider.biz**: For online algorithm transformation reference.
- **Google APIs**: For public Sheets and Drive integration.
- **CubeRoot**: For source of many first face algorithms.

***

## License

MIT.

***

**Project maintained by Victor Ayala.**  
For issues, contact via GitHub or email.

***
